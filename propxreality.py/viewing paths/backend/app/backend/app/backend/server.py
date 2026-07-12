
Action: file_editor create /app/backend/server.py --file-text "from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / \".env\")

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# -------------------- Setup --------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(\"propxreality\")

mongo_url = os.environ[\"MONGO_URL\"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ[\"DB_NAME\"]]

app = FastAPI(title=\"PropxReality API\")
api = APIRouter(prefix=\"/api\")

JWT_ALGORITHM = \"HS256\"


def get_jwt_secret() -> str:
    return os.environ[\"JWT_SECRET\"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(\"utf-8\"), bcrypt.gensalt()).decode(\"utf-8\")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(\"utf-8\"), hashed.encode(\"utf-8\"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        \"sub\": user_id,
        \"email\": email,
        \"exp\": datetime.now(timezone.utc) + timedelta(days=7),
        \"type\": \"access\",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


# -------------------- Models --------------------
class User(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = \"user\"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RegisterIn(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    token: str
    user: User


PropertyPurpose = Literal[\"rent\", \"buy\", \"pg\"]
PropertyType = Literal[\"pg\", \"gated_flat\", \"independent_house\", \"builder_floor\", \"resale_flat\"]
Audience = Literal[\"students\", \"family\", \"professionals\", \"anyone\"]


class Property(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    purpose: PropertyPurpose
    property_type: PropertyType
    audience: Audience = \"anyone\"
    price: int  # monthly rent OR sale price
    deposit: Optional[int] = None
    bhk: Optional[str] = None  # \"1RK\",\"1BHK\",\"2BHK\",\"3BHK\",\"4BHK+\"
    furnishing: Optional[str] = None  # furnished / semi / unfurnished
    area_sqft: Optional[int] = None
    bathrooms: Optional[int] = None
    locality: str
    city: str = \"Bangalore\"
    address: Optional[str] = None
    amenities: List[str] = []
    images: List[str] = []
    gender_preference: Optional[str] = None  # for PG: male/female/coed
    available_from: Optional[str] = None
    owner_name: str
    owner_phone: str
    owner_email: Optional[str] = None
    featured: bool = False
    verified: bool = False
    listed_by: Optional[str] = None  # user id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PropertyCreate(BaseModel):
    title: str
    description: str
    purpose: PropertyPurpose
    property_type: PropertyType
    audience: Audience = \"anyone\"
    price: int
    deposit: Optional[int] = None
    bhk: Optional[str] = None
    furnishing: Optional[str] = None
    area_sqft: Optional[int] = None
    bathrooms: Optional[int] = None
    locality: str
    city: str = \"Bangalore\"
    address: Optional[str] = None
    amenities: List[str] = []
    images: List[str] = []
    gender_preference: Optional[str] = None
    available_from: Optional[str] = None
    owner_name: str
    owner_phone: str
    owner_email: Optional[str] = None


class Inquiry(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_id: str
    name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryCreate(BaseModel):
    property_id: str
    name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None


# -------------------- Helpers --------------------
def user_public(doc: dict) -> User:
    return User(
        id=doc[\"id\"],
        email=doc[\"email\"],
        name=doc.get(\"name\", \"\"),
        phone=doc.get(\"phone\"),
        role=doc.get(\"role\", \"user\"),
        created_at=doc.get(\"created_at\", datetime.now(timezone.utc)),
    )


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get(\"Authorization\", \"\")
    if not auth.startswith(\"Bearer \"):
        raise HTTPException(status_code=401, detail=\"Not authenticated\")
    token = auth[7:]
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=\"Token expired\")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=\"Invalid token\")
    user = await db.users.find_one({\"id\": payload[\"sub\"]}, {\"_id\": 0})
    if not user:
        raise HTTPException(status_code=401, detail=\"User not found\")
    user.pop(\"password_hash\", None)
    return user


def serialize_datetimes(doc: dict) -> dict:
    out = {}
    for k, v in doc.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def deserialize_property(doc: dict) -> dict:
    doc.pop(\"_id\", None)
    doc.pop(\"password_hash\", None)
    if isinstance(doc.get(\"created_at\"), str):
        try:
            doc[\"created_at\"] = datetime.fromisoformat(doc[\"created_at\"])
        except Exception:
            pass
    return doc


# -------------------- Auth Endpoints --------------------
@api.post(\"/auth/register\", response_model=AuthOut)
async def register(payload: RegisterIn):
    email = payload.email.lower().strip()
    if await db.users.find_one({\"email\": email}):
        raise HTTPException(status_code=400, detail=\"Email already registered\")
    user = User(email=email, name=payload.name, phone=payload.phone)
    doc = serialize_datetimes(user.model_dump())
    doc[\"password_hash\"] = hash_password(payload.password)
    await db.users.insert_one(doc)
    token = create_access_token(user.id, user.email)
    return AuthOut(token=token, user=user)


@api.post(\"/auth/login\", response_model=AuthOut)
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    doc = await db.users.find_one({\"email\": email})
    if not doc or not verify_password(payload.password, doc.get(\"password_hash\", \"\")):
        raise HTTPException(status_code=401, detail=\"Invalid email or password\")
    doc = deserialize_property(doc)
    user = user_public(doc)
    token = create_access_token(user.id, user.email)
    return AuthOut(token=token, user=user)


@api.get(\"/auth/me\", response_model=User)
async def me(current_user: dict = Depends(get_current_user)):
    return user_public(deserialize_property(current_user))


# -------------------- Properties --------------------
@api.get(\"/properties\", response_model=List[Property])
async def list_properties(
    purpose: Optional[str] = None,
    property_type: Optional[str] = None,
    audience: Optional[str] = None,
    locality: Optional[str] = None,
    city: Optional[str] = None,
    bhk: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    featured: Optional[bool] = None,
    q: Optional[str] = None,
    limit: int = Query(50, le=200),
):
    query: dict = {}
    if purpose:
        query[\"purpose\"] = purpose
    if property_type:
        query[\"property_type\"] = property_type
    if audience and audience != \"anyone\":
        query[\"$or\"] = [{\"audience\": audience}, {\"audience\": \"anyone\"}]
    if locality:
        query[\"locality\"] = {\"$regex\": locality, \"$options\": \"i\"}
    if city:
        query[\"city\"] = {\"$regex\": f\"^{city}$\", \"$options\": \"i\"}
    if bhk:
        query[\"bhk\"] = bhk
    if min_price is not None or max_price is not None:
        price_q = {}
        if min_price is not None:
            price_q[\"$gte\"] = min_price
        if max_price is not None:
            price_q[\"$lte\"] = max_price
        query[\"price\"] = price_q
    if featured is not None:
        query[\"featured\"] = featured
    if q:
        rx = {\"$regex\": q, \"$options\": \"i\"}
        query[\"$or\"] = query.get(\"$or\", []) + [
            {\"title\": rx},
            {\"locality\": rx},
            {\"description\": rx},
        ]

    cursor = db.properties.find(query, {\"_id\": 0}).sort(\"created_at\", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [Property(**deserialize_property(d)) for d in docs]


@api.get(\"/properties/{prop_id}\", response_model=Property)
async def get_property(prop_id: str):
    doc = await db.properties.find_one({\"id\": prop_id}, {\"_id\": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=\"Property not found\")
    return Property(**deserialize_property(doc))


@api.post(\"/properties\", response_model=Property)
async def create_property(payload: PropertyCreate, current_user: dict = Depends(get_current_user)):
    prop = Property(**payload.model_dump(), listed_by=current_user[\"id\"])
    doc = serialize_datetimes(prop.model_dump())
    await db.properties.insert_one(doc)
    return prop


@api.get(\"/localities\", response_model=List[str])
async def localities():
    return [
        \"Koramangala\", \"HSR Layout\", \"Indiranagar\", \"Whitefield\", \"Marathahalli\",
        \"Bellandur\", \"Electronic City\", \"Jayanagar\", \"JP Nagar\", \"BTM Layout\",
        \"Sarjapur Road\", \"Hebbal\", \"Yelahanka\", \"Banashankari\", \"Rajajinagar\",
        \"Malleshwaram\", \"MG Road\",
    ]


# -------------------- Inquiries --------------------
@api.post(\"/inquiries\", response_model=Inquiry)
async def create_inquiry(payload: InquiryCreate):
    prop = await db.properties.find_one({\"id\": payload.property_id})
    if not prop:
        raise HTTPException(status_code=404, detail=\"Property not found\")
    inq = Inquiry(**payload.model_dump())
    await db.inquiries.insert_one(serialize_datetimes(inq.model_dump()))
    return inq


# -------------------- Health --------------------
@api.get(\"/\")
async def root():
    return {\"service\": \"PropxReality API\", \"status\": \"ok\"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get(\"CORS_ORIGINS\", \"*\").split(\",\"),
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)


# -------------------- Seed data --------------------
SEED_PROPERTIES: List[dict] = [
    {
        \"title\": \"Sunlit 2BHK in Koramangala 4th Block\",
        \"description\": \"Bright, airy 2BHK in a quiet gated society, 5 min walk from Sony World signal. Modular kitchen, wooden flooring in bedrooms, semi-furnished with wardrobes and geysers.\",
        \"purpose\": \"rent\", \"property_type\": \"gated_flat\", \"audience\": \"family\",
        \"price\": 42000, \"deposit\": 210000, \"bhk\": \"2BHK\",
        \"furnishing\": \"Semi-furnished\", \"area_sqft\": 1180, \"bathrooms\": 2,
        \"locality\": \"Koramangala\",
        \"amenities\": [\"Lift\", \"Covered Parking\", \"24x7 Security\", \"Power Backup\", \"Gym\", \"Kids Play Area\"],
        \"images\": [
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
            \"https://images.unsplash.com/photo-1617201929478-8eedff7508f9\",
        ],
        \"owner_name\": \"Ravi K.\", \"owner_phone\": \"+91 98765 43210\",
        \"featured\": True, \"verified\": True,
    },
    {
        \"title\": \"Cozy Single-Occupancy PG for Women near HSR\",
        \"description\": \"Fully furnished PG with AC rooms, home-cooked meals thrice a day, weekly housekeeping and daily biometric attendance. Working women only.\",
        \"purpose\": \"pg\", \"property_type\": \"pg\", \"audience\": \"professionals\",
        \"price\": 14500, \"deposit\": 29000, \"bhk\": \"1RK\",
        \"furnishing\": \"Fully furnished\", \"locality\": \"HSR Layout\",
        \"gender_preference\": \"Female\",
        \"amenities\": [\"WiFi\", \"AC\", \"Meals Included\", \"Laundry\", \"CCTV\", \"Housekeeping\"],
        \"images\": [
            \"https://images.unsplash.com/photo-1772471586681-8dba94c41ff7\",
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
        ],
        \"owner_name\": \"Meera Homes\", \"owner_phone\": \"+91 90000 11223\",
        \"featured\": True, \"verified\": True,
    },
    {
        \"title\": \"Independent 3BHK House with Terrace, Indiranagar\",
        \"description\": \"Full independent floor with private terrace, ideal for family. Located on a quiet 40-ft road, walkable to CMH Road cafes and 100ft Road pubs.\",
        \"purpose\": \"rent\", \"property_type\": \"independent_house\", \"audience\": \"family\",
        \"price\": 68000, \"deposit\": 340000, \"bhk\": \"3BHK\",
        \"furnishing\": \"Unfurnished\", \"area_sqft\": 1650, \"bathrooms\": 3,
        \"locality\": \"Indiranagar\",
        \"amenities\": [\"Private Terrace\", \"Car Parking\", \"Pet Friendly\", \"Piped Gas\"],
        \"images\": [
            \"https://images.pexels.com/photos/15422346/pexels-photo-15422346.jpeg\",
            \"https://images.unsplash.com/photo-1758687126877-b37052a20a4d\",
        ],
        \"owner_name\": \"Sunita Rao\", \"owner_phone\": \"+91 99887 76655\",
        \"featured\": True, \"verified\": True,
    },
    {
        \"title\": \"Modern 1BHK Studio near Manyata Tech Park\",
        \"description\": \"Perfect for a working professional — semi-furnished 1BHK with modular kitchen, split AC, and 24x7 water supply. 10 min drive to Manyata Tech Park.\",
        \"purpose\": \"rent\", \"property_type\": \"gated_flat\", \"audience\": \"professionals\",
        \"price\": 22000, \"deposit\": 66000, \"bhk\": \"1BHK\",
        \"furnishing\": \"Semi-furnished\", \"area_sqft\": 620, \"bathrooms\": 1,
        \"locality\": \"Hebbal\",
        \"amenities\": [\"Lift\", \"Gym\", \"Swimming Pool\", \"Parking\", \"Clubhouse\"],
        \"images\": [
            \"https://images.unsplash.com/photo-1617201929478-8eedff7508f9\",
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
        ],
        \"owner_name\": \"Aditya P.\", \"owner_phone\": \"+91 88997 66554\",
        \"featured\": False, \"verified\": True,
    },
    {
        \"title\": \"Resale 3BHK in Sobha Dream Acres, Balagere\",
        \"description\": \"Well-maintained 3BHK in a premium township with sports club, olympic pool, and lush landscaping. Corner unit, east-facing, unobstructed view.\",
        \"purpose\": \"buy\", \"property_type\": \"resale_flat\", \"audience\": \"family\",
        \"price\": 14500000, \"bhk\": \"3BHK\",
        \"furnishing\": \"Semi-furnished\", \"area_sqft\": 1580, \"bathrooms\": 3,
        \"locality\": \"Whitefield\",
        \"amenities\": [\"Swimming Pool\", \"Clubhouse\", \"Tennis Court\", \"Kids Play Area\", \"24x7 Security\"],
        \"images\": [
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
            \"https://images.pexels.com/photos/15422346/pexels-photo-15422346.jpeg\",
        ],
        \"owner_name\": \"Prashant M.\", \"owner_phone\": \"+91 97777 88888\",
        \"featured\": True, \"verified\": True,
    },
    {
        \"title\": \"Triple-Sharing PG for Students in BTM 2nd Stage\",
        \"description\": \"Affordable, clean and safe PG for college students. Walking distance from Christ Deemed University shuttle. Includes veg meals, WiFi and study desk.\",
        \"purpose\": \"pg\", \"property_type\": \"pg\", \"audience\": \"students\",
        \"price\": 8500, \"deposit\": 17000, \"bhk\": \"1RK\",
        \"furnishing\": \"Fully furnished\", \"locality\": \"BTM Layout\",
        \"gender_preference\": \"Male\",
        \"amenities\": [\"WiFi\", \"Meals Included\", \"Study Desk\", \"Warden\", \"CCTV\"],
        \"images\": [
            \"https://images.unsplash.com/photo-1772471586681-8dba94c41ff7\",
            \"https://images.unsplash.com/photo-1617201929478-8eedff7508f9\",
        ],
        \"owner_name\": \"Nagesh PG\", \"owner_phone\": \"+91 90202 30303\",
        \"featured\": False, \"verified\": True,
    },
    {
        \"title\": \"Builder Floor 2BHK in Jayanagar 4th Block\",
        \"description\": \"Independent builder floor on the first level of a private residence. Quiet, tree-lined street. Ideal for a small family or a professional couple.\",
        \"purpose\": \"rent\", \"property_type\": \"builder_floor\", \"audience\": \"family\",
        \"price\": 32000, \"deposit\": 128000, \"bhk\": \"2BHK\",
        \"furnishing\": \"Semi-furnished\", \"area_sqft\": 950, \"bathrooms\": 2,
        \"locality\": \"Jayanagar\",
        \"amenities\": [\"Covered Parking\", \"Piped Gas\", \"Balcony\", \"Pet Friendly\"],
        \"images\": [
            \"https://images.pexels.com/photos/15422346/pexels-photo-15422346.jpeg\",
            \"https://images.unsplash.com/photo-1758687126877-b37052a20a4d\",
        ],
        \"owner_name\": \"Latha S.\", \"owner_phone\": \"+91 90909 20202\",
        \"featured\": False, \"verified\": True,
    },
    {
        \"title\": \"Spacious 3BHK on Sarjapur Road for Rent\",
        \"description\": \"3BHK in a premium gated society with clubhouse, swimming pool and jogging track. Great connectivity to ORR, Whitefield and Electronic City.\",
        \"purpose\": \"rent\", \"property_type\": \"gated_flat\", \"audience\": \"family\",
        \"price\": 55000, \"deposit\": 275000, \"bhk\": \"3BHK\",
        \"furnishing\": \"Semi-furnished\", \"area_sqft\": 1720, \"bathrooms\": 3,
        \"locality\": \"Sarjapur Road\",
        \"amenities\": [\"Swimming Pool\", \"Gym\", \"Clubhouse\", \"Play Area\", \"Parking\"],
        \"images\": [
            \"https://images.unsplash.com/photo-1617201929478-8eedff7508f9\",
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
        ],
        \"owner_name\": \"Rohan D.\", \"owner_phone\": \"+91 99123 45678\",
        \"featured\": True, \"verified\": True,
    },
    {
        \"title\": \"Studio Apartment for Working Professionals, Marathahalli\",
        \"description\": \"Compact, modern studio near ORR — 15 min ride to Bellandur/Whitefield tech parks. Fully furnished with washing machine, microwave and smart TV.\",
        \"purpose\": \"rent\", \"property_type\": \"gated_flat\", \"audience\": \"professionals\",
        \"price\": 18500, \"deposit\": 55500, \"bhk\": \"1RK\",
        \"furnishing\": \"Fully furnished\", \"area_sqft\": 480, \"bathrooms\": 1,
        \"locality\": \"Marathahalli\",
        \"amenities\": [\"WiFi Ready\", \"Washing Machine\", \"Smart TV\", \"Power Backup\", \"Lift\"],
        \"images\": [
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
            \"https://images.unsplash.com/photo-1617201929478-8eedff7508f9\",
        ],
        \"owner_name\": \"Nithya R.\", \"owner_phone\": \"+91 90112 33445\",
        \"featured\": False, \"verified\": True,
    },
    {
        \"title\": \"Resale 2BHK Villa in Yelahanka New Town\",
        \"description\": \"Charming duplex villa in a well-established community. Private garden, dedicated parking. Perfect for a small family looking for tranquility.\",
        \"purpose\": \"buy\", \"property_type\": \"independent_house\", \"audience\": \"family\",
        \"price\": 9800000, \"bhk\": \"2BHK\",
        \"furnishing\": \"Unfurnished\", \"area_sqft\": 1250, \"bathrooms\": 2,
        \"locality\": \"Yelahanka\",
        \"amenities\": [\"Private Garden\", \"Car Parking\", \"Gated Community\", \"Piped Gas\"],
        \"images\": [
            \"https://images.pexels.com/photos/15422346/pexels-photo-15422346.jpeg\",
            \"https://images.unsplash.com/photo-1758687126877-b37052a20a4d\",
        ],
        \"owner_name\": \"Kiran Bhat\", \"owner_phone\": \"+91 90000 55555\",
        \"featured\": False, \"verified\": True,
    },
    {
        \"title\": \"Co-ed PG near Electronic City, All Meals Included\",
        \"description\": \"New-age co-living style PG for young professionals working in EC Phase 1 & 2. Curated common lounge, gaming room, weekly community events.\",
        \"purpose\": \"pg\", \"property_type\": \"pg\", \"audience\": \"professionals\",
        \"price\": 12500, \"deposit\": 25000, \"bhk\": \"1RK\",
        \"furnishing\": \"Fully furnished\", \"locality\": \"Electronic City\",
        \"gender_preference\": \"Co-ed\",
        \"amenities\": [\"WiFi\", \"Meals Included\", \"Gaming Room\", \"Laundry\", \"Housekeeping\", \"AC\"],
        \"images\": [
            \"https://images.unsplash.com/photo-1772471586681-8dba94c41ff7\",
            \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\",
        ],
        \"owner_name\": \"Nest Living\", \"owner_phone\": \"+91 96666 77777\",
        \"featured\": True, \"verified\": True,
    },
    {
        \"title\": \"Independent House with 4 Rooms — JP Nagar\",
        \"description\": \"Full independent house available. Ground + 1 floor with 4 spacious rooms, 3 bathrooms, private car park and a small garden. Ideal for a large family.\",
        \"purpose\": \"rent\", \"property_type\": \"independent_house\", \"audience\": \"family\",
        \"price\": 78000, \"deposit\": 390000, \"bhk\": \"4BHK+\",
        \"furnishing\": \"Unfurnished\", \"area_sqft\": 2200, \"bathrooms\": 3,
        \"locality\": \"JP Nagar\",
        \"amenities\": [\"Garden\", \"Car Parking\", \"Piped Gas\", \"Bore Well\", \"Sun Terrace\"],
        \"images\": [
            \"https://images.pexels.com/photos/15422346/pexels-photo-15422346.jpeg\",
            \"https://images.unsplash.com/photo-1758687126877-b37052a20a4d\",
        ],
        \"owner_name\": \"Ganesh V.\", \"owner_phone\": \"+91 91234 56780\",
        \"featured\": False, \"verified\": True,
    },
]


async def seed_admin_and_properties():
    # Indexes
    await db.users.create_index(\"email\", unique=True)
    await db.users.create_index(\"id\", unique=True)
    await db.properties.create_index(\"id\", unique=True)
    await db.properties.create_index(\"locality\")
    await db.properties.create_index(\"purpose\")
    await db.properties.create_index(\"property_type\")

    # Seed admin
    admin_email = os.environ.get(\"ADMIN_EMAIL\", \"admin@propxreality.com\").lower()
    admin_password = os.environ.get(\"ADMIN_PASSWORD\", \"Admin@123\")
    existing = await db.users.find_one({\"email\": admin_email})
    if not existing:
        admin = User(email=admin_email, name=\"PropxReality Admin\", role=\"admin\")
        doc = serialize_datetimes(admin.model_dump())
        doc[\"password_hash\"] = hash_password(admin_password)
        await db.users.insert_one(doc)
        logger.info(f\"Seeded admin user: {admin_email}\")
    else:
        # keep password in sync with env
        if not verify_password(admin_password, existing.get(\"password_hash\", \"\")):
            await db.users.update_one(
                {\"email\": admin_email},
                {\"$set\": {\"password_hash\": hash_password(admin_password)}},
            )

    # Seed properties (idempotent by title)
    existing_titles = set()
    async for doc in db.properties.find({}, {\"title\": 1, \"_id\": 0}):
        existing_titles.add(doc.get(\"title\"))
    to_insert = []
    for p in SEED_PROPERTIES:
        if p[\"title\"] in existing_titles:
            continue
        prop = Property(**p, listed_by=\"seed\")
        to_insert.append(serialize_datetimes(prop.model_dump()))
    if to_insert:
        await db.properties.insert_many(to_insert)
        logger.info(f\"Seeded {len(to_insert)} properties\")


@app.on_event(\"startup\")
async def on_startup():
    try:
        await seed_admin_and_properties()
    except Exception as e:
        logger.exception(f\"Startup seeding failed: {e}\")


@app.on_event(\"shutdown\")
async def on_shutdown():
    client.close()
"

Action: file_editor create /app/memory/test_credentials.md --file-text "# PropxReality — Test Credentials

## Admin
- Email: `admin@propxreality.com`
- Password: `Admin@123`
- Role: `admin`

## Test User
Register a new one via `/signup` or POST `/api/auth/register` with:
```json
{ \"email\": \"test@user.com\", \"name\": \"Test User\", \"phone\": \"+91 90000 00000\", \"password\": \"Test@1234\" }
```

## Auth Endpoints
- POST `/api/auth/register` – returns `{ token, user }`
- POST `/api/auth/login` – returns `{ token, user }`
- GET  `/api/auth/me` – Bearer token required

Frontend stores token in `localStorage` under key `propx_token` and sends `Authorization: Bearer <token>`.
"

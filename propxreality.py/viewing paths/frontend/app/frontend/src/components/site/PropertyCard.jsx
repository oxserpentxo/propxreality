
"import React from \"react\";
import { Link } from \"react-router-dom\";
import { MapPin, BedDouble, Ruler, ShieldCheck } from \"lucide-react\";
import { INR } from \"@/lib/api\";

const typeLabel = {
  pg: \"PG\",
  gated_flat: \"Gated Flat\",
  independent_house: \"Independent House\",
  builder_floor: \"Builder Floor\",
  resale_flat: \"Resale Flat\",
};

export default function PropertyCard({ property }) {
  const img = property.images?.[0] || \"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\";
  return (
    <Link
      to={`/property/${property.id}`}
      className=\"card-lift group block bg-white rounded-3xl border border-[#eae5dc] overflow-hidden\"
      data-testid={`property-card-${property.id}`}
    >
      <div className=\"relative aspect-[4/3] overflow-hidden bg-[#f4f1eb]\">
        <img
          src={img}
          alt={property.title}
          className=\"card-img w-full h-full object-cover\"
          loading=\"lazy\"
        />
        <div className=\"absolute top-3 left-3 flex gap-2\">
          <span className=\"px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e8dcc4] text-[#22332a]\">
            {typeLabel[property.property_type] || property.property_type}
          </span>
          {property.verified && (
            <span className=\"px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dce2da] text-[#2c4c3b] inline-flex items-center gap-1\">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
        </div>
        <div className=\"absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-sm font-semibold text-[#22332a] shadow-sm\">
          {INR(property.price)}
          {property.purpose !== \"buy\" && <span className=\"text-[#7b827d] text-xs\"> /mo</span>}
        </div>
      </div>
      <div className=\"p-6\">
        <h3 className=\"font-display text-lg leading-snug text-[#22332a] group-hover:text-[#c15c3d] transition-colors line-clamp-2\">
          {property.title}
        </h3>
        <div className=\"mt-2 flex items-center gap-1.5 text-sm text-[#7b827d]\">
          <MapPin size={14} className=\"text-[#c15c3d]\" />
          <span>{property.locality}, {property.city}</span>
        </div>
        <div className=\"mt-4 flex items-center gap-5 text-xs text-[#4a4f4a]\">
          {property.bhk && (
            <span className=\"inline-flex items-center gap-1.5\">
              <BedDouble size={14} /> {property.bhk}
            </span>
          )}
          {property.area_sqft && (
            <span className=\"inline-flex items-center gap-1.5\">
              <Ruler size={14} /> {property.area_sqft} sq.ft
            </span>
          )}
          {property.furnishing && (
            <span className=\"hidden sm:inline text-[#7b827d]\">{property.furnishing}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
"

 "import React, { useState } from \"react\";
import { useNavigate, Link } from \"react-router-dom\";
import { useAuth } from \"@/context/AuthContext\";
import { api, formatApiErrorDetail, PROPERTY_TYPES, PURPOSES, AUDIENCES, BHK_OPTIONS } from \"@/lib/api\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Textarea } from \"@/components/ui/textarea\";
import { Label } from \"@/components/ui/label\";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";
import { toast } from \"sonner\";
import { PlusCircle, X, Home } from \"lucide-react\";

const AMENITY_SUGGESTIONS = [
  \"WiFi\", \"Lift\", \"Covered Parking\", \"Power Backup\", \"Gym\", \"Swimming Pool\",
  \"24x7 Security\", \"Kids Play Area\", \"Meals Included\", \"AC\", \"Laundry\",
  \"Housekeeping\", \"Clubhouse\", \"Pet Friendly\", \"Piped Gas\", \"Balcony\",
];

export default function ListProperty() {
  const { user, checked } = useAuth();
  const navigate = useNavigate();

  const [f, setF] = useState({
    title: \"\", description: \"\",
    purpose: \"rent\", property_type: \"gated_flat\", audience: \"anyone\",
    price: \"\", deposit: \"\", bhk: \"2BHK\", furnishing: \"Semi-furnished\",
    area_sqft: \"\", bathrooms: \"\",
    locality: \"\", city: \"Bangalore\", address: \"\",
    gender_preference: \"\",
    owner_name: user?.name || \"\", owner_phone: user?.phone || \"\", owner_email: user?.email || \"\",
    images: [\"\"],
    amenities: [],
  });
  const [loading, setLoading] = useState(false);

  if (checked && !user) {
    return (
      <div className=\"max-w-xl mx-auto text-center py-24\">
        <div className=\"font-display text-3xl\">Log in to list your property</div>
        <p className=\"mt-3 text-[#4a4f4a]\">Create an owner account or log in — it takes 30 seconds.</p>
        <div className=\"mt-8 flex gap-3 justify-center\">
          <Link to=\"/login\"><Button className=\"rounded-full bg-[#c15c3d] hover:bg-[#a84c30] px-8\" data-testid=\"list-goto-login\">Log in</Button></Link>
          <Link to=\"/signup\"><Button variant=\"outline\" className=\"rounded-full px-8\">Sign up</Button></Link>
        </div>
      </div>
    );
  }

  const update = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const toggleAmenity = (a) => {
    setF((p) => ({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a] }));
  };

  const updateImage = (i, v) => {
    const arr = [...f.images];
    arr[i] = v;
    setF({ ...f, images: arr });
  };

  const addImage = () => setF({ ...f, images: [...f.images, \"\"] });
  const removeImage = (i) => setF({ ...f, images: f.images.filter((_, x) => x !== i) });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...f,
        price: Number(f.price),
        deposit: f.deposit ? Number(f.deposit) : null,
        area_sqft: f.area_sqft ? Number(f.area_sqft) : null,
        bathrooms: f.bathrooms ? Number(f.bathrooms) : null,
        images: f.images.filter(Boolean),
      };
      const { data } = await api.post(\"/properties\", payload);
      toast.success(\"Property listed!\");
      navigate(`/property/${data.id}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || \"Failed to list property\");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"max-w-4xl mx-auto px-6 lg:px-10 py-10\">
      <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">List a property</div>
      <h1 className=\"mt-3 font-display text-4xl sm:text-5xl tracking-tight\">Reach thousands of Bangalore renters & buyers.</h1>
      <p className=\"mt-3 text-[#4a4f4a] max-w-2xl\">Fill in the details below. You can always edit later. First-month listing fee is on us.</p>

      <form onSubmit={submit} className=\"mt-10 space-y-8\" data-testid=\"list-property-form\">
        <Section icon={Home} title=\"Basic details\">
          <Row>
            <Field label=\"Title\">
              <Input required placeholder=\"e.g. Sunlit 2BHK in Koramangala 4th Block\" value={f.title} onChange={(e) => update(\"title\", e.target.value)} data-testid=\"list-title\" />
            </Field>
          </Row>
          <Row>
            <Field label=\"Description\">
              <Textarea required rows={4} placeholder=\"Describe the home — layout, neighbourhood, unique details…\" value={f.description} onChange={(e) => update(\"description\", e.target.value)} data-testid=\"list-description\" />
            </Field>
          </Row>
          <Row cols={3}>
            <Field label=\"Purpose\">
              <Select value={f.purpose} onValueChange={(v) => update(\"purpose\", v)}>
                <SelectTrigger data-testid=\"list-purpose\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PURPOSES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label=\"Property type\">
              <Select value={f.property_type} onValueChange={(v) => update(\"property_type\", v)}>
                <SelectTrigger data-testid=\"list-type\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label=\"Best suited for\">
              <Select value={f.audience} onValueChange={(v) => update(\"audience\", v)}>
                <SelectTrigger data-testid=\"list-audience\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </Row>
        </Section>

        <Section title=\"Pricing & size\">
          <Row cols={4}>
            <Field label={f.purpose === \"buy\" ? \"Sale price (₹)\" : \"Monthly rent (₹)\"}>
              <Input required type=\"number\" min={0} value={f.price} onChange={(e) => update(\"price\", e.target.value)} data-testid=\"list-price\" />
            </Field>
            <Field label=\"Deposit (₹)\">
              <Input type=\"number\" min={0} value={f.deposit} onChange={(e) => update(\"deposit\", e.target.value)} data-testid=\"list-deposit\" />
            </Field>
            <Field label=\"BHK\">
              <Select value={f.bhk} onValueChange={(v) => update(\"bhk\", v)}>
                <SelectTrigger data-testid=\"list-bhk\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BHK_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label=\"Furnishing\">
              <Select value={f.furnishing} onValueChange={(v) => update(\"furnishing\", v)}>
                <SelectTrigger data-testid=\"list-furnishing\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"Fully furnished\">Fully furnished</SelectItem>
                  <SelectItem value=\"Semi-furnished\">Semi-furnished</SelectItem>
                  <SelectItem value=\"Unfurnished\">Unfurnished</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Row>
          <Row cols={3}>
            <Field label=\"Area (sq.ft)\">
              <Input type=\"number\" min={0} value={f.area_sqft} onChange={(e) => update(\"area_sqft\", e.target.value)} data-testid=\"list-area\" />
            </Field>
            <Field label=\"Bathrooms\">
              <Input type=\"number\" min={0} value={f.bathrooms} onChange={(e) => update(\"bathrooms\", e.target.value)} />
            </Field>
            {f.property_type === \"pg\" && (
              <Field label=\"Gender preference\">
                <Select value={f.gender_preference} onValueChange={(v) => update(\"gender_preference\", v)}>
                  <SelectTrigger><SelectValue placeholder=\"Any\" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"Male\">Male</SelectItem>
                    <SelectItem value=\"Female\">Female</SelectItem>
                    <SelectItem value=\"Co-ed\">Co-ed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </Row>
        </Section>

        <Section title=\"Location\">
          <Row cols={2}>
            <Field label=\"Locality\">
              <Input required placeholder=\"e.g. Koramangala\" value={f.locality} onChange={(e) => update(\"locality\", e.target.value)} data-testid=\"list-locality\" />
            </Field>
            <Field label=\"City\">
              <Input value={f.city} onChange={(e) => update(\"city\", e.target.value)} />
            </Field>
          </Row>
          <Row>
            <Field label=\"Full address (optional, kept private)\">
              <Input value={f.address} onChange={(e) => update(\"address\", e.target.value)} />
            </Field>
          </Row>
        </Section>

        <Section title=\"Photos\">
          <p className=\"text-sm text-[#7b827d] -mt-2 mb-3\">Paste image URLs (we'll add photo upload soon).</p>
          {f.images.map((img, i) => (
            <div key={i} className=\"flex gap-2 mb-3\">
              <Input placeholder=\"https://…\" value={img} onChange={(e) => updateImage(i, e.target.value)} data-testid={`list-image-${i}`} />
              {f.images.length > 1 && (
                <Button type=\"button\" variant=\"outline\" onClick={() => removeImage(i)} className=\"rounded-full px-3\"><X size={16} /></Button>
              )}
            </div>
          ))}
          <Button type=\"button\" variant=\"outline\" onClick={addImage} className=\"rounded-full mt-1\"><PlusCircle size={16} className=\"mr-2\" />Add another photo</Button>
        </Section>

        <Section title=\"Amenities\">
          <div className=\"flex flex-wrap gap-2\">
            {AMENITY_SUGGESTIONS.map((a) => {
              const active = f.amenities.includes(a);
              return (
                <button
                  type=\"button\"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${active ? \"bg-[#dce2da] border-[#2c4c3b] text-[#2c4c3b] font-semibold\" : \"bg-white border-[#eae5dc] text-[#4a4f4a] hover:border-[#c15c3d]\"}`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title=\"Contact details (shown on the listing)\">
          <Row cols={3}>
            <Field label=\"Your name\">
              <Input required value={f.owner_name} onChange={(e) => update(\"owner_name\", e.target.value)} data-testid=\"list-owner-name\" />
            </Field>
            <Field label=\"Phone\">
              <Input required value={f.owner_phone} onChange={(e) => update(\"owner_phone\", e.target.value)} data-testid=\"list-owner-phone\" />
            </Field>
            <Field label=\"Email\">
              <Input type=\"email\" value={f.owner_email} onChange={(e) => update(\"owner_email\", e.target.value)} />
            </Field>
          </Row>
        </Section>

        <div className=\"flex justify-end gap-3\">
          <Button type=\"button\" variant=\"outline\" className=\"rounded-full px-6\" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type=\"submit\" disabled={loading} className=\"rounded-full bg-[#c15c3d] hover:bg-[#a84c30] text-white px-8 h-11 text-base font-semibold\" data-testid=\"list-submit\">
            {loading ? \"Publishing…\" : \"Publish listing\"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className=\"bg-white border border-[#eae5dc] rounded-3xl p-6 md:p-8\">
      <div className=\"flex items-center gap-2 mb-5\">
        {Icon && <Icon size={18} className=\"text-[#c15c3d]\" />}
        <h2 className=\"font-display text-xl\">{title}</h2>
      </div>
      <div className=\"space-y-4\">{children}</div>
    </section>
  );
}
function Row({ cols = 1, children }) {
  const map = { 1: \"grid-cols-1\", 2: \"grid-cols-1 md:grid-cols-2\", 3: \"grid-cols-1 md:grid-cols-3\", 4: \"grid-cols-1 md:grid-cols-2 lg:grid-cols-4\" };
  return <div className={`grid ${map[cols]} gap-4`}>{children}</div>;
}
function Field({ label, children }) {
  return (
    <div>
      <Label className=\"text-xs font-semibold uppercase tracking-[0.15em] text-[#7b827d]\">{label}</Label>
      <div className=\"mt-1.5\">{children}</div>
    </div>
  );
}
"

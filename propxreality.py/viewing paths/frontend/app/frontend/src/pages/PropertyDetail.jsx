
"import React, { useEffect, useState } from \"react\";
import { useParams, Link } from \"react-router-dom\";
import { api, INR, formatApiErrorDetail } from \"@/lib/api\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Textarea } from \"@/components/ui/textarea\";
import { Label } from \"@/components/ui/label\";
import { toast } from \"sonner\";
import {
  MapPin, BedDouble, Ruler, ShieldCheck, Bath, Home,
  Phone, Mail, CheckCircle2, ArrowLeft, Calendar,
} from \"lucide-react\";

export default function PropertyDetail() {
  const { id } = useParams();
  const [prop, setProp] = useState(null);
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: \"\", phone: \"\", email: \"\", message: \"\" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`).then((r) => setProp(r.data)).catch(() => setProp(false));
  }, [id]);

  const submitInquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post(\"/inquiries\", { ...form, property_id: id });
      toast.success(\"Inquiry sent! The owner will reach out shortly.\");
      setForm({ name: \"\", phone: \"\", email: \"\", message: \"\" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail) || \"Failed to send\");
    } finally {
      setSending(false);
    }
  };

  if (prop === false) {
    return (
      <div className=\"max-w-3xl mx-auto p-16 text-center\">
        <div className=\"font-display text-3xl\">Property not found</div>
        <Link to=\"/browse\" className=\"text-[#c15c3d] mt-4 inline-block font-semibold\">Back to browse</Link>
      </div>
    );
  }
  if (!prop) {
    return <div className=\"max-w-7xl mx-auto p-10\">Loading…</div>;
  }

  const imgs = prop.images?.length ? prop.images : [\"https://images.pexels.com/photos/30386991/pexels-photo-30386991.jpeg\"];

  return (
    <div className=\"max-w-7xl mx-auto px-6 lg:px-10 py-8\">
      <Link to=\"/browse\" className=\"inline-flex items-center gap-2 text-sm text-[#7b827d] hover:text-[#c15c3d]\" data-testid=\"back-to-browse\">
        <ArrowLeft size={16} /> Back to all listings
      </Link>

      {/* Gallery */}
      <div className=\"mt-4 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-3\">
        <div className=\"relative aspect-[16/10] rounded-3xl overflow-hidden bg-[#f4f1eb] border border-[#eae5dc]\">
          <img src={imgs[active]} alt={prop.title} className=\"w-full h-full object-cover\" />
          {prop.verified && (
            <div className=\"absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#dce2da] text-[#2c4c3b] text-xs font-semibold inline-flex items-center gap-1.5\">
              <ShieldCheck size={13} /> Verified listing
            </div>
          )}
        </div>
        <div className=\"grid grid-cols-3 md:grid-cols-1 gap-3 md:auto-rows-fr\">
          {imgs.slice(0, 4).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-[4/3] rounded-2xl overflow-hidden border ${i === active ? \"border-[#c15c3d] ring-2 ring-[#c15c3d]/30\" : \"border-[#eae5dc]\"}`}
              data-testid={`gallery-thumb-${i}`}
            >
              <img src={src} alt=\"\" className=\"w-full h-full object-cover\" />
            </button>
          ))}
        </div>
      </div>

      <div className=\"mt-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10\">
        <div>
          <div className=\"flex items-center gap-3 flex-wrap\">
            <span className=\"px-3 py-1 rounded-full bg-[#e8dcc4] text-[#22332a] text-xs font-semibold\">{prop.property_type.replace(\"_\", \" \").toUpperCase()}</span>
            <span className=\"px-3 py-1 rounded-full bg-[#dce2da] text-[#2c4c3b] text-xs font-semibold\">{prop.purpose.toUpperCase()}</span>
            {prop.audience && prop.audience !== \"anyone\" && (
              <span className=\"px-3 py-1 rounded-full bg-white border border-[#eae5dc] text-xs font-semibold text-[#4a4f4a]\">
                Best for {prop.audience}
              </span>
            )}
          </div>
          <h1 className=\"font-display text-4xl sm:text-5xl mt-4 leading-tight tracking-tight\">
            {prop.title}
          </h1>
          <div className=\"mt-3 inline-flex items-center gap-1.5 text-[#4a4f4a]\">
            <MapPin size={16} className=\"text-[#c15c3d]\" />
            <span>{prop.locality}, {prop.city}</span>
          </div>

          <div className=\"mt-6 flex items-baseline gap-3 flex-wrap\">
            <div className=\"font-display text-4xl text-[#c15c3d]\">
              {INR(prop.price)}
              {prop.purpose !== \"buy\" && <span className=\"text-lg text-[#7b827d] font-sans font-medium\"> / month</span>}
            </div>
            {prop.deposit && (
              <div className=\"text-sm text-[#7b827d]\">Deposit: <span className=\"font-semibold text-[#22332a]\">{INR(prop.deposit)}</span></div>
            )}
          </div>

          <div className=\"mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3\">
            {prop.bhk && <StatChip icon={BedDouble} label={prop.bhk} />}
            {prop.area_sqft && <StatChip icon={Ruler} label={`${prop.area_sqft} sq.ft`} />}
            {prop.bathrooms && <StatChip icon={Bath} label={`${prop.bathrooms} Baths`} />}
            {prop.furnishing && <StatChip icon={Home} label={prop.furnishing} />}
            {prop.gender_preference && <StatChip icon={CheckCircle2} label={prop.gender_preference} />}
            {prop.available_from && <StatChip icon={Calendar} label={`Avail: ${prop.available_from}`} />}
          </div>

          <div className=\"mt-10\">
            <h2 className=\"font-display text-2xl\">About this home</h2>
            <p className=\"mt-3 text-[#4a4f4a] leading-relaxed whitespace-pre-line\">{prop.description}</p>
          </div>

          {prop.amenities?.length > 0 && (
            <div className=\"mt-10\">
              <h2 className=\"font-display text-2xl\">What's included</h2>
              <div className=\"mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3\">
                {prop.amenities.map((a) => (
                  <div key={a} className=\"flex items-center gap-2.5 text-sm text-[#22332a] bg-white border border-[#eae5dc] rounded-2xl px-4 py-3\">
                    <CheckCircle2 size={16} className=\"text-[#2c4c3b]\" /> {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact / Inquiry */}
        <aside className=\"lg:sticky lg:top-24 h-fit space-y-4\">
          <div className=\"rounded-3xl border border-[#eae5dc] bg-white p-6\">
            <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">Listed by</div>
            <div className=\"mt-3 flex items-center gap-3\">
              <div className=\"h-11 w-11 rounded-full bg-[#2c4c3b] text-white grid place-items-center font-semibold\">
                {prop.owner_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className=\"font-semibold\">{prop.owner_name}</div>
                <div className=\"text-xs text-[#7b827d]\">Owner / Verified partner</div>
              </div>
            </div>
            <a href={`tel:${prop.owner_phone}`} className=\"mt-4 flex items-center gap-2 text-[#22332a] font-medium\">
              <Phone size={16} className=\"text-[#c15c3d]\" /> {prop.owner_phone}
            </a>
            {prop.owner_email && (
              <a href={`mailto:${prop.owner_email}`} className=\"mt-1 flex items-center gap-2 text-[#22332a] font-medium\">
                <Mail size={16} className=\"text-[#c15c3d]\" /> {prop.owner_email}
              </a>
            )}
          </div>

          <form onSubmit={submitInquiry} className=\"rounded-3xl border border-[#eae5dc] bg-white p-6\" data-testid=\"inquiry-form\">
            <div className=\"font-display text-xl\">Interested? Talk to the owner.</div>
            <p className=\"text-xs text-[#7b827d] mt-1\">We'll share your details privately with the owner.</p>
            <div className=\"mt-5 space-y-3\">
              <div>
                <Label htmlFor=\"inq-name\" className=\"text-xs font-semibold uppercase tracking-[0.15em] text-[#7b827d]\">Name</Label>
                <Input id=\"inq-name\" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className=\"mt-1\" data-testid=\"inquiry-name\" />
              </div>
              <div>
                <Label htmlFor=\"inq-phone\" className=\"text-xs font-semibold uppercase tracking-[0.15em] text-[#7b827d]\">Phone</Label>
                <Input id=\"inq-phone\" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className=\"mt-1\" data-testid=\"inquiry-phone\" />
              </div>
              <div>
                <Label htmlFor=\"inq-email\" className=\"text-xs font-semibold uppercase tracking-[0.15em] text-[#7b827d]\">Email (optional)</Label>
                <Input id=\"inq-email\" type=\"email\" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className=\"mt-1\" data-testid=\"inquiry-email\" />
              </div>
              <div>
                <Label htmlFor=\"inq-msg\" className=\"text-xs font-semibold uppercase tracking-[0.15em] text-[#7b827d]\">Message</Label>
                <Textarea id=\"inq-msg\" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className=\"mt-1\" placeholder=\"Hi, I'd like a visit this weekend…\" data-testid=\"inquiry-message\" />
              </div>
            </div>
            <Button
              type=\"submit\"
              disabled={sending}
              className=\"mt-5 w-full rounded-full bg-[#c15c3d] hover:bg-[#a84c30] text-white h-11 text-base font-semibold\"
              data-testid=\"inquiry-submit\"
            >
              {sending ? \"Sending…\" : \"Send inquiry\"}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label }) {
  return (
    <div className=\"rounded-2xl bg-white border border-[#eae5dc] px-4 py-3 flex items-center gap-2.5\">
      <div className=\"h-8 w-8 rounded-xl bg-[#f4f1eb] text-[#2c4c3b] grid place-items-center\">
        <Icon size={15} />
      </div>
      <div className=\"text-sm font-medium text-[#22332a]\">{label}</div>
    </div>
  );
}
"
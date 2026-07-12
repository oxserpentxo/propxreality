 "import React, { useEffect, useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { api } from \"@/lib/api\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from \"@/components/ui/select\";
import PropertyCard from \"@/components/site/PropertyCard\";
import {
  Search, GraduationCap, Users, Briefcase, ShieldCheck,
  Handshake, Sparkles, ArrowRight, MapPin, Star,
} from \"lucide-react\";

const HERO_IMG = \"https://images.unsplash.com/photo-1687158266872-fd2773fa76c6?auto=format&fit=crop&w=2000&q=80\";

const LOCALITIES = [
  \"Koramangala\", \"HSR Layout\", \"Indiranagar\", \"Whitefield\", \"Marathahalli\",
  \"Bellandur\", \"Electronic City\", \"Jayanagar\", \"JP Nagar\", \"BTM Layout\",
  \"Sarjapur Road\", \"Hebbal\", \"Yelahanka\", \"Banashankari\",
];

const PERSONA_IMAGES = {
  family: \"https://images.unsplash.com/photo-1758687126877-b37052a20a4d?auto=format&fit=crop&w=1400&q=80\",
  students: \"https://images.unsplash.com/photo-1772471586681-8dba94c41ff7?auto=format&fit=crop&w=1200&q=80\",
  professionals: \"https://images.unsplash.com/photo-1617201929478-8eedff7508f9?auto=format&fit=crop&w=1200&q=80\",
};

export default function Landing() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState(\"rent\");
  const [propertyType, setPropertyType] = useState(\"any\");
  const [locality, setLocality] = useState(\"\");
  const [budget, setBudget] = useState(\"any\");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get(\"/properties\", { params: { featured: true, limit: 6 } })
      .then((r) => setFeatured(r.data))
      .catch(() => {});
  }, []);

  const submitSearch = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams();
    if (purpose) params.set(\"purpose\", purpose);
    if (propertyType && propertyType !== \"any\") params.set(\"property_type\", propertyType);
    if (locality) params.set(\"locality\", locality);
    if (budget && budget !== \"any\") {
      const [min, max] = budget.split(\"-\");
      if (min) params.set(\"min_price\", min);
      if (max) params.set(\"max_price\", max);
    }
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className=\"relative\">
      {/* HERO */}
      <section className=\"relative\">
        <div className=\"relative h-[720px] md:h-[760px] overflow-hidden\">
          <img
            src={HERO_IMG}
            alt=\"Bangalore skyline\"
            className=\"absolute inset-0 w-full h-full object-cover\"
          />
          <div className=\"absolute inset-0 bg-gradient-to-b from-[#22332a]/80 via-[#22332a]/40 to-[#fdfbf7]\" />
          <div className=\"relative max-w-7xl mx-auto px-6 lg:px-10 pt-20 md:pt-28 lg:pt-32\">
            <div className=\"max-w-3xl\">
              <span
                className=\"inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/30 text-white text-xs font-semibold uppercase tracking-[0.2em] fade-up\"
                data-testid=\"hero-tagline\"
              >
                <Sparkles size={14} /> Bangalore's home-first aggregator
              </span>
              <h1 className=\"font-display mt-6 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-white fade-up delay-1\">
                Find your <em className=\"italic text-[#f0c98d]\">next home</em> — <br className=\"hidden md:block\" />
                without the noise.
              </h1>
              <p className=\"mt-6 text-white/90 text-lg leading-relaxed max-w-2xl fade-up delay-2\">
                PGs, gated society flats, independent houses and resale homes across
                Bangalore — curated, verified and shown with real photos, real rents
                and real people to talk to.
              </p>
            </div>
          </div>

          {/* Floating search */}
          <div className=\"absolute left-1/2 -translate-x-1/2 bottom-[-64px] md:bottom-[-80px] w-[92%] max-w-5xl fade-up delay-3\">
            <form
              onSubmit={submitSearch}
              className=\"bg-white/95 backdrop-blur-xl border border-[#eae5dc] rounded-3xl shadow-[0_30px_60px_-30px_rgba(34,51,42,0.35)] p-3 md:p-4 flex flex-col md:flex-row items-stretch gap-2 md:gap-1\"
              data-testid=\"hero-search-form\"
            >
              <div className=\"flex-1 md:border-r md:border-[#eae5dc] px-3 py-2\">
                <div className=\"text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b827d]\">I want to</div>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className=\"border-0 shadow-none p-0 h-auto text-base font-medium text-[#22332a] focus:ring-0\" data-testid=\"search-purpose\">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"rent\">Rent a home</SelectItem>
                    <SelectItem value=\"buy\">Buy a home</SelectItem>
                    <SelectItem value=\"pg\">Find a PG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=\"flex-1 md:border-r md:border-[#eae5dc] px-3 py-2\">
                <div className=\"text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b827d]\">Type</div>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className=\"border-0 shadow-none p-0 h-auto text-base font-medium text-[#22332a] focus:ring-0\" data-testid=\"search-type\">
                    <SelectValue placeholder=\"Any type\" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"any\">Any type</SelectItem>
                    <SelectItem value=\"gated_flat\">Gated Society Flat</SelectItem>
                    <SelectItem value=\"independent_house\">Independent House</SelectItem>
                    <SelectItem value=\"builder_floor\">Builder Floor</SelectItem>
                    <SelectItem value=\"pg\">PG / Co-living</SelectItem>
                    <SelectItem value=\"resale_flat\">Resale Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className=\"flex-1 md:border-r md:border-[#eae5dc] px-3 py-2\">
                <div className=\"text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b827d]\">Locality</div>
                <Input
                  list=\"localities\"
                  placeholder=\"e.g. Koramangala\"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className=\"border-0 shadow-none p-0 h-auto text-base font-medium text-[#22332a] focus-visible:ring-0 placeholder:text-[#a3aaa4]\"
                  data-testid=\"search-locality\"
                />
                <datalist id=\"localities\">
                  {LOCALITIES.map((l) => <option key={l} value={l} />)}
                </datalist>
              </div>
              <div className=\"flex-1 px-3 py-2\">
                <div className=\"text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b827d]\">Budget</div>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger className=\"border-0 shadow-none p-0 h-auto text-base font-medium text-[#22332a] focus:ring-0\" data-testid=\"search-budget\">
                    <SelectValue placeholder=\"Any\" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"any\">Any budget</SelectItem>
                    <SelectItem value=\"0-15000\">Under ₹15,000</SelectItem>
                    <SelectItem value=\"15000-30000\">₹15,000 – ₹30,000</SelectItem>
                    <SelectItem value=\"30000-60000\">₹30,000 – ₹60,000</SelectItem>
                    <SelectItem value=\"60000-150000\">₹60,000+</SelectItem>
                    <SelectItem value=\"5000000-100000000\">₹50L+ (Buy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type=\"submit\"
                className=\"rounded-2xl bg-[#c15c3d] hover:bg-[#a84c30] text-white h-14 md:h-auto px-6 md:px-8 md:my-1 md:mr-1 gap-2 text-base font-semibold\"
                data-testid=\"hero-search-submit\"
              >
                <Search size={18} /> Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Locality chips marquee */}
      <section className=\"mt-32 md:mt-36\">
        <div className=\"max-w-7xl mx-auto px-6 lg:px-10\">
          <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">
            Popular in Bangalore
          </div>
        </div>
        <div className=\"mt-4 overflow-hidden\">
          <div className=\"flex gap-3 marquee-track whitespace-nowrap w-max\">
            {[...LOCALITIES, ...LOCALITIES].map((l, i) => (
              <Link
                key={`${l}-${i}`}
                to={`/browse?locality=${encodeURIComponent(l)}`}
                className=\"inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#eae5dc] hover:border-[#c15c3d] hover:text-[#c15c3d] transition-colors text-sm\"
              >
                <MapPin size={14} /> {l}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Persona bento */}
      <section className=\"max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-28\">
        <div className=\"flex items-end justify-between mb-10 flex-wrap gap-4\">
          <div>
            <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">Made for you</div>
            <h2 className=\"mt-3 font-display text-4xl sm:text-5xl tracking-tight max-w-2xl\">
              A home for every kind of you.
            </h2>
          </div>
          <p className=\"max-w-md text-[#4a4f4a] leading-relaxed\">
            Whether you're moving cities for your first job, raising a family
            or scaling from a shared PG to your own studio — we curate the right options.
          </p>
        </div>

        <div className=\"grid grid-cols-1 md:grid-cols-12 gap-6\">
          <Link
            to=\"/browse?audience=family&purpose=rent\"
            className=\"md:col-span-8 md:row-span-2 relative rounded-3xl overflow-hidden group border border-[#eae5dc] min-h-[380px]\"
            data-testid=\"persona-family\"
          >
            <img src={PERSONA_IMAGES.family} alt=\"Family\" className=\"absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105\" />
            <div className=\"absolute inset-0 bg-gradient-to-t from-[#22332a]/85 via-[#22332a]/30 to-transparent\" />
            <div className=\"relative p-8 md:p-12 h-full flex flex-col justify-end text-white\">
              <Users size={28} className=\"mb-4\" />
              <h3 className=\"font-display text-3xl md:text-4xl leading-tight\">For families</h3>
              <p className=\"mt-3 max-w-md text-white/85\">
                Spacious 2–4 BHK gated society flats and independent houses across the
                best family neighbourhoods.
              </p>
              <div className=\"mt-5 inline-flex items-center gap-2 text-sm font-semibold\">
                Explore family homes <ArrowRight size={16} className=\"transition-transform group-hover:translate-x-1\" />
              </div>
            </div>
          </Link>

          <Link
            to=\"/browse?audience=students&purpose=pg\"
            className=\"md:col-span-4 relative rounded-3xl overflow-hidden group border border-[#eae5dc] min-h-[180px]\"
            data-testid=\"persona-students\"
          >
            <img src={PERSONA_IMAGES.students} alt=\"Students\" className=\"absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105\" />
            <div className=\"absolute inset-0 bg-gradient-to-t from-[#22332a]/85 via-[#22332a]/25 to-transparent\" />
            <div className=\"relative p-6 h-full flex flex-col justify-end text-white\">
              <GraduationCap size={24} className=\"mb-3\" />
              <h3 className=\"font-display text-2xl\">For students</h3>
              <p className=\"mt-1 text-sm text-white/85\">Affordable PGs, meals + WiFi included.</p>
            </div>
          </Link>

          <Link
            to=\"/browse?audience=professionals&purpose=rent\"
            className=\"md:col-span-4 relative rounded-3xl overflow-hidden group border border-[#eae5dc] min-h-[180px]\"
            data-testid=\"persona-professionals\"
          >
            <img src={PERSONA_IMAGES.professionals} alt=\"Professionals\" className=\"absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105\" />
            <div className=\"absolute inset-0 bg-gradient-to-t from-[#22332a]/85 via-[#22332a]/25 to-transparent\" />
            <div className=\"relative p-6 h-full flex flex-col justify-end text-white\">
              <Briefcase size={24} className=\"mb-3\" />
              <h3 className=\"font-display text-2xl\">For professionals</h3>
              <p className=\"mt-1 text-sm text-white/85\">Studios & 1BHKs near tech parks.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured properties */}
      <section className=\"bg-[#f4f1eb] py-24\">
        <div className=\"max-w-7xl mx-auto px-6 lg:px-10\">
          <div className=\"flex items-end justify-between mb-10 flex-wrap gap-4\">
            <div>
              <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">Handpicked</div>
              <h2 className=\"mt-3 font-display text-4xl sm:text-5xl tracking-tight\">Featured homes this week.</h2>
            </div>
            <Link to=\"/browse\" className=\"text-[#c15c3d] font-semibold hover:underline inline-flex items-center gap-1\" data-testid=\"see-all-featured\">
              See all listings <ArrowRight size={16} />
            </Link>
          </div>
          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6\">
            {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
            {featured.length === 0 && (
              <div className=\"col-span-full text-center text-[#7b827d] py-16\">
                Loading featured homes…
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why PropxReality */}
      <section className=\"max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-28\">
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-16 items-start\">
          <div>
            <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">Why PropxReality</div>
            <h2 className=\"mt-3 font-display text-4xl sm:text-5xl tracking-tight leading-tight\">
              We show you homes the way friends recommend them.
            </h2>
            <p className=\"mt-6 text-[#4a4f4a] leading-relaxed max-w-lg\">
              No inflated brokerage. No \"sold-out\" bait. Just honest listings you can
              actually visit, from PGs to independent houses to resale flats — all
              across Bangalore.
            </p>
          </div>
          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-5\">
            {[
              { icon: ShieldCheck, title: \"Verified listings\", body: \"Every listing is checked before it goes live — real photos, real rents.\" },
              { icon: Handshake, title: \"Zero broker chase\", body: \"Talk directly to owners or verified partners. No middlemen games.\" },
              { icon: Sparkles, title: \"One place, all types\", body: \"PGs, flats, houses & resale — no need to hop between five apps.\" },
              { icon: Star, title: \"Bangalore-first\", body: \"Built by locals who know Koramangala from Kanakapura Road.\" },
            ].map((f, i) => (
              <div key={i} className=\"rounded-3xl border border-[#eae5dc] bg-white p-6\">
                <div className=\"h-11 w-11 rounded-2xl bg-[#dce2da] text-[#2c4c3b] grid place-items-center\">
                  <f.icon size={20} />
                </div>
                <div className=\"mt-4 font-display text-xl\">{f.title}</div>
                <p className=\"mt-2 text-sm text-[#4a4f4a] leading-relaxed\">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className=\"max-w-7xl mx-auto px-6 lg:px-10 pb-24\">
        <div className=\"relative rounded-[2rem] overflow-hidden border border-[#eae5dc] bg-gradient-to-br from-[#2c4c3b] to-[#22332a] text-white p-10 md:p-16\">
          <div className=\"relative z-10 grid md:grid-cols-2 gap-10 items-center\">
            <div>
              <h2 className=\"font-display text-4xl sm:text-5xl leading-tight tracking-tight\">
                Own a home? <br /> List it in 3 minutes.
              </h2>
              <p className=\"mt-5 text-white/85 max-w-lg leading-relaxed\">
                Reach genuine Bangalore families, students and professionals. Zero
                listing fee for the first month.
              </p>
            </div>
            <div className=\"flex flex-wrap gap-3 md:justify-end\">
              <Link to=\"/list-property\">
                <Button
                  size=\"lg\"
                  className=\"rounded-full bg-[#c15c3d] hover:bg-[#a84c30] text-white px-8 py-6 text-base font-semibold\"
                  data-testid=\"cta-list-property\"
                >
                  List your property <ArrowRight size={18} className=\"ml-2\" />
                </Button>
              </Link>
              <Link to=\"/signup\">
                <Button
                  size=\"lg\"
                  variant=\"outline\"
                  className=\"rounded-full bg-transparent text-white border-white/60 hover:bg-white hover:text-[#22332a] px-8 py-6 text-base font-semibold\"
                >
                  Create an owner account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
"

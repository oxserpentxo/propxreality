
 "import React from \"react\";
import { Link } from \"react-router-dom\";
import { Home, Mail, Phone, MapPin } from \"lucide-react\";

export default function Footer() {
  return (
    <footer className=\"mt-24 border-t border-[#eae5dc] bg-[#f4f1eb]\" data-testid=\"site-footer\">
      <div className=\"max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10\">
        <div>
          <div className=\"flex items-center gap-2\">
            <div className=\"h-9 w-9 rounded-xl bg-[#c15c3d] text-white grid place-items-center\">
              <Home size={18} strokeWidth={2.4} />
            </div>
            <span className=\"font-display text-xl font-semibold\">PropxReality</span>
          </div>
          <p className=\"mt-4 text-sm text-[#4a4f4a] leading-relaxed max-w-xs\">
            Bangalore's warm, human-first way to find PGs, gated flats,
            independent houses and resale homes — all in one place.
          </p>
        </div>

        <div>
          <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d] mb-4\">
            Explore
          </div>
          <ul className=\"space-y-3 text-sm\">
            <li><Link to=\"/browse?purpose=rent\" className=\"hover:text-[#c15c3d]\">Flats for Rent</Link></li>
            <li><Link to=\"/browse?purpose=pg\" className=\"hover:text-[#c15c3d]\">PG / Co-living</Link></li>
            <li><Link to=\"/browse?purpose=buy\" className=\"hover:text-[#c15c3d]\">Resale Homes</Link></li>
            <li><Link to=\"/browse?property_type=independent_house\" className=\"hover:text-[#c15c3d]\">Independent Houses</Link></li>
          </ul>
        </div>

        <div>
          <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d] mb-4\">
            For Owners
          </div>
          <ul className=\"space-y-3 text-sm\">
            <li><Link to=\"/list-property\" className=\"hover:text-[#c15c3d]\">List your property</Link></li>
            <li><Link to=\"/signup\" className=\"hover:text-[#c15c3d]\">Owner sign up</Link></li>
            <li><Link to=\"/login\" className=\"hover:text-[#c15c3d]\">Owner login</Link></li>
          </ul>
        </div>

        <div>
          <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d] mb-4\">
            Reach us
          </div>
          <ul className=\"space-y-3 text-sm text-[#4a4f4a]\">
            <li className=\"flex items-start gap-2\"><MapPin size={16} className=\"mt-0.5 text-[#c15c3d]\" /> Koramangala, Bangalore 560095</li>
            <li className=\"flex items-start gap-2\"><Phone size={16} className=\"mt-0.5 text-[#c15c3d]\" /> +91 90000 00000</li>
            <li className=\"flex items-start gap-2\"><Mail size={16} className=\"mt-0.5 text-[#c15c3d]\" /> hello@propxreality.in</li>
          </ul>
        </div>
      </div>
      <div className=\"border-t border-[#eae5dc]\">
        <div className=\"max-w-7xl mx-auto px-6 lg:px-10 py-6 text-xs text-[#7b827d] flex flex-col md:flex-row justify-between gap-3\">
          <div>© {new Date().getFullYear()} PropxReality. Made with warmth in Bangalore.</div>
          <div className=\"flex gap-5\">
            <span>Privacy</span><span>Terms</span><span>Cookie policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
"
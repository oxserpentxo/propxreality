
"import React, { useEffect, useMemo, useState } from \"react\";
import { useSearchParams } from \"react-router-dom\";
import { api, PROPERTY_TYPES, PURPOSES, AUDIENCES, BHK_OPTIONS } from \"@/lib/api\";
import PropertyCard from \"@/components/site/PropertyCard\";
import { Input } from \"@/components/ui/input\";
import { Button } from \"@/components/ui/button\";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from \"@/components/ui/select\";
import { Slider } from \"@/components/ui/slider\";
import { SlidersHorizontal, Search, X } from \"lucide-react\";

const MAX_RENT = 200000;

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const state = useMemo(
    () => ({
      q: params.get(\"q\") || \"\",
      purpose: params.get(\"purpose\") || \"any\",
      property_type: params.get(\"property_type\") || \"any\",
      audience: params.get(\"audience\") || \"anyone\",
      bhk: params.get(\"bhk\") || \"any\",
      locality: params.get(\"locality\") || \"\",
      min_price: Number(params.get(\"min_price\") || 0),
      max_price: Number(params.get(\"max_price\") || MAX_RENT),
    }),
    [params]
  );

  const [priceRange, setPriceRange] = useState([state.min_price, state.max_price]);
  useEffect(() => setPriceRange([state.min_price, state.max_price]), [state.min_price, state.max_price]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === \"any\" || value === \"anyone\" || value === \"\") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  useEffect(() => {
    setLoading(true);
    const q = {};
    if (state.q) q.q = state.q;
    if (state.purpose !== \"any\") q.purpose = state.purpose;
    if (state.property_type !== \"any\") q.property_type = state.property_type;
    if (state.audience !== \"anyone\") q.audience = state.audience;
    if (state.bhk !== \"any\") q.bhk = state.bhk;
    if (state.locality) q.locality = state.locality;
    if (state.min_price > 0) q.min_price = state.min_price;
    if (state.max_price < MAX_RENT) q.max_price = state.max_price;
    api.get(\"/properties\", { params: q })
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [state]);

  const applyPrice = () => {
    const next = new URLSearchParams(params);
    if (priceRange[0] > 0) next.set(\"min_price\", String(priceRange[0]));
    else next.delete(\"min_price\");
    if (priceRange[1] < MAX_RENT) next.set(\"max_price\", String(priceRange[1]));
    else next.delete(\"max_price\");
    setParams(next);
  };

  return (
    <div className=\"max-w-7xl mx-auto px-6 lg:px-10 py-10\">
      <div className=\"flex items-end justify-between flex-wrap gap-4 mb-8\">
        <div>
          <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">Browse homes</div>
          <h1 className=\"mt-2 font-display text-4xl sm:text-5xl tracking-tight\">
            {items.length} {items.length === 1 ? \"home\" : \"homes\"} in Bangalore
          </h1>
        </div>
        <div className=\"relative w-full md:w-96\">
          <Search size={16} className=\"absolute left-3 top-1/2 -translate-y-1/2 text-[#7b827d]\" />
          <Input
            placeholder=\"Search by title, locality…\"
            defaultValue={state.q}
            onKeyDown={(e) => { if (e.key === \"Enter\") setParam(\"q\", e.currentTarget.value); }}
            className=\"pl-9 rounded-full border-[#eae5dc] bg-white\"
            data-testid=\"browse-search-input\"
          />
        </div>
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8\">
        {/* Filters */}
        <aside className=\"bg-white border border-[#eae5dc] rounded-3xl p-6 h-fit lg:sticky lg:top-24\" data-testid=\"filters-panel\">
          <div className=\"flex items-center justify-between mb-5\">
            <div className=\"inline-flex items-center gap-2 font-display text-lg\"><SlidersHorizontal size={16} /> Filters</div>
            <button onClick={clearAll} className=\"text-xs text-[#c15c3d] font-semibold inline-flex items-center gap-1\" data-testid=\"filters-clear\">
              <X size={12} /> Clear
            </button>
          </div>

          <div className=\"space-y-6\">
            <FilterBlock label=\"Purpose\">
              <Select value={state.purpose} onValueChange={(v) => setParam(\"purpose\", v)}>
                <SelectTrigger data-testid=\"filter-purpose\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"any\">Any</SelectItem>
                  {PURPOSES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterBlock>

            <FilterBlock label=\"Property type\">
              <Select value={state.property_type} onValueChange={(v) => setParam(\"property_type\", v)}>
                <SelectTrigger data-testid=\"filter-type\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"any\">Any</SelectItem>
                  {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterBlock>

            <FilterBlock label=\"Best for\">
              <Select value={state.audience} onValueChange={(v) => setParam(\"audience\", v)}>
                <SelectTrigger data-testid=\"filter-audience\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterBlock>

            <FilterBlock label=\"BHK\">
              <Select value={state.bhk} onValueChange={(v) => setParam(\"bhk\", v)}>
                <SelectTrigger data-testid=\"filter-bhk\"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"any\">Any</SelectItem>
                  {BHK_OPTIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterBlock>

            <FilterBlock label=\"Locality\">
              <Input
                placeholder=\"e.g. Koramangala\"
                defaultValue={state.locality}
                onBlur={(e) => setParam(\"locality\", e.target.value)}
                onKeyDown={(e) => { if (e.key === \"Enter\") setParam(\"locality\", e.currentTarget.value); }}
                data-testid=\"filter-locality\"
              />
            </FilterBlock>

            <FilterBlock label={`Budget: ₹${priceRange[0].toLocaleString(\"en-IN\")} – ₹${priceRange[1].toLocaleString(\"en-IN\")}${priceRange[1] === MAX_RENT ? \"+\" : \"\"}`}>
              <Slider
                min={0}
                max={MAX_RENT}
                step={1000}
                value={priceRange}
                onValueChange={setPriceRange}
                onValueCommit={applyPrice}
                className=\"mt-3\"
                data-testid=\"filter-budget\"
              />
            </FilterBlock>
          </div>
        </aside>

        {/* Grid */}
        <div>
          {loading ? (
            <div className=\"grid sm:grid-cols-2 xl:grid-cols-3 gap-6\">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className=\"aspect-[4/3] rounded-3xl bg-[#f4f1eb] animate-pulse\" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className=\"rounded-3xl border border-dashed border-[#eae5dc] p-16 text-center bg-white\">
              <div className=\"font-display text-2xl\">No homes match your filters.</div>
              <p className=\"mt-2 text-[#7b827d]\">Try widening your budget or clearing some filters.</p>
              <Button onClick={clearAll} className=\"mt-6 rounded-full bg-[#c15c3d] hover:bg-[#a84c30]\" data-testid=\"empty-clear-btn\">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className=\"grid sm:grid-cols-2 xl:grid-cols-3 gap-6\" data-testid=\"property-grid\">
              {items.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ label, children }) {
  return (
    <div>
      <div className=\"text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b827d] mb-2\">{label}</div>
      {children}
    </div>
  );
}
"

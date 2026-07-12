"import React, { useState } from \"react\";
import { Link, useNavigate, useLocation } from \"react-router-dom\";
import { useAuth } from \"@/context/AuthContext\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { Label } from \"@/components/ui/label\";
import { formatApiErrorDetail } from \"@/lib/api\";
import { toast } from \"sonner\";
import { Home } from \"lucide-react\";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(\"\");
  const [password, setPassword] = useState(\"\");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(\"\");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(\"\");
    try {
      await login(email, password);
      toast.success(\"Welcome back!\");
      const to = location.state?.from || \"/\";
      navigate(to);
    } catch (err) {
      const msg = formatApiErrorDetail(err?.response?.data?.detail) || \"Login failed\";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title=\"Welcome back\" subtitle=\"Log in to save homes, contact owners, and manage listings.\">
      <form onSubmit={submit} data-testid=\"login-form\" className=\"space-y-4\">
        <Field label=\"Email\">
          <Input type=\"email\" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid=\"login-email\" />
        </Field>
        <Field label=\"Password\">
          <Input type=\"password\" required value={password} onChange={(e) => setPassword(e.target.value)} data-testid=\"login-password\" />
        </Field>
        {error && <div className=\"text-sm text-red-600\" data-testid=\"login-error\">{error}</div>}
        <Button type=\"submit\" disabled={loading} className=\"w-full rounded-full h-11 bg-[#c15c3d] hover:bg-[#a84c30] text-white text-base font-semibold\" data-testid=\"login-submit\">
          {loading ? \"Logging in…\" : \"Log in\"}
        </Button>
        <p className=\"text-sm text-center text-[#7b827d]\">
          New here? <Link to=\"/signup\" className=\"text-[#c15c3d] font-semibold\">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className=\"min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-2\">
      <div className=\"hidden md:block relative\">
        <img
          src=\"https://images.pexels.com/photos/15422346/pexels-photo-15422346.jpeg\"
          alt=\"\"
          className=\"absolute inset-0 w-full h-full object-cover\"
        />
        <div className=\"absolute inset-0 bg-gradient-to-tr from-[#22332a]/85 via-[#22332a]/40 to-transparent\" />
        <div className=\"relative h-full flex flex-col justify-between p-10 text-white\">
          <div className=\"flex items-center gap-2\">
            <div className=\"h-9 w-9 rounded-xl bg-[#c15c3d] grid place-items-center\">
              <Home size={18} strokeWidth={2.4} />
            </div>
            <div className=\"font-display text-xl\">PropxReality</div>
          </div>
          <div>
            <h2 className=\"font-display text-4xl leading-tight max-w-md\">Homes that feel like home, not listings.</h2>
            <p className=\"mt-4 text-white/85 max-w-md\">Bangalore's warmest real estate aggregator — PGs, flats, houses & resale.</p>
          </div>
        </div>
      </div>
      <div className=\"flex items-center justify-center p-8 md:p-12 bg-[#fdfbf7]\">
        <div className=\"w-full max-w-md\">
          <div className=\"text-xs font-bold uppercase tracking-[0.2em] text-[#7b827d]\">PropxReality</div>
          <h1 className=\"mt-3 font-display text-4xl tracking-tight\">{title}</h1>
          <p className=\"mt-2 text-[#4a4f4a]\">{subtitle}</p>
          <div className=\"mt-8\">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <Label className=\"text-xs font-semibold uppercase tracking-[0.15em] text-[#7b827d]\">{label}</Label>
      <div className=\"mt-1.5\">{children}</div>
    </div>
  );
}
"

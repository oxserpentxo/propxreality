
 "import React, { useState } from \"react\";
import { Link, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/context/AuthContext\";
import { Button } from \"@/components/ui/button\";
import { Input } from \"@/components/ui/input\";
import { formatApiErrorDetail } from \"@/lib/api\";
import { toast } from \"sonner\";
import { AuthShell, Field } from \"@/pages/Login\";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: \"\", email: \"\", phone: \"\", password: \"\" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(\"\");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(\"\");
    try {
      await register(form);
      toast.success(\"Welcome to PropxReality!\");
      navigate(\"/\");
    } catch (err) {
      const msg = formatApiErrorDetail(err?.response?.data?.detail) || \"Sign up failed\";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title=\"Create your account\" subtitle=\"Save favourite homes, reach out to owners, and list your own property.\">
      <form onSubmit={submit} data-testid=\"signup-form\" className=\"space-y-4\">
        <Field label=\"Full name\">
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid=\"signup-name\" />
        </Field>
        <Field label=\"Email\">
          <Input type=\"email\" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid=\"signup-email\" />
        </Field>
        <Field label=\"Phone\">
          <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid=\"signup-phone\" />
        </Field>
        <Field label=\"Password\">
          <Input type=\"password\" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid=\"signup-password\" />
        </Field>
        {error && <div className=\"text-sm text-red-600\" data-testid=\"signup-error\">{error}</div>}
        <Button type=\"submit\" disabled={loading} className=\"w-full rounded-full h-11 bg-[#c15c3d] hover:bg-[#a84c30] text-white text-base font-semibold\" data-testid=\"signup-submit\">
          {loading ? \"Creating account…\" : \"Create account\"}
        </Button>
        <p className=\"text-sm text-center text-[#7b827d]\">
          Already have an account? <Link to=\"/login\" className=\"text-[#c15c3d] font-semibold\">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
"

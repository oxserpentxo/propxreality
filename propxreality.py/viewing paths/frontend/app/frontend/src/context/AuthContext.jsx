
"import React, { createContext, useContext, useEffect, useState } from \"react\";
import { api } from \"@/lib/api\";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = unknown/checking, false = anon, obj = user
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(\"propx_token\");
    if (!token) {
      setUser(false);
      setChecked(true);
      return;
    }
    api
      .get(\"/auth/me\")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(\"propx_token\");
        setUser(false);
      })
      .finally(() => setChecked(true));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post(\"/auth/login\", { email, password });
    localStorage.setItem(\"propx_token\", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post(\"/auth/register\", payload);
    localStorage.setItem(\"propx_token\", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(\"propx_token\");
    setUser(false);
  };

  return (
    <AuthCtx.Provider value={{ user, checked, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
"

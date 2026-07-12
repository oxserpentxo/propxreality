
"import axios from \"axios\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(\"propx_token\");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return \"Something went wrong. Please try again.\";
  if (typeof detail === \"string\") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === \"string\" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(\" \");
  if (detail && typeof detail.msg === \"string\") return detail.msg;
  return String(detail);
}

export const INR = (n) => {
  if (n == null) return \"\";
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(2)} L`;
  return `₹ ${n.toLocaleString(\"en-IN\")}`;
};

export const PROPERTY_TYPES = [
  { value: \"pg\", label: \"PG / Co-living\" },
  { value: \"gated_flat\", label: \"Gated Society Flat\" },
  { value: \"independent_house\", label: \"Independent House\" },
  { value: \"builder_floor\", label: \"Builder Floor\" },
  { value: \"resale_flat\", label: \"Resale Flat\" },
];

export const PURPOSES = [
  { value: \"rent\", label: \"For Rent\" },
  { value: \"buy\", label: \"For Sale\" },
  { value: \"pg\", label: \"PG / Hostel\" },
];

export const AUDIENCES = [
  { value: \"anyone\", label: \"Anyone\" },
  { value: \"students\", label: \"Students\" },
  { value: \"family\", label: \"Family\" },
  { value: \"professionals\", label: \"Working Professionals\" },
];

export const BHK_OPTIONS = [\"1RK\", \"1BHK\", \"2BHK\", \"3BHK\", \"4BHK+\"];
"

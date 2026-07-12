 "import React from \"react\";
import \"@/App.css\";
import { BrowserRouter, Routes, Route } from \"react-router-dom\";
import { AuthProvider } from \"@/context/AuthContext\";
import Navbar from \"@/components/site/Navbar\";
import Footer from \"@/components/site/Footer\";
import Landing from \"@/pages/Landing\";
import Browse from \"@/pages/Browse\";
import PropertyDetail from \"@/pages/PropertyDetail\";
import Login from \"@/pages/Login\";
import Signup from \"@/pages/Signup\";
import ListProperty from \"@/pages/ListProperty\";
import { Toaster } from \"@/components/ui/sonner\";

function ChromeLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className=\"App\">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path=\"/\" element={<ChromeLayout><Landing /></ChromeLayout>} />
            <Route path=\"/browse\" element={<ChromeLayout><Browse /></ChromeLayout>} />
            <Route path=\"/property/:id\" element={<ChromeLayout><PropertyDetail /></ChromeLayout>} />
            <Route path=\"/list-property\" element={<ChromeLayout><ListProperty /></ChromeLayout>} />
            <Route path=\"/login\" element={<Login />} />
            <Route path=\"/signup\" element={<Signup />} />
          </Routes>
          <Toaster position=\"top-right\" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
"
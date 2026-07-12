
"import React from \"react\";
import { Link, NavLink, useNavigate } from \"react-router-dom\";
import { useAuth } from \"@/context/AuthContext\";
import { Button } from \"@/components/ui/button\";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from \"@/components/ui/dropdown-menu\";
import { Home, User, LogOut, PlusCircle, Search, Menu } from \"lucide-react\";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-[#c15c3d] ${
      isActive ? \"text-[#c15c3d]\" : \"text-[#22332a]\"
    }`;

  return (
    <header
      className=\"sticky top-0 z-50 border-b border-[#eae5dc] bg-[#fdfbf7]/85 backdrop-blur-xl\"
      data-testid=\"site-navbar\"
    >
      <div className=\"max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between\">
        <Link to=\"/\" className=\"flex items-center gap-2\" data-testid=\"nav-logo\">
          <div className=\"h-9 w-9 rounded-xl bg-[#c15c3d] text-white grid place-items-center shadow-sm\">
            <Home size={18} strokeWidth={2.4} />
          </div>
          <div className=\"font-display text-xl font-semibold tracking-tight text-[#22332a]\">
            PropxReality
          </div>
        </Link>

        <nav className=\"hidden md:flex items-center gap-8\">
          <NavLink to=\"/browse?purpose=rent\" className={linkCls} data-testid=\"nav-rent\">
            Rent
          </NavLink>
          <NavLink to=\"/browse?purpose=buy\" className={linkCls} data-testid=\"nav-buy\">
            Buy
          </NavLink>
          <NavLink to=\"/browse?purpose=pg\" className={linkCls} data-testid=\"nav-pg\">
            PG / Co-living
          </NavLink>
          <NavLink to=\"/list-property\" className={linkCls} data-testid=\"nav-list\">
            List Property
          </NavLink>
        </nav>

        <div className=\"flex items-center gap-3\">
          <Button
            variant=\"ghost\"
            size=\"icon\"
            className=\"md:hidden\"
            onClick={() => navigate(\"/browse\")}
            data-testid=\"nav-search-mobile\"
          >
            <Search size={18} />
          </Button>

          {user && user.email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className=\"flex items-center gap-2 rounded-full border border-[#eae5dc] bg-white px-3 py-1.5 hover:border-[#c15c3d] transition-colors\"
                  data-testid=\"nav-user-menu\"
                >
                  <div className=\"h-7 w-7 rounded-full bg-[#2c4c3b] text-white grid place-items-center text-xs font-semibold\">
                    {user.name?.[0]?.toUpperCase() || \"U\"}
                  </div>
                  <span className=\"hidden sm:inline text-sm font-medium\">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align=\"end\" className=\"w-56\">
                <DropdownMenuLabel className=\"font-normal\">
                  <div className=\"text-sm font-medium\">{user.name}</div>
                  <div className=\"text-xs text-muted-foreground\">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate(\"/list-property\")}
                  data-testid=\"nav-list-menuitem\"
                >
                  <PlusCircle size={16} className=\"mr-2\" /> List a Property
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(\"/browse\")}>
                  <Search size={16} className=\"mr-2\" /> Browse
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate(\"/\"); }} data-testid=\"nav-logout\">
                  <LogOut size={16} className=\"mr-2\" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to=\"/login\" className=\"hidden sm:block\">
                <Button variant=\"ghost\" className=\"rounded-full\" data-testid=\"nav-login\">
                  Log in
                </Button>
              </Link>
              <Link to=\"/signup\">
                <Button
                  className=\"rounded-full bg-[#c15c3d] hover:bg-[#a84c30] text-white px-5\"
                  data-testid=\"nav-signup\"
                >
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
"
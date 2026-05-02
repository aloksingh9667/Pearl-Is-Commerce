import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  FileText, 
  Tag, 
  LogOut 
} from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Orders", href: "/admin/orders", icon: Package },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Journal", href: "/admin/blogs", icon: FileText },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-border flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-border">
          <Link href="/">
            <h1 className="font-serif text-2xl tracking-widest text-sidebar-primary">PEARLIS</h1>
          </Link>
          <p className="text-xs text-sidebar-foreground/50 uppercase tracking-widest mt-2">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors cursor-pointer ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-sidebar-foreground mb-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="truncate">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <div className="md:hidden p-4 border-b border-border flex justify-between items-center bg-sidebar">
          <h1 className="font-serif text-xl tracking-widest text-sidebar-primary">PEARLIS ADMIN</h1>
        </div>
        <main className="p-6 md:p-8 flex-1 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CreditCard, LayoutDashboard, Upload, UserCircle, Shield, Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/profile", label: "Profile", icon: UserCircle },
  ];

  const NavButtons = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            asChild
            className={cn(!isActive(item.path) && "hover:bg-accent/10")}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Link to={item.path}>
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </>
  );

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <CreditCard className="h-6 w-6 text-accent" />
            <span className="text-primary font-bold">Google M</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center gap-2">
              <NavButtons />
            </div>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <CreditCard className="h-6 w-6 text-accent" />
                    <span className="font-bold text-xl text-primary">Google M</span>
                  </div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        size="lg"
                        asChild
                        className={cn(
                          "justify-start w-full",
                          !isActive(item.path) && "hover:bg-accent/10"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={item.path}>
                          <Icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
};

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Database, BarChart3, HelpCircle, Menu, X, Code, LogIn, LogOut, User, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    {
      path: "/extraction",
      label: "ช่วยใส่ข้อมูล",
      icon: Home,
      description: "ช่วยใส่ข้อมูลจาก social",
      isPrimary: true,
    },
    {
      path: "/dashboard",
      label: "ข้อมูลผู้ต้องการความช่วยเหลือ",
      shortLabel: "ข้อมูล",
      icon: Database,
      description: "ดูข้อมูลทั้งหมด",
    },
    {
      path: "/stats",
      label: "Dashboard",
      icon: BarChart3,
      description: "สถิติและรายงาน",
    },
    {
      path: "/mission",
      label: "Mission",
      icon: Target,
      description: "ทำไมต้อง Thai Flood Help",
    },
    {
      path: "/api",
      label: "API",
      icon: Code,
      description: "API Documentation",
    },
    {
      path: "/help",
      label: "คู่มือ",
      icon: HelpCircle,
      description: "วิธีใช้งาน",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-1 sm:gap-2">
          {/* Logo/Brand */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 overflow-hidden"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Thai Flood Help Logo" className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0" />
            <div className="min-w-0 overflow-hidden">
              <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold truncate whitespace-nowrap">ช่วยเหลือผู้ประสบภัย</h1>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground hidden md:block truncate whitespace-nowrap">Flood Help System</p>
            </div>
          </div>

          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPrimary = 'isPrimary' in item && item.isPrimary;
              const displayLabel = 'shortLabel' in item ? item.shortLabel : item.label;

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "gap-2 whitespace-nowrap text-sm lg:text-base",
                    isActive && "shadow-sm",
                    isPrimary && !isActive && "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{displayLabel}</span>
                </Button>
              );
            })}
            
            {/* Auth Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} alt={user.email || "User"} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.email}
                    {isAdmin && <span className="text-xs text-muted-foreground ml-2">(Admin)</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden lg:inline">เข้าสู่ระบบ</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex-shrink-0">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="h-6 w-6" />
                    เมนู
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <Button
                        key={item.path}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "justify-start gap-3 h-14 text-base",
                          isActive && "shadow-sm"
                        )}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </Button>
                    );
                  })}
                  
                  {/* Auth Button Mobile */}
                  <div className="mt-4 pt-4 border-t">
                    {user ? (
                      <>
                        <div className="px-4 py-2 flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} alt={user.email || "User"} />
                            <AvatarFallback>
                              {user.email?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <div className="font-medium">{user.email}</div>
                            {isAdmin && <div className="text-xs text-muted-foreground">Admin</div>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-14"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-5 w-5" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">ออกจากระบบ</span>
                          </div>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-14"
                        onClick={() => handleNavigation("/auth")}
                      >
                        <LogIn className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">เข้าสู่ระบบ</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

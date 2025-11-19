import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Droplets, 
  ArrowRightLeft, 
  Flame, 
  Search, 
  Wallet, 
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/mint", icon: Droplets, label: "Mint" },
    { href: "/trade", icon: ArrowRightLeft, label: "Trade" },
    { href: "/retire", icon: Flame, label: "Retire" },
    { href: "/explorer", icon: Search, label: "Explorer" },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-display font-bold tracking-tighter flex items-center gap-2">
          <span className="text-primary">Nexus</span>Water
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "group-hover:text-primary transition-colors"}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,214,149,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="glass-panel p-4 rounded-lg mb-4">
          <div className="text-xs text-muted-foreground mb-1">Network Status</div>
          <div className="flex items-center gap-2 text-sm font-mono text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            XRPL Mainnet
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl fixed h-full z-20">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
        <span className="font-display font-bold text-xl"><span className="text-primary">Nexus</span>Water</span>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-card border-r border-white/10">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-end px-6 gap-4">
          <Button 
            variant={isConnected ? "outline" : "default"}
            className={isConnected ? "border-primary/50 text-primary hover:bg-primary/10" : "bg-primary text-background hover:bg-primary/90"}
            onClick={() => setIsConnected(!isConnected)}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnected ? "r9...x4s2 (Connected)" : "Connect Wallet"}
          </Button>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

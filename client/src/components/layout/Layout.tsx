import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Droplets, 
  ArrowRightLeft, 
  Flame, 
  Search, 
  Wallet, 
  Menu, 
  X,
  ShoppingCart,
  Coins,
  Zap
} from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LoginOverlay from "@/hooks/login";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAccountBalances } from "@/hooks/useAccountBalances";
import { Skeleton } from "@/components/ui/skeleton";
import * as xrpl from "xrpl";

// Create a BalanceContext to provide balance state to child components
export const BalanceContext = createContext({
  xrpBalance: null as string | null,
  xrpReserved: null as string | null,
  nxsBalance: null as string | null,
  wtrBalance: null as string | null,
  engBalance: null as string | null,
  fetchingBalances: false,
});

// Accepts a render prop to inject wallet context
export default function Layout({ children }: { children: ((context: { xrplAddress: string | null, isConnected: boolean }) => React.ReactNode) | React.ReactNode }) {
  const { toast } = useToast();
  // Pages that require wallet connection
  const protectedRoutes = ["/marketplace", "/mint", "/retire"];
  const [overlayShown, setOverlayShown] = useState(false);
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [xrplAddress, setXrplAddress] = useState<string | null>(null);
  const [xrplError, setXrplError] = useState<string | null>(null);
  // Use custom hook for balances
  const {
    xrpBalance,
    xrpReserved,
    nxsBalance,
    wtrBalance,
    engBalance,
    fetching: fetchingBalances,
    error: balancesError
  } = useAccountBalances(xrplAddress, isConnected);
  // Fetch account info and trust lines when connected
  // All balance state and fetching is now handled in useAccountBalances

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/explorer", icon: Search, label: "Explorer" },
    { href: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { href: "/mint", icon: Droplets, label: "Mint" },
    { href: "/retire", icon: Flame, label: "Retire" },
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
            XRPL Devnet
          </div>
        </div>
      </div>
    </div>
  );

  // XRPL connect handler
  async function handleConnectXRPL(seed: string) {
    setConnecting(true);
    setXrplError(null);
    try {
      // Accept both classic seed and family seed
      const wallet = xrpl.Wallet.fromSeed(seed.trim());
      setXrplAddress(wallet.classicAddress);
      setIsConnected(true);
      setShowSeedDialog(false);
    } catch (err: any) {
      setXrplError("Invalid seed or family seed");
    } finally {
      setConnecting(false);
    }
  }

  // Provide wallet context to children via render prop if function
  const balanceContextValue = {
    xrpBalance,
    xrpReserved,
    nxsBalance,
    wtrBalance,
    engBalance,
    fetchingBalances,
  };

  return (
    <BalanceContext.Provider value={balanceContextValue}>
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
          <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-6 gap-4 justify-between">
            {/* Left: XRP balances */}
            <div className="flex-1 flex items-center gap-4 min-w-0">
              {isConnected && xrplAddress ? (
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-green-900/20 border border-green-700/30">
                    <Coins className="w-4 h-4 text-green-400" />
                    <span className="font-mono text-green-300">XRP</span>
                    {fetchingBalances ? (
                      <Skeleton className="h-4 w-12 bg-green-700/30" />
                    ) : (
                      <span className="font-bold text-green-200">{xrpBalance ?? "-"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-gray-800/40 border border-gray-700/30">
                    <span className="font-mono text-muted-foreground">Reserved</span>
                    {fetchingBalances ? (
                      <Skeleton className="h-4 w-8 bg-gray-700/30" />
                    ) : (
                      <span className="text-gray-300">{xrpReserved ?? "-"}</span>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Center: MPT balances */}
            <div className="flex-1 flex items-center justify-center gap-4 min-w-0">
              {isConnected && xrplAddress ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-blue-900/20 border border-blue-700/30">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="font-mono text-blue-300">WTR</span>
                    {fetchingBalances ? (
                      <Skeleton className="h-4 w-10 bg-blue-700/30" />
                    ) : (
                      <span className="font-bold text-blue-200">{wtrBalance ?? <span className="text-muted-foreground">-</span>}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-yellow-900/20 border border-yellow-700/30">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono text-yellow-300">ENG</span>
                    {fetchingBalances ? (
                      <Skeleton className="h-4 w-10 bg-yellow-700/30" />
                    ) : (
                      <span className="font-bold text-yellow-200">{engBalance ?? <span className="text-muted-foreground">-</span>}</span>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Right: NXS, address, and connect/disconnect button */}
            <div className="flex-1 flex items-center justify-end gap-4 min-w-0">
              {isConnected && xrplAddress ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-900/20 border border-emerald-700/30">
                    <Droplets className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-emerald-300">NXS</span>
                    {fetchingBalances ? (
                      <Skeleton className="h-4 w-10 bg-emerald-700/30" />
                    ) : (
                      <span className="font-bold text-emerald-200">{nxsBalance ?? "-"}</span>
                    )}
                  </div>
                  <span className="font-mono text-primary truncate">{xrplAddress.slice(0, 6) + "..." + xrplAddress.slice(-4)}</span>
                  <Button 
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => {
                      setIsConnected(false);
                    }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default"
                  className="bg-primary text-background hover:bg-primary/90"
                  onClick={() => setShowSeedDialog(true)}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect XRPL Wallet
                </Button>
              )}
            </div>
            <LoginOverlay
              open={showSeedDialog}
              onConnect={handleConnectXRPL}
              connecting={connecting}
              xrplError={xrplError}
              setShowSeedDialog={setShowSeedDialog}
            />
          </header>

          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 relative">
            {/* Overlay for protected pages if not connected */}
            {protectedRoutes.includes(location) && !isConnected && (
              <div
                className="absolute inset-0 z-40 bg-black/60 rounded-xl"
                onClick={() => {
                  toast({
                    title: "Sign in required",
                    description: "Please connect your XRPL wallet to interact with this page.",
                    variant: "default"
                  });
                }}
              />
            )}
            {typeof children === 'function'
              ? children({ xrplAddress, isConnected })
              : children}
          </div>
        </main>
      </div>
    </BalanceContext.Provider>
  );
}

export function useBalanceContext() {
  return useContext(BalanceContext);
}

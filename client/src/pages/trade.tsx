import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowDownUp, ChevronDown, Search, Settings, Calendar, Scale, Info } from "lucide-react";
import { MOCK_BATCHES } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

interface Token {
  symbol: string;
  name: string;
  color: string;
  balance: string;
  batchId?: string; // Optional link to specific batch
  retirementDate?: string;
}

// Transform mock batches into tradeable tokens
const BATCH_TOKENS: Token[] = MOCK_BATCHES.filter(b => b.status !== 'Retired').map(b => ({
  symbol: b.type,
  name: b.name,
  color: b.color,
  balance: b.amount.toString(),
  batchId: b.id,
  retirementDate: b.retirementDate
}));

const BASE_TOKENS: Token[] = [
  { symbol: "XRP", name: "XRP", color: "bg-white text-black", balance: "5,400" },
  { symbol: "FUZZY", name: "Fuzzy Token", color: "bg-purple-500 text-white", balance: "1,200,000" },
  { symbol: "PHNIX", name: "Phoenix", color: "bg-red-500 text-white", balance: "500" },
  { symbol: "RLUSD", name: "Ripple USD", color: "bg-blue-500 text-white", balance: "1,000" },
  { symbol: "SOLO", name: "Sologenic", color: "bg-gray-200 text-black", balance: "350" },
  { symbol: "NXS", name: "Nexus Gov", color: "bg-emerald-600 text-white", balance: "25" },
];

const POOL_TOKENS: Token[] = [
  { symbol: "B-WTR", name: "Balanced Water Pool", color: "bg-blue-600 text-white", balance: "0" },
  { symbol: "B-ENG", name: "Balanced Energy Pool", color: "bg-amber-600 text-white", balance: "0" },
];

const TOKENS = [...BASE_TOKENS, ...POOL_TOKENS, ...BATCH_TOKENS];

export default function Trade() {
  const [sellAmount, setSellAmount] = useState("");
  const [payToken, setPayToken] = useState<Token>(TOKENS[0]); // XRP
  const [receiveToken, setReceiveToken] = useState<Token>(TOKENS.find(t => t.batchId) || TOKENS[6]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [poolMode, setPoolMode] = useState(false);
  
  // Simple mock calculation
  const exchangeRate = 0.45; // mock rate
  const buyAmount = sellAmount ? (parseFloat(sellAmount) * exchangeRate).toFixed(4) : "";

  const filteredTokens = TOKENS.filter(t => 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TokenSelector = ({ 
    selected, 
    onSelect,
    otherToken
  }: { 
    selected: Token; 
    onSelect: (t: Token) => void;
    otherToken: Token;
  }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-full px-3 py-2 h-auto border border-white/10 max-w-[140px]">
          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${selected.color.includes('bg-') ? selected.color : 'bg-white/10 ' + selected.color}`}>
            {selected.symbol[0]}
          </div>
          <div className="flex flex-col items-start overflow-hidden">
             <span className="font-bold truncate w-full text-left">{selected.symbol}</span>
             {selected.batchId && <span className="text-[9px] text-muted-foreground truncate w-full">Batch #{selected.batchId.split('-').pop()}</span>}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search name or symbol" 
              className="pl-10 bg-black/20 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {filteredTokens.map((token) => (
              <div 
                key={token.batchId || token.symbol + token.name}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors ${
                  (token.batchId ? token.batchId === selected.batchId : token.symbol === selected.symbol && !selected.batchId) 
                    ? "bg-white/10" 
                    : ""
                } ${(token.batchId ? token.batchId === otherToken.batchId : token.symbol === otherToken.symbol && !otherToken.batchId) ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => {
                  onSelect(token);
                  document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${token.color.includes('bg-') ? token.color : 'bg-white/10 ' + token.color}`}>
                    {token.symbol[0]}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold flex items-center gap-2">
                      {token.symbol}
                      {token.batchId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-muted-foreground">Batch</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                    {token.retirementDate && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Retires: {token.retirementDate}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-sm text-muted-foreground">{token.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const handleSwapPositions = () => {
    const temp = payToken;
    setPayToken(receiveToken);
    setReceiveToken(temp);
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold">DEX Swap</h1>
        <p className="text-muted-foreground">Trade Environmental Assets instantly on XRPL.</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        <Button 
          variant={!poolMode ? "default" : "outline"} 
          onClick={() => setPoolMode(false)}
          className={!poolMode ? "bg-primary text-background" : "border-white/10"}
        >
          Spot Market
        </Button>
        <Button 
          variant={poolMode ? "default" : "outline"} 
          onClick={() => {
            setPoolMode(true);
            setPayToken(TOKENS[0]); // XRP
            setReceiveToken(POOL_TOKENS[0]); // B-WTR
          }}
          className={poolMode ? "bg-blue-600 text-white hover:bg-blue-700" : "border-white/10"}
        >
          <Scale className="w-4 h-4 mr-2" /> Balancer Pools
        </Button>
      </div>

      {poolMode && (
        <Card className="glass-panel bg-blue-500/5 border-blue-500/20 mb-6">
          <CardContent className="p-6 flex items-start gap-4">
             <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
               <Scale className="w-6 h-6" />
             </div>
             <div className="space-y-2">
               <h3 className="text-lg font-bold text-white">Balancer Protocol Active</h3>
               <p className="text-sm text-muted-foreground">
                 You are trading against a diversified pool of assets. 
                 B-WTR represents a basket of top-rated water credits, automatically rebalanced.
                 Perfect for large volume acquisitions without slippage.
               </p>
               <div className="flex gap-2 mt-2">
                 <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                    Avg Price: 0.42 XRP
                 </Badge>
                 <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                    Deep Liquidity
                 </Badge>
               </div>
             </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-panel border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">{poolMode ? "Pool Swap" : "Limit Swap"}</CardTitle>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sell Input */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 hover:border-white/10 transition-colors">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>You Pay</span>
              <span>Balance: {payToken.balance}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                type="number" 
                placeholder="0.00" 
                className="border-none bg-transparent text-3xl font-mono p-0 focus-visible:ring-0 placeholder:text-white/20 w-full"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
              />
              <TokenSelector 
                selected={payToken} 
                onSelect={setPayToken} 
                otherToken={receiveToken}
              />
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <Button 
              size="icon" 
              variant="outline" 
              className="rounded-full w-8 h-8 bg-card border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
              onClick={handleSwapPositions}
            >
              <ArrowDownUp className="w-4 h-4" />
            </Button>
          </div>

          {/* Buy Input */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 hover:border-white/10 transition-colors">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>You Receive</span>
              <span>Balance: {receiveToken.balance}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                readOnly
                type="text" 
                placeholder="0.00" 
                className="border-none bg-transparent text-3xl font-mono p-0 focus-visible:ring-0 placeholder:text-white/20 text-primary w-full"
                value={buyAmount}
              />
              <TokenSelector 
                selected={receiveToken} 
                onSelect={setReceiveToken} 
                otherToken={payToken}
              />
            </div>
          </div>

          {/* Swap Details */}
          <div className="p-3 rounded-lg bg-white/5 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-mono">1 {payToken.symbol} = {exchangeRate} {receiveToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage Tolerance</span>
              <span className="font-mono">0.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network Cost</span>
              <span className="font-mono text-green-400">0.000012 XRP</span>
            </div>
          </div>

          <Button className={`w-full h-12 text-lg text-white font-bold mt-4 ${
            poolMode ? "bg-blue-600 hover:bg-blue-700" : "bg-primary hover:bg-primary/90 text-black"
          }`}>
            {poolMode ? "Swap via Balancer Pool" : "Swap Tokens"}
          </Button>

        </CardContent>
      </Card>

      {!poolMode && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-1">Popular Pairs</h3>
          <div className="grid grid-cols-2 gap-4">
            {["XRP / WTR", "XRP / ENG", "RLUSD / WTR", "SOLO / ENG"].map((pair) => (
              <div key={pair} className="p-3 rounded-lg border border-white/5 bg-card/30 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between group">
                <span className="font-mono text-sm group-hover:text-primary transition-colors">{pair}</span>
                <span className="text-xs text-green-400">+2.4%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowDownUp, ChevronDown, Search, Settings } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  color: string;
  balance: string;
}

const TOKENS: Token[] = [
  { symbol: "XRP", name: "XRP", color: "bg-white text-black", balance: "5,400" },
  { symbol: "WTR", name: "Water Credit", color: "bg-primary text-background", balance: "0" },
  { symbol: "ENG", name: "Energy Credit", color: "bg-amber-500 text-black", balance: "150" },
  { symbol: "FUZZY", name: "Fuzzy Token", color: "bg-purple-500 text-white", balance: "1,200,000" },
  { symbol: "PHNIX", name: "Phoenix", color: "bg-red-500 text-white", balance: "500" },
  { symbol: "RLUSD", name: "Ripple USD", color: "bg-blue-500 text-white", balance: "1,000" },
  { symbol: "SOLO", name: "Sologenic", color: "bg-gray-200 text-black", balance: "350" },
  { symbol: "NXS", name: "Nexus Gov", color: "bg-emerald-600 text-white", balance: "25" },
];

export default function Trade() {
  const [sellAmount, setSellAmount] = useState("");
  const [payToken, setPayToken] = useState<Token>(TOKENS[0]); // XRP
  const [receiveToken, setReceiveToken] = useState<Token>(TOKENS[1]); // WTR
  const [searchQuery, setSearchQuery] = useState("");

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
        <Button variant="ghost" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-full px-3 py-2 h-auto border border-white/10">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${selected.color}`}>
            {selected.symbol[0]}
          </div>
          <span className="font-bold">{selected.symbol}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                key={token.symbol}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors ${
                  token.symbol === selected.symbol ? "bg-white/10" : ""
                } ${token.symbol === otherToken.symbol ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => {
                  onSelect(token);
                  // Close dialog hack (in a real app use controlled dialog)
                  document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${token.color}`}>
                    {token.symbol[0]}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
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
    <div className="max-w-md mx-auto pt-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-bold mb-2">DEX Swap</h1>
        <p className="text-muted-foreground">Trade Environmental Assets instantly on XRPL.</p>
      </div>

      <Card className="glass-panel border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Swap</CardTitle>
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

          <Button className="w-full h-12 text-lg bg-primary text-background hover:bg-primary/90 mt-4 font-bold">
            Swap Tokens
          </Button>

        </CardContent>
      </Card>

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
    </div>
  );
}

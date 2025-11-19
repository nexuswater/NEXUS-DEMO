import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp, Info, Settings } from "lucide-react";

export default function Trade() {
  const [sellAmount, setSellAmount] = useState("");
  
  // Simple mock calculation
  const exchangeRate = 0.45; // 1 WTR = 0.45 XRP
  const buyAmount = sellAmount ? (parseFloat(sellAmount) * exchangeRate).toFixed(4) : "";

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
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>You Pay</span>
              <span>Balance: 5,400 XRP</span>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                placeholder="0.00" 
                className="border-none bg-transparent text-2xl font-mono p-0 focus-visible:ring-0 placeholder:text-white/20"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
              />
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full font-bold text-sm">
                <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px]">X</div>
                XRP
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <Button size="icon" variant="outline" className="rounded-full w-8 h-8 bg-card border-white/10 text-muted-foreground">
              <ArrowDownUp className="w-4 h-4" />
            </Button>
          </div>

          {/* Buy Input */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>You Receive</span>
              <span>Balance: 0 WTR</span>
            </div>
            <div className="flex items-center gap-4">
              <Input 
                readOnly
                type="text" 
                placeholder="0.00" 
                className="border-none bg-transparent text-2xl font-mono p-0 focus-visible:ring-0 placeholder:text-white/20 text-primary"
                value={buyAmount}
              />
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-full font-bold text-sm text-primary border border-primary/20">
                <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-[10px]">W</div>
                WTR
              </div>
            </div>
          </div>

          {/* Swap Details */}
          <div className="p-3 rounded-lg bg-white/5 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-mono">1 XRP = 2.22 WTR</span>
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

          <Button className="w-full h-12 text-lg bg-primary text-background hover:bg-primary/90 mt-4">
            Swap Tokens
          </Button>

        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-1">Popular Pairs</h3>
        <div className="grid grid-cols-2 gap-4">
          {["XRP / WTR", "XRP / ENG", "USD / WTR", "BTC / ENG"].map((pair) => (
            <div key={pair} className="p-3 rounded-lg border border-white/5 bg-card/30 hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between">
              <span className="font-mono text-sm">{pair}</span>
              <span className="text-xs text-green-400">+2.4%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

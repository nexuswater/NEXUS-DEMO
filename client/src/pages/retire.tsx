import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_BATCHES } from "@/lib/mockData";
import { Flame, Leaf, ExternalLink, CheckCircle2, Clock, TrendingDown, Coins, Send, Wallet, Factory, Droplets, Zap } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import offsetNftImage from "@assets/generated_images/holographic_3d_crystal_badge_representing_a_carbon_offset_credit_on_blockchain.png";

export default function Retire() {
  const [retiredBatches, setRetiredBatches] = useState<string[]>([]);
  const [transferAddress, setTransferAddress] = useState("");

  const handleRetire = (id: string) => {
    setRetiredBatches([...retiredBatches, id]);
  };

  const handleTransfer = (id: string) => {
    // Mock transfer logic
    console.log(`Transferring batch ${id} to ${transferAddress}`);
    setTransferAddress("");
  };

  // Mock active holding for visualization
  const activeHolding = {
    name: "WTR-PA-HNL-2025-000123",
    month: 3,
    totalMonths: 12,
    nxsEarned: 312.5,
    tradableFraction: "9/12"
  };

  // Group batches by source for "Grouped" view
  const batchesBySource = MOCK_BATCHES.reduce((acc, batch) => {
    const source = batch.source || "Unknown Source";
    if (!acc[source]) acc[source] = [];
    acc[source].push(batch);
    return acc;
  }, {} as Record<string, typeof MOCK_BATCHES>);

  const AssetCard = ({ batch }: { batch: typeof MOCK_BATCHES[0] }) => {
    const isRetired = retiredBatches.includes(batch.id);
    if (isRetired) return null;

    return (
      <Card key={batch.id} className="glass-panel overflow-hidden group h-full">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="p-6 space-y-4 flex-1">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${batch.type === 'WTR' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <batch.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <Badge variant="outline" className="font-mono bg-white/5 border-white/10 mb-1">
                  {batch.vintage}
                </Badge>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" /> Retires: {batch.retirementDate}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Factory className="w-3 h-3" /> {batch.source}
              </div>
              <h3 className="font-bold text-lg mb-1">{batch.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{batch.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded bg-black/20">
                <span className="text-muted-foreground block text-xs">Amount</span>
                <span className="font-mono">{batch.amount} {batch.unit}</span>
              </div>
              <div className="p-2 rounded bg-black/20">
                <span className="text-muted-foreground block text-xs">Offset</span>
                <span className="font-mono">{(batch.amount * batch.peg / 1000).toFixed(1)} kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-primary">
                    <Send className="w-4 h-4 mr-2" /> Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10">
                  <DialogHeader>
                    <DialogTitle>Transfer Asset</DialogTitle>
                    <DialogDescription>
                      Send <strong>{batch.name}</strong> to another XRPL wallet.
                      The recipient will gain the ability to retire this asset for rewards.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Recipient Address</Label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="r..." 
                          className="pl-10 bg-black/20 border-white/10 font-mono"
                          value={transferAddress}
                          onChange={(e) => setTransferAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount to Transfer</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          defaultValue={batch.amount}
                          className="bg-black/20 border-white/10 font-mono"
                        />
                        <span className="text-sm font-bold text-muted-foreground">{batch.unit}</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="bg-primary text-background hover:bg-primary/90 w-full"
                      onClick={() => handleTransfer(batch.id)}
                    >
                      Sign & Send Transaction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 group-hover:bg-destructive group-hover:text-white transition-all">
                    <Flame className="w-4 h-4 mr-2" /> Retire
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-white/10 sm:max-w-[500px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Retirement</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-4 pt-2">
                        <p>You are about to permanently burn <strong>{batch.amount} {batch.type}</strong>.</p>
                        
                        <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rewards Preview</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Coins className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white">50.00 NXS</div>
                                <div className="text-xs text-muted-foreground">Governance Token</div>
                              </div>
                            </div>
                            <div className="text-right text-xs text-emerald-400">+ Utility Value</div>
                          </div>

                          <div className="h-px bg-white/10" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-white">Offset NFT</div>
                                <div className="text-xs text-muted-foreground">Proof of Impact</div>
                              </div>
                            </div>
                            <div className="text-right text-xs text-blue-400">Minted to Wallet</div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          This action is irreversible. The NFT serves as your on-chain proof of environmental offset.
                        </p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleRetire(batch.id)}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Confirm Burn & Mint NFT
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Retire Assets</h1>
          <p className="text-muted-foreground">Manage lifecycle, burn tokens, and claim NXS rewards.</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4">
          <div className="p-2 rounded-full bg-primary/20 text-primary">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Your Impact</div>
            <div className="text-xl font-bold font-mono">12,450 <span className="text-sm font-normal text-muted-foreground">kgCO2e</span></div>
          </div>
        </div>
      </div>

      {/* Active Lifecycle Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Active Lifecycle Batches
        </h2>
        <Card className="glass-panel border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{activeHolding.name}</h3>
                    <p className="text-sm text-muted-foreground">Automatic Monthly Retirement Schedule</p>
                  </div>
                  <div className="text-right">
                     <div className="text-sm text-muted-foreground">Current Month</div>
                     <div className="font-mono font-bold text-xl">{activeHolding.month} / {activeHolding.totalMonths}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Lifecycle Progress</span>
                    <span className="text-primary">25% Complete</span>
                  </div>
                  <Progress value={25} className="h-2 bg-black/40" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded bg-black/20 border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Tradable Value
                    </div>
                    <div className="font-mono font-bold">{activeHolding.tradableFraction}</div>
                  </div>
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 col-span-2 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> NXS Generated
                      </div>
                      <div className="font-mono font-bold text-emerald-400">{activeHolding.nxsEarned} NXS</div>
                    </div>
                    <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600 h-8">
                      Claim Rewards
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-black/20 border border-white/10 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/10">All Assets</TabsTrigger>
          <TabsTrigger value="wtr" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Droplets className="w-4 h-4 mr-2" /> Water ($WTR)
          </TabsTrigger>
          <TabsTrigger value="eng" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Zap className="w-4 h-4 mr-2" /> Energy ($ENG)
          </TabsTrigger>
          <TabsTrigger value="source" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
            <Factory className="w-4 h-4 mr-2" /> By Source
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_BATCHES.filter(b => b.status !== "Retired").map((batch) => (
              <AssetCard key={batch.id} batch={batch} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wtr">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_BATCHES.filter(b => b.status !== "Retired" && b.type === "WTR").map((batch) => (
              <AssetCard key={batch.id} batch={batch} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="eng">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_BATCHES.filter(b => b.status !== "Retired" && b.type === "ENG").map((batch) => (
              <AssetCard key={batch.id} batch={batch} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="source">
           <div className="space-y-8">
             {Object.entries(batchesBySource).map(([source, batches]) => {
               const activeBatches = batches.filter(b => b.status !== "Retired" && !retiredBatches.includes(b.id));
               if (activeBatches.length === 0) return null;
               
               return (
                 <div key={source} className="space-y-4">
                   <h3 className="text-xl font-bold flex items-center gap-2 text-white/80">
                     <Factory className="w-5 h-5 text-muted-foreground" />
                     {source}
                   </h3>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {activeBatches.map(batch => (
                       <AssetCard key={batch.id} batch={batch} />
                     ))}
                   </div>
                 </div>
               );
             })}
           </div>
        </TabsContent>
      </Tabs>

      {retiredBatches.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <h2 className="text-2xl font-bold mb-6">Retirement History</h2>
          <div className="space-y-4">
             {retiredBatches.map(id => {
                const batch = MOCK_BATCHES.find(b => b.id === id);
                if (!batch) return null;
                return (
                  <div key={id} className="flex flex-col md:flex-row md:items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(37,214,149,0.15)] flex-shrink-0 bg-black">
                      <img src={offsetNftImage} alt="Offset NFT" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-white">{batch.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Offset
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-mono">
                         <span className="text-white">{batch.amount} {batch.type} Burnt</span>
                         <span className="text-white/20">•</span>
                         <span>ID: {id}</span>
                         <span className="text-white/20">•</span>
                         <span className="text-emerald-400">+ 50 NXS Earned</span>
                      </div>
                    </div>
                    <Button variant="outline" className="border-white/10 hover:bg-white/10 hover:text-primary hover:border-primary/30 transition-all">
                       View NFT Proof <ExternalLink className="ml-2 w-3 h-3" />
                    </Button>
                  </div>
                )
             })}
          </div>
        </div>
      )}
    </div>
  );
}

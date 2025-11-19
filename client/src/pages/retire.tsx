import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_BATCHES } from "@/lib/mockData";
import { Flame, Leaf, ExternalLink, CheckCircle2 } from "lucide-react";
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

export default function Retire() {
  const [retiredBatches, setRetiredBatches] = useState<string[]>([]);

  const handleRetire = (id: string) => {
    setRetiredBatches([...retiredBatches, id]);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Retire Assets</h1>
          <p className="text-muted-foreground">Permanently burn tokens to claim environmental offsets.</p>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_BATCHES.filter(b => b.status !== "Retired").map((batch) => {
           const isRetired = retiredBatches.includes(batch.id);
           
           if (isRetired) return null;

           return (
            <Card key={batch.id} className="glass-panel overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${batch.type === 'WTR' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <batch.icon className="w-6 h-6" />
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-mono bg-white/5 border border-white/10">
                      {batch.vintage}
                    </span>
                  </div>
                  
                  <div>
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

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 mt-4 group-hover:bg-destructive group-hover:text-white transition-all">
                        <Flame className="w-4 h-4 mr-2" /> Retire / Burn
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Retirement</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently burn <strong>{batch.amount} {batch.type}</strong> tokens from your wallet.
                          This action cannot be undone. A retirement certificate will be minted on-chain.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRetire(batch.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Confirm Burn
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {retiredBatches.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <h2 className="text-2xl font-bold mb-6">Retirement History</h2>
          <div className="space-y-4">
             {retiredBatches.map(id => {
                const batch = MOCK_BATCHES.find(b => b.id === id);
                if (!batch) return null;
                return (
                  <div key={id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold">{batch.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{batch.id}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View Certificate <ExternalLink className="ml-2 w-3 h-3" />
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

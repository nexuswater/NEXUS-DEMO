import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Filter, MapPin, Calendar, Droplets, Zap, ArrowRightLeft, ArrowUpRight, Factory, Send } from "lucide-react";
import { MOCK_BATCHES } from "@/lib/mockData";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Marketplace() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"ALL" | "WTR" | "ENG">("ALL");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setTransferAmount("");
      setRecipientAddress("");
      toast({
        title: "Transfer Successful",
        description: `Assets successfully sent to ${recipientAddress.slice(0,8)}...${recipientAddress.slice(-4)}`,
      });
    }, 1500);
  };

  const filteredBatches = MOCK_BATCHES.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                         b.region.toLowerCase().includes(search.toLowerCase()) ||
                         b.source.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "ALL" || b.type === selectedType;
    return matchesSearch && matchesType && b.status !== "Retired";
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Manage and transfer verified environmental assets.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedType === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedType("ALL")}
            className={selectedType === "ALL" ? "bg-white text-black hover:bg-white/90" : "border-white/10"}
          >
            All Assets
          </Button>
          <Button 
            variant={selectedType === "WTR" ? "default" : "outline"}
            onClick={() => setSelectedType("WTR")}
            className={selectedType === "WTR" ? "bg-primary text-background hover:bg-primary/90" : "border-white/10"}
          >
            <Droplets className="w-4 h-4 mr-2" /> Water
          </Button>
          <Button 
            variant={selectedType === "ENG" ? "default" : "outline"}
            onClick={() => setSelectedType("ENG")}
            className={selectedType === "ENG" ? "bg-amber-500 text-black hover:bg-amber-600" : "border-white/10"}
          >
            <Zap className="w-4 h-4 mr-2" /> Energy
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search by name, region, source, or batch ID..." 
          className="pl-12 h-14 text-lg bg-black/20 border-white/10 rounded-xl focus-visible:ring-primary/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
           <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
             <Filter className="w-4 h-4 mr-2" /> Filters
           </Button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <Card key={batch.id} className="glass-panel overflow-hidden group flex flex-col hover:border-primary/30 transition-all duration-300">
            <div className="relative h-32 bg-black/40 border-b border-white/5 p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start relative z-10">
                <Badge className={`${batch.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')} border-none`}>
                  {batch.type} Credit
                </Badge>
                <div className="flex items-center gap-1 text-xs font-mono text-white/60 bg-black/40 px-2 py-1 rounded">
                   <Calendar className="w-3 h-3" /> {batch.vintage}
                </div>
              </div>
              
              <div className="relative z-10 flex items-end justify-between">
                <div className="text-2xl font-bold font-mono">
                   {batch.amount.toLocaleString()} <span className="text-sm text-muted-foreground font-sans">{batch.unit}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6 flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{batch.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                   <Factory className="w-3 h-3" /> {batch.source}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                 <div className="p-2 rounded bg-white/5 border border-white/5">
                    <div className="text-xs text-muted-foreground mb-0.5">Region</div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-primary" /> {batch.region}
                    </div>
                 </div>
                 <div className="p-2 rounded bg-white/5 border border-white/5">
                    <div className="text-xs text-muted-foreground mb-0.5">Retires</div>
                    <div className="truncate">{batch.retirementDate}</div>
                 </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-bold flex-1">
                    <Send className="w-4 h-4 mr-2" /> Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10">
                  <DialogHeader>
                    <DialogTitle>Transfer Assets</DialogTitle>
                    <DialogDescription>Send {batch.name} to another wallet.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Recipient Address (XRPL)</Label>
                      <Input 
                        placeholder="r..." 
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="bg-black/20 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount ({batch.unit})</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="bg-black/20 border-white/10"
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        Available: {batch.amount}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleTransfer} disabled={isTransferring || !recipientAddress || !transferAmount} className="w-full bg-primary text-background">
                      {isTransferring ? "Sending..." : "Confirm Transfer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Link href={`/explorer?search=${batch.id}`} className="flex-none">
                <Button variant="ghost" size="icon" className="border border-white/10 hover:bg-white/10">
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

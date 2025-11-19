import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_BATCHES } from "@/lib/mockData";
import { Search, Filter, MapPin, Calendar } from "lucide-react";

export default function Explorer() {
  const [search, setSearch] = useState("");

  const filteredBatches = MOCK_BATCHES.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold">Batch Explorer</h1>
        <p className="text-muted-foreground">Verify provenance and metadata of all environmental assets on Nexus.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Batch ID, Region, or Tech..." 
            className="pl-10 bg-black/20 border-white/10 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 px-4 rounded-lg border border-white/10 bg-black/20 text-sm text-muted-foreground cursor-pointer hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-card/30 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Batch ID / Name</TableHead>
              <TableHead className="text-white font-bold">Type</TableHead>
              <TableHead className="text-white font-bold">Region</TableHead>
              <TableHead className="text-white font-bold">Vintage</TableHead>
              <TableHead className="text-white font-bold text-right">Amount</TableHead>
              <TableHead className="text-white font-bold text-right">Peg (CO2e)</TableHead>
              <TableHead className="text-white font-bold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map((batch) => (
              <TableRow key={batch.id} className="border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                <TableCell>
                  <div className="font-medium text-white group-hover:text-primary transition-colors">{batch.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{batch.id}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={batch.type === 'WTR' ? 'border-blue-500/50 text-blue-400' : 'border-amber-500/50 text-amber-400'}>
                    {batch.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {batch.region}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                    <Calendar className="w-3 h-3" /> {batch.vintage}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {batch.amount.toLocaleString()} <span className="text-xs text-muted-foreground">{batch.unit}</span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {batch.peg} <span className="text-xs text-muted-foreground">g/{batch.unit}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`
                    ${batch.status === 'Minted' && 'bg-primary/20 text-primary hover:bg-primary/30'}
                    ${batch.status === 'Trading' && 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}
                    ${batch.status === 'Retired' && 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'}
                  `}>
                    {batch.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

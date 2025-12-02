import { useState } from "react";
import { motion } from "framer-motion";
import OracleDetail from "@/hooks/oracleDetail";
import { useRef, useEffect, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_BATCHES } from "@/lib/mockData";
import { useExplorerDevices } from "@/hooks/useExplorerDevices";
import { Search, Filter, MapPin, Calendar, Droplet, Zap, ShieldCheck } from "lucide-react";

export default function Explorer() {
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOracleIndex, setSelectedOracleIndex] = useState<string | null>(null);

  const { devices } = useExplorerDevices();
  const deviceRows = devices.map(device => {
    const hasTov = typeof device.tov === 'number' && !isNaN(device.tov);
    const type = device.name?.slice(0, 3).toUpperCase() || '';
    let peg = '-';
    if (hasTov && device.class) {
      const classLetter = device.class.slice(-1).toUpperCase();
      let multiplier = 0;
      if (classLetter === 'A') multiplier = 100;
      else if (classLetter === 'B') multiplier = 75;
      else if (classLetter === 'C') multiplier = 50;
      else if (classLetter === 'D') multiplier = 25;
      if (multiplier > 0 && typeof device.tov === 'number') {
        peg = (device.tov * multiplier).toLocaleString();
      }
    }
    return {
      id: device.oracleIndex || device.account,
      name: device.name,
      type,
      region: device.region,
      vintage: device.creationDate ? device.creationDate.slice(0, 7) : '',
      amount: hasTov ? device.tov : '-',
      unit: type === 'WTR' ? 'L' : '',
      peg,
      pegUnit: type === 'WTR' ? 'g/L' : '',
      status: hasTov ? 'Active' : 'Pending',
      oracleIndex: device.oracleIndex,
      isDevice: true,
    };
  });
  const batchRows = MOCK_BATCHES.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.region.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBatches = [...deviceRows, ...batchRows];

  const tableRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (step === 2) {
      // Scroll to the very top of the page after OracleDetail is rendered
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
    }
  }, [step, selectedOracleIndex]);

  return (
    <div className="flex flex-col min-h-screen">
      {step === 1 && (
        <>


          <motion.div
            className="space-y-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-display font-bold">Device & Oracle Explorer</h1>
            <p className="text-muted-foreground">
              Explore real-time, machine-verified data from Nexus-connected devices and oracles. Each entry represents a live environmental asset such as water or energy production directly linked to on-chain credits and carbon offset.
            </p>
          </motion.div>

          {/* Modern Card Grid for Regenerative Tech, Carbon Offsets, and Credit Tokens */}
          <motion.div
            className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Water Credits ($WTR) */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center bg-blue-900/20 border border-blue-500/30 rounded-2xl p-8 shadow-lg h-full"
            >
              <Droplet className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="text-xl font-bold text-blue-200 mb-2">Water Credits ($WTR)</h3>
              <p className="text-base text-blue-100 text-center mb-2">Tokenized water savings from Atmospheric Water Generators (AWG) and recycling systems. Pegged to liters conserved. Minting rate and carbon offset are class-based: the more efficient the device, the more $WTR and CO₂e avoided.</p>
              <div className="text-xs text-blue-300 mt-auto">1 $WTR = up to 1 kg CO₂e avoided</div>
            </motion.div>
            {/* Energy Credits ($ENG) */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-8 shadow-lg h-full"
            >
              <Zap className="w-10 h-10 text-yellow-400 mb-3" />
              <h3 className="text-xl font-bold text-yellow-200 mb-2">Energy Credits ($ENG)</h3>
              <p className="text-base text-yellow-100 text-center mb-2">Verified renewable energy production from solar and wind. Pegged to kWh generated and CO₂e offset. Minting rate and carbon offset are class-based: the cleaner the grid, the more $ENG and CO₂e offset.</p>
              <div className="text-xs text-yellow-300 mt-auto">1 $ENG = up to 1 kg CO₂e offset</div>
            </motion.div>
            {/* Verified & Auditable */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center bg-green-900/20 border border-green-500/30 rounded-2xl p-8 shadow-lg h-full"
            >
              <ShieldCheck className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="text-xl font-bold text-green-200 mb-2">Verified & Auditable</h3>
              <p className="text-base text-green-100 text-center mb-2">Every token is backed by on-chain oracle signatures and device hashes. Full lineage from IoT sensor to retirement. Fractionalized Carbon Credit Engine ensures every mint is transparently tied to real CO₂e data.</p>
              <div className="text-xs text-green-300 mt-auto">FCC Oracle: On-chain carbon accounting</div>
            </motion.div>
          </motion.div>



          <motion.div
            className="rounded-lg bg-card/40 border border-blue-400/20 p-4 mt-6 mb-8 text-base text-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <strong>Summary:</strong> This explorer displays all registered Nexus devices and their latest oracle data. You can view total output, asset class, carbon offset, and claim history for each device. Click a device name to see detailed production logs, oracle transactions, and regeneration analytics.
          </motion.div>

          {/* Search Bar */}

          <motion.div
            className="flex gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Device, Oracle Entry, Region, or Tech..."
                className="pl-10 bg-black/20 border-white/10 h-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-4 rounded-lg border border-white/10 bg-black/20 text-sm text-muted-foreground cursor-pointer hover:bg-white/5 transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </div>
          </motion.div>

          {/* Table */}

          <div ref={tableRef} className="rounded-xl border border-white/10 overflow-hidden bg-card/30 backdrop-blur-sm mb-2 min-h-[320px]">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white font-bold">Device Name</TableHead>
                  <TableHead className="text-white font-bold">Type</TableHead>
                  <TableHead className="text-white font-bold">Region</TableHead>
                  <TableHead className="text-white font-bold">Vintage</TableHead>
                  <TableHead className="text-white font-bold text-right">Amount</TableHead>
                  <TableHead className="text-white font-bold text-right">Peg (CO2e)</TableHead>
                  <TableHead className="text-white font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceRows.slice(0, 10).map((device) => (
                  <TableRow
                    key={device.id}
                    className="border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <TableCell>
                      <div className="font-medium text-white group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedOracleIndex(device.oracleIndex); setStep(2); }}>
                        {device.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{device.id}</div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge variant="outline" className={device.type === 'WTR' ? 'border-blue-500/50 text-blue-400 min-w-[48px] justify-center' : 'border-amber-500/50 text-amber-400 min-w-[48px] justify-center'}>
                        {device.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {device.region}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                        <Calendar className="w-3 h-3" /> {device.vintage}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {typeof device.amount === 'number' ? device.amount.toLocaleString() : device.amount} <span className="text-xs text-muted-foreground">{device.unit}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {device.peg} <span className="text-xs text-muted-foreground">{device.pegUnit}</span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {device.status === 'Active' ? (
                        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 min-w-[72px] justify-center">Active</Badge>
                      ) : device.status === 'Pending' ? (
                        <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 min-w-[72px] justify-center">Pending</Badge>
                      ) : (
                        <Badge className={`min-w-[72px] justify-center`}>{device.status}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Message below table */}

          <motion.div
            className="w-full max-w-4xl mx-auto text-center text-muted-foreground text-base py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <span className="inline-flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-green-500/80"></span><span className="font-semibold text-white">Active</span> <span className="text-muted-foreground">~ currently generating unclaimed credits</span></span>
              <span className="inline-flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400/80"></span><span className="font-semibold text-yellow-200">Pending</span> <span className="text-muted-foreground">~ awaiting oracle data</span></span>
              <span className="inline-flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-blue-400/80"></span><span className="font-semibold text-blue-200">Minting</span> <span className="text-muted-foreground">~ has produced $WTR or $ENG credits</span></span>
              <span className="inline-flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-gray-400/80"></span><span className="font-semibold text-gray-200">Retired</span> <span className="text-muted-foreground">~ no longer generating</span></span>
            </div>
          </motion.div>
        </>
      )}
      {step === 2 && selectedOracleIndex && (
        <motion.div
          key={selectedOracleIndex}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <OracleDetail oracleIndex={selectedOracleIndex} onBack={() => setStep(1)} />
        </motion.div>
      )}

      {/* ...existing code... */}
    </div>
  );
}

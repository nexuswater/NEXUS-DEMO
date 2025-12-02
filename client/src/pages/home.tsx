import { motion } from "framer-motion";
import { ArrowRight, Droplets, Zap, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@assets/generated_images/Abstract_dark_water_and_digital_data_network_visualization_76282010.png";

const stats = [
  { label: "Total Value Locked", value: "$4.2M", change: "+12%" },
  { label: "Carbon Offset (t)", value: "145k", change: "+8%" },
  { label: "Active Devices", value: "1,204", change: "+24%" },
  { label: "XRPL Transactions", value: "892k", change: "+15%" },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center border border-white/10">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Nexus Water Digital Network" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-16 max-w-2xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              LIVE ON XRPL DEVNET
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-4">
              Real World Assets.<br/>
              <span className="text-gradient">Planet Positive.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Mint, trade, and retire environmental assets on the XRP Ledger. 
              Turn verified water and energy savings into liquid digital capital.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/mint">
              <Button size="lg" className="h-12 px-8 bg-primary text-background hover:bg-primary/90 text-base">
                Start Minting <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/explorer">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5 text-base">
                View Explorer
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="glass-panel border-none bg-card/30">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="text-2xl font-mono font-bold flex items-baseline gap-2">
                  {stat.value}
                  <span className="text-xs text-primary font-normal">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 border border-blue-500/20">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Water Credits ($WTR)</h3>
            <p className="text-muted-foreground">
              Tokenized water savings from Atmospheric Water Generators (AWG) and recycling systems. 
              Pegged to liters conserved.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Energy Credits ($ENG)</h3>
            <p className="text-muted-foreground">
              Verified renewable energy production from solar and wind. 
              Pegged to kWh generated and CO2e offset.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-0 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Verified & Auditable</h3>
            <p className="text-muted-foreground">
              Every token is backed by on-chain oracle signatures and device hashes. 
              Full lineage from IoT sensor to retirement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Upload, CheckCircle2, Server, Cpu, FileText, Link2, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Mint() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<"WTR" | "ENG" | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"IOT" | "UTILITY">("IOT");

  const handleMint = () => {
    setIsMinting(true);
    // Mock API call time
    setTimeout(() => {
      setIsMinting(false);
      setStep(3);
      toast({
        title: "Minting Successful",
        description: "Batch WTR-PA-HNL-2025-X has been minted on XRPL.",
      });
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold">Mint Assets</h1>
        <p className="text-muted-foreground">Turn your environmental data into tradeable XRPL tokens.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-4 flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
              step >= s 
                ? "bg-primary text-background border-primary" 
                : "bg-card border-white/10 text-muted-foreground"
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`h-px flex-1 ${step > s ? "bg-primary" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Select Asset Type</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div 
                className={`p-6 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                  selectedType === "WTR" ? "border-primary bg-primary/5" : "border-white/10 bg-card/50"
                }`}
                onClick={() => setSelectedType("WTR")}
              >
                <Droplets className={`w-8 h-8 mb-4 ${selectedType === "WTR" ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-bold mb-2">Water Credit ($WTR)</h3>
                <p className="text-sm text-muted-foreground">For AWG, filtration, and recycling systems.</p>
              </div>

              <div 
                className={`p-6 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                  selectedType === "ENG" ? "border-amber-500 bg-amber-500/5" : "border-white/10 bg-card/50"
                }`}
                onClick={() => setSelectedType("ENG")}
              >
                <Zap className={`w-8 h-8 mb-4 ${selectedType === "ENG" ? "text-amber-500" : "text-muted-foreground"}`} />
                <h3 className="font-bold mb-2">Energy Credit ($ENG)</h3>
                <p className="text-sm text-muted-foreground">For Solar, Wind, and renewable generation.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              disabled={!selectedType} 
              onClick={() => setStep(2)}
              className="bg-primary text-background hover:bg-primary/90"
            >
              Next Step
            </Button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Data Verification Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="IOT" onValueChange={(v) => setVerificationMethod(v as any)} className="w-full">
                <TabsList className="bg-black/20 border border-white/10 w-full grid grid-cols-2 mb-6">
                  <TabsTrigger value="IOT" className="data-[state=active]:bg-white/10">
                    <Cpu className="w-4 h-4 mr-2" /> IoT Device Stream
                  </TabsTrigger>
                  <TabsTrigger value="UTILITY" className="data-[state=active]:bg-white/10">
                    <FileText className="w-4 h-4 mr-2" /> Utility Bill / API
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="IOT" className="space-y-6">
                  <div className="grid gap-2">
                    <Label>Select Verified Device</Label>
                    <Select>
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="Select a device..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev1">AWG-Honolulu-01 (Active)</SelectItem>
                        <SelectItem value="dev2">Solar-Roof-B2 (Active)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" className="bg-black/20 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" className="bg-black/20 border-white/10" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="UTILITY" className="space-y-6">
                  <div className="p-4 border border-dashed border-white/20 rounded-xl bg-white/5 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                       <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Upload Utility Bill</h3>
                      <p className="text-sm text-muted-foreground">PDF or Image formats supported. Max 5MB.</p>
                    </div>
                    <Button variant="outline" className="border-white/10">Select File</Button>
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or Connect Provider</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <Button variant="outline" className="h-16 border-white/10 hover:bg-white/5 hover:border-primary/50 flex flex-col gap-1 items-center justify-center">
                       <span className="font-bold">UtilityAPI</span>
                       <Badge variant="secondary" className="text-[10px] h-4 px-1">Auto-Sync</Badge>
                     </Button>
                     <Button variant="outline" className="h-16 border-white/10 hover:bg-white/5 hover:border-primary/50 flex flex-col gap-1 items-center justify-center">
                       <span className="font-bold">Arcadia</span>
                       <Badge variant="secondary" className="text-[10px] h-4 px-1">Auto-Sync</Badge>
                     </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="p-4 rounded-lg bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Oracle Status</span>
                  <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Source</span>
                  <span className="font-mono flex items-center gap-2">
                    {verificationMethod === 'IOT' ? <Cpu className="w-3 h-3" /> : <Link2 className="w-3 h-3" />} 
                    {verificationMethod === 'IOT' ? 'Direct Sensor Stream' : 'Utility Provider API'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calculated Output</span>
                  <span className="font-mono text-primary font-bold">1,250 {selectedType === 'WTR' ? 'L' : 'kWh'}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 mt-0.5">
                       <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-emerald-400">Nexus Protocol Rewards</div>
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This batch initiates a <span className="text-white">12-month vesting schedule</span>. 
                        Tradable value decreases by 1/12 monthly as assets are auto-retired.
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs font-mono bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded w-fit">
                        <span>Generating:</span>
                        <span className="text-emerald-400 font-bold">~104.16 NXS / month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button 
              onClick={handleMint} 
              disabled={isMinting}
              className="bg-primary text-background hover:bg-primary/90 min-w-[140px]"
            >
              {isMinting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Minting...
                </div>
              ) : (
                "Mint Batch"
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white">Batch Successfully Minted!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your assets have been tokenized on the XRPL Mainnet. You can now trade them on the DEX or retire them for carbon credits.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>Mint Another</Button>
            <Button className="bg-primary text-background hover:bg-primary/90">View in Explorer</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

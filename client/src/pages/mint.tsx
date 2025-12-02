import { useState, useMemo, useEffect } from "react";
import { useDevices } from "@/hooks/useDevices";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Upload, CheckCircle2, Server, Cpu, FileText, Copy, Link2, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useBalanceContext } from "@/components/layout/Layout";
import { useManageOracleData } from "@/hooks/manageOracleData";
import { useManageMptMint } from "@/hooks/manageMptMint";
import TxResultModal from "@/components/modals/txnResult";
import OracleDataModal from "@/components/modals/oracleData";
import { AddDeviceModal } from "@/components/AddDeviceModal";
import { RemoveDeviceModal } from "@/components/RemoveDeviceModal";
import OracleDataStatusModal from "@/components/modals/oracleDataStatusModal";


interface MintProps {
  xrplAddress: string | null;
  isConnected: boolean;
}


const Mint = React.memo(({ xrplAddress, isConnected }: MintProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<"WTR" | "ENG" | null>(null);

  // Handler to show WIP modal for ENG
  const handleSelectType = (type: "WTR" | "ENG") => {
    setSelectedType(type);
    if (type === "ENG") {
      setShowEngModal(true);
    }
  };

  const [isMinting, setIsMinting] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"IOT" | "UTILITY">("IOT");

  // Device management (now uses connected account)
  const {
    devices,
    showAddDevice,
    setShowAddDevice,
    newDevice,
    setNewDevice,
    addDevice,
    removeDevice,
  } = useDevices(xrplAddress || undefined);

  const memoizedDevices = useMemo(() => devices, [devices]);

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

  const { xrpBalance, wtrBalance, engBalance } = useBalanceContext();
  const { fetchOracleData, fetchTOV, error } = useManageOracleData();

  const [showEngModal, setShowEngModal] = useState(false);
  const [showOracleModal, setShowOracleModal] = useState(false);
  const [showRemoveDeviceModal, setShowRemoveDeviceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<any>(null);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);
  const [fetchCompleted, setFetchCompleted] = useState(false);
  const [calculatedTOV, setCalculatedTOV] = useState<string | null>(null);
  const [sourceClass, setSourceClass] = useState<string | null>(null);

  // Add state variables for reward calculations
  const [activeTime, setActiveTime] = useState<string>("");
  const [reducedReward, setReducedReward] = useState<number>(104.16); // Default reward
  const [reductionCounter, setReductionCounter] = useState<string>("");

  // Modal for ENG WIP message
  const EngModal = () => (
    <div className={`fixed inset-0 flex items-center justify-center bg-black/70 ${showEngModal ? 'block' : 'hidden'}`}>
      <div className="bg-card p-6 rounded-xl shadow-xl max-w-sm w-full border border-white/10">
        <h2 className="text-xl font-bold text-primary mb-4">Energy Credit ($ENG)</h2>
        <p className="text-sm text-muted-foreground mb-4">This feature is a work in progress. Minting for ENG will be available soon.</p>
        <div className="flex justify-end">
          <button
            onClick={() => setShowEngModal(false)}
            className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const handleRemoveDevice = async (deviceName: string) => {
    try {
      await removeDevice(deviceName);
      setShowRemoveDeviceModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setShowRemoveDeviceModal(false);
      setShowErrorModal(true);
    }
  };

  const handleDeviceSelect = async (deviceName: string) => {
    const device = memoizedDevices.find((d: any) => d.name === deviceName);
    setSelectedDeviceDetails(device);

    if (device?.oracleIndex) {
      try {
        const response = await fetch(`/api/devices/${device.account}`);
        if (response.ok) {
          const data = await response.json();
          const selectedDevice = data.devices.find((d: any) => d.name === deviceName);
          setSelectedDeviceDetails({
            ...selectedDevice,
            wtrClaims: selectedDevice.wtrClaims,
            wtrReceived: selectedDevice.wtrReceived,
            lastWtrClaim: selectedDevice.lastWtrClaim,
          });
        }
      } catch (error) {
        console.error("Failed to fetch device details:", error);
      }
    }
  };

  // Format the creation date to display as D/M/Y
  const formattedCreationDate = selectedDeviceDetails ? new Date(selectedDeviceDetails.createdAt).toLocaleDateString('en-GB') : '';

  useEffect(() => {
    const fetchTOVForDevice = async () => {
      if (selectedDeviceDetails?.oracleIndex) {
        const response = await fetch(`/api/oracle-data/tov?oracleIndex=${selectedDeviceDetails.oracleIndex}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCalculatedTOV(data.tov ? `${data.tov} ${selectedType === 'WTR' ? 'L' : 'kWh'}` : 'N/A');
          setSourceClass(data.assetClass || 'N/A');
        } else {
          setCalculatedTOV('N/A');
          setSourceClass('N/A');
        }
      } else {
        setCalculatedTOV('N/A');
        setSourceClass('N/A');
      }
    };

    fetchTOVForDevice();
  }, [selectedDeviceDetails?.oracleIndex, selectedType]);

  // Calculate reward reduction and active time
  useEffect(() => {
    if (selectedDeviceDetails) {
      const creationDate = new Date(selectedDeviceDetails.createdAt);
      const lastClaimDate = selectedDeviceDetails.lastWtrClaim ? new Date(selectedDeviceDetails.lastWtrClaim) : null;
      const startDate = lastClaimDate || creationDate;
      const now = new Date();

      // Calculate active time
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      setActiveTime(`${months} months, ${days} days`);

      // Calculate reward reduction
      const monthsSinceStart = Math.max(0, months - 1); // Start reduction after 1 month
      const newReward = Math.max(0, 104.16 - (104.16 / 12) * monthsSinceStart);
      setReducedReward(newReward);

      // Calculate reduction counter
      const nextReductionDate = new Date(startDate);
      nextReductionDate.setMonth(nextReductionDate.getMonth() + monthsSinceStart + 1);
      const daysUntilNextReduction = Math.ceil((nextReductionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setReductionCounter(`${daysUntilNextReduction} days remaining`);
    }
  }, [selectedDeviceDetails]);

  // State variables for authorization and minting
  const [isAuthorizingUser, setIsAuthorizingUser] = useState(false);
  const [isAuthorizingIssuer, setIsAuthorizingIssuer] = useState(false);
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const [isIssuerAuthorized, setIsIssuerAuthorized] = useState(false);

  // Function to handle user authorization
  const handleUserAuthorization = async () => {
    setIsAuthorizingUser(true);
    try {
      // Logic to check and authorize user
      const authorized = await checkUserAuthorization(); // Replace with actual function
      setIsUserAuthorized(authorized);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("User authorization failed:", error);
      setShowErrorModal(true);
    } finally {
      setIsAuthorizingUser(false);
    }
  };

  // Function to handle issuer authorization
  const handleIssuerAuthorization = async () => {
    setIsAuthorizingIssuer(true);
    try {
      // Logic to check and authorize issuer
      const authorized = await checkIssuerAuthorization(); // Replace with actual function
      setIsIssuerAuthorized(authorized);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Issuer authorization failed:", error);
      setShowErrorModal(true);
    } finally {
      setIsAuthorizingIssuer(false);
    }
  };

  // Function to handle minting process
  const handleMinting = async () => {
    if (!xrplAddress) {
      setShowErrorModal(true);
      return;
    }

    setIsMinting(true);
    try {
      // Use the actual mint function from the hook
      const result = await mint(xrplAddress, "100"); // Replace "100" with the desired amount
      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Minting failed:", error);
      setShowErrorModal(true);
    } finally {
      setIsMinting(false);
    }
  };

  // Placeholder function to check user authorization
  const checkUserAuthorization = async () => {
    // Replace with actual logic to verify user authorization
    return true; // Assume user is authorized for now
  };

  // Placeholder function to check issuer authorization
  const checkIssuerAuthorization = async () => {
    // Replace with actual logic to verify issuer authorization
    return true; // Assume issuer is authorized for now
  };

  const { authorizeHolder, mint } = useManageMptMint();

  const handleAuthorizeHolder = async (account: string) => {
    try {
      const result = await authorizeHolder(account);
      console.log("Authorization Result:", result);
      toast({ title: "Authorization Successful", description: "Holder authorization was successful." });
    } catch (error) {
      console.error("Error authorizing holder:", error);
      toast({ title: "Authorization Failed", description: "Unable to authorize holder.", variant: "destructive" });
    }
  };

  const handleMintAction = async (account: string, amount: string) => {
    try {
      const result = await mint(account, amount);
      console.log("Mint Result:", result);
      if (result.success) {
        setTxResult(result.txResult || result);
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error during mint:", error);
      setShowErrorModal(true);
    }
  };

  // Add state for status modal
  const [oracleStatus, setOracleStatus] = useState<{ open: boolean; loading: boolean; success: boolean; count?: number; index?: string }>({ open: false, loading: false, success: false });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Success Modal for Mint Transaction */}
      <TxResultModal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} txResult={txResult} />
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
        <div key="mint-step-1" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Select Asset Type</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div 
                className={`p-6 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                  selectedType === "WTR" ? "border-primary bg-primary/5" : "border-white/10 bg-card/50"
                }`}
                onClick={() => handleSelectType("WTR")}
              >
                <Droplets className={`w-8 h-8 mb-4 ${selectedType === "WTR" ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-bold mb-2">Water Credit ($WTR)</h3>
                <p className="text-sm text-muted-foreground">For AWG, filtration, and recycling systems.</p>
              </div>

              <div 
                className={`p-6 rounded-xl border cursor-pointer transition-all hover:bg-white/5 ${
                  selectedType === "ENG" ? "border-amber-500 bg-amber-500/5" : "border-white/10 bg-card/50"
                }`}
                onClick={() => handleSelectType("ENG")}
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
        </div>
      )}

      {step === 2 && (
        <motion.div key="mint-step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <Label>Select Verified Device</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-xs px-2 py-1 hover:bg-green-500/10 hover:border-green-500 hover:text-green-500"
                          onClick={() => setShowAddDevice(true)}
                        >
                          + Add Device
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-xs px-2 py-1 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500"
                          onClick={() => setShowRemoveDeviceModal(true)}
                        >
                          - Remove Device
                        </Button>
                      </div>
                    </div>
                    <Select
                      value={selectedDeviceDetails?.name || ""}
                      onValueChange={handleDeviceSelect}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="Select a device..." />
                      </SelectTrigger>
                      <SelectContent>
                        {memoizedDevices.map((d: any, i: number) => (
                          <SelectItem key={i} value={d.name}>
                            {d.name} ({d.tech})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <AddDeviceModal
                    open={showAddDevice}
                    onClose={() => setShowAddDevice(false)}
                    newDevice={newDevice}
                    setNewDevice={setNewDevice}
                    onAdd={addDevice}
                  />
                  <RemoveDeviceModal
                    open={showRemoveDeviceModal}
                    onClose={() => setShowRemoveDeviceModal(false)}
                    devices={devices}
                    onRemove={handleRemoveDevice}
                  />

                  {selectedDeviceDetails && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Creation Date</Label>
                        <Input
                          type="text"
                          className="bg-black/20 border-white/10"
                          value={formattedCreationDate}
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Fetch Date</Label>
                        <Input
                          type="text"
                          className="bg-black/20 border-white/10"
                          value={
                            selectedDeviceDetails?.lastFetchTime
                              ? `${new Date(selectedDeviceDetails.lastFetchTime).toLocaleDateString('en-GB')} ` +
                                `\u00a0\u00a0` +
                                `${new Date(selectedDeviceDetails.lastFetchTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                              : "Not fetched yet"
                          }
                          readOnly
                        />
                      </div>
                      <div className="space-y-2 col-span-2 justify-center content-center flex gap-9">
                        {selectedDeviceDetails?.lastFetchTime ? (
                          <div className="flex justify-center content-center gap-8">
                            <Button
                              className="bg-primary text-background hover:bg-primary/90 w-40"
                              onClick={() => setShowOracleModal(true)}
                            >
                              View Oracle Data
                            </Button>
                            <OracleDataModal open={showOracleModal} onClose={() => setShowOracleModal(false)} oracleIndex={selectedDeviceDetails?.oracleIndex || null} />
                            <Button
                              className="bg-primary text-background hover:bg-primary/90 w-40"
                              onClick={async () => {
                                if (selectedDeviceDetails?.oracleIndex) {
                                  setOracleStatus({ open: true, loading: true, success: false });
                                  await fetchOracleData(selectedDeviceDetails.oracleIndex);
                                  // Fetch the latest data from the DB for entry count
                                  const res = await fetch(`/api/oracle-data/read?oracleIndex=${selectedDeviceDetails.oracleIndex}`);
                                  const data = await res.json();
                                  setOracleStatus({ open: true, loading: false, success: true, count: data.data?.length || 0, index: selectedDeviceDetails.oracleIndex });
                                  const currentTime = new Date().toISOString();
                                  setSelectedDeviceDetails((prevDetails: any) => ({ ...prevDetails, lastFetchTime: currentTime }));
                                  setFetchCompleted(true);
                                  setLastFetchDate(currentTime);
                                } else {
                                  console.error("No oracleIndex available for the selected device.");
                                }
                              }}
                            >
                              Update Oracle Data
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-primary text-background hover:bg-primary/90"
                            onClick={async () => {
                              console.log("Selected Device Details:", selectedDeviceDetails);
                              if (!selectedDeviceDetails?.oracleIndex) {
                                console.error("No device selected");
                                alert("Please select a device before fetching oracle data.");
                                return;
                              }

                              setOracleStatus({ open: true, loading: true, success: false });
                              await fetchOracleData(selectedDeviceDetails.oracleIndex);
                              setOracleStatus({ open: true, loading: false, success: true });
                              if (!error) {
                                setFetchCompleted(true);
                                setLastFetchDate(new Date().toISOString());
                              } else {
                                console.error("Error fetching oracle data:", error);
                                alert("Failed to fetch oracle data. Please try again.");
                              }
                            }}
                          >
                            Fetch Oracle Data
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

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
                  <span className="text-muted-foreground">Device Name</span>
                  <span className="text-primary font-mono">{selectedDeviceDetails?.name || "Not selected"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Oracle Index</span>
                  <span className="font-mono text-xs text-primary">{selectedDeviceDetails?.oracleIndex || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Oracle Status</span>
                  <span className={`flex items-center gap-1 ${selectedDeviceDetails?.lastFetchTime ? 'text-green-400' : 'text-red-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedDeviceDetails?.lastFetchTime ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Source</span>
                  <span className="font-mono flex items-center gap-2">
                    {selectedDeviceDetails?.tech === 'IOT' ? <Cpu className="w-3 h-3" /> : <Link2 className="w-3 h-3" />} 
                    {selectedDeviceDetails?.tech === 'IOT' ? 'Direct Sensor Stream' : selectedDeviceDetails?.tech || 'Unknown Source'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calculated Output</span>
                  <span className="font-mono text-primary font-bold">
                    {calculatedTOV || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Regenerative Class</span>
                  <span className="font-mono text-primary font-bold">
                    {sourceClass || 'N/A'}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 mt-0.5">
                       <Server className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-emerald-400">Nexus Protocol Rewards</div>
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This batch initiates a <span className="text-white">12-month vesting schedule</span>. 
                        Tradable value decreases by 1/12 monthly as assets are auto-retired.
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Active Time: <span className="text-white">{activeTime}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Next Reduction: <span className="text-white">{reductionCounter}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Current TOV Conversion: <span className="text-white">{calculatedTOV || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 text-xs font-mono bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded w-fit text-right">
                          <div className="flex items-center justify-between">
                            <span>Generation rate:</span>
                            <span className="text-emerald-400 font-bold">1L / 1 WTR (Class A)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Available WTR to Claim:</span>
                            <span className="text-emerald-400 font-bold">{calculatedTOV?.replace('L', '') || 'N/A'} $WTR</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Last Claim Date:</span>
                            <span className="text-emerald-400 font-bold">{selectedDeviceDetails?.lastWtrClaim ? new Date(selectedDeviceDetails.lastWtrClaim).toLocaleDateString('en-GB') : 'Not claimed yet'}</span>
                          </div>
                        </div>
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
              onClick={() => setStep(3)} 
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
        <motion.div
          key="mint-step-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 py-12"
        >
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Authorisation and Mint ( $WTR )</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Device Details Section */}
              <div className="p-4 rounded-lg bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Device Name</span>
                  <span className="text-primary font-mono">{selectedDeviceDetails?.name || "Not selected"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Oracle Index</span>
                  <span className="font-mono text-xs text-primary">{selectedDeviceDetails?.oracleIndex || "Not available"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Oracle Status</span>
                  <span className={`flex items-center gap-1 ${selectedDeviceDetails?.lastFetchTime ? 'text-green-400' : 'text-red-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedDeviceDetails?.lastFetchTime ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Source</span>
                  <span className="font-mono flex items-center gap-2">
                    {selectedDeviceDetails?.tech === 'IOT' ? <Cpu className="w-3 h-3" /> : <Link2 className="w-3 h-3" />} 
                    {selectedDeviceDetails?.tech === 'IOT' ? 'Direct Sensor Stream' : selectedDeviceDetails?.tech || 'Unknown Source'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calculated Output</span>
                  <span className="font-mono text-primary font-bold">
                    {calculatedTOV || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Regenerative Class</span>
                  <span className="font-mono text-primary font-bold">
                    {sourceClass || 'N/A'}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 mt-0.5">
                       <Server className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-emerald-400">Nexus Protocol Rewards</div>
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This batch initiates a <span className="text-white">12-month vesting schedule</span>. 
                        Tradable value decreases by 1/12 monthly as assets are auto-retired.
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Active Time: <span className="text-white">{activeTime}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Next Reduction: <span className="text-white">{reductionCounter}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Current TOV Conversion: <span className="text-white">{calculatedTOV || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 text-xs font-mono bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded w-fit text-right">
                          <div className="flex items-center justify-between">
                            <span>Generation rate:</span>
                            <span className="text-emerald-400 font-bold">1L / 1 WTR (Class A)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Available WTR to Claim:</span>
                            <span className="text-emerald-400 font-bold">{calculatedTOV?.replace('L', '') || 'N/A'} $WTR</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Last Claim Date:</span>
                            <span className="text-emerald-400 font-bold">{selectedDeviceDetails?.lastWtrClaim ? new Date(selectedDeviceDetails.lastWtrClaim).toLocaleDateString('en-GB') : 'Not claimed yet'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Authorization Buttons */}
              <div className="space-y-6">
                {/* Check if MPT balance exists */}
                {wtrBalance || engBalance ? (
                  <div className="p-6 rounded-lg bg-black/30 border border-white/10 space-y-4">
                    <h3 className="text-xl font-bold text-primary">MPT Balance Detected</h3>
                    <p className="text-sm text-muted-foreground">
                      Your account already holds the Multi-Purpose Token (MPT). You can proceed with the minting process.
                    </p>
                    <Button
                      className="bg-primary text-background hover:bg-primary/90"
                      onClick={async () => {
                        if (!xrplAddress) {
                          setShowErrorModal(true);
                          return;
                        }

                        setIsMinting(true);
                        try {
                          const amountToMint = calculatedTOV?.replace('L', '') || '0';
                          console.log("Minting amount:", amountToMint);
                          const result = await mint(xrplAddress, amountToMint);
                          if (result.success) {
                            setTxResult(result.txResult || result);
                            setShowSuccessModal(true);
                          } else {
                            setShowErrorModal(true);
                          }
                        } catch (error) {
                          console.error("Minting failed:", error);
                          setShowErrorModal(true);
                        } finally {
                          setIsMinting(false);
                        }
                      }}
                      disabled={isMinting}
                    >
                      {isMinting ? "Minting..." : "Mint Tokens"}
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-black/30 border border-white/10 space-y-4">
                    <h3 className="text-xl font-bold text-primary">No MPT Balance Detected</h3>
                    <p className="text-sm text-muted-foreground">
                      Please ensure your account is authorized and holds the Multi-Purpose Token (MPT) before proceeding.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <OracleDataStatusModal
        open={oracleStatus.open}
        loading={oracleStatus.loading}
        success={oracleStatus.success}
        entryCount={oracleStatus.count}
        oracleIndex={oracleStatus.index}
        onClose={() => setOracleStatus({ open: false, loading: false, success: false })}
      />
    </div>
  );
});

Mint.displayName = "Mint";

export default Mint;

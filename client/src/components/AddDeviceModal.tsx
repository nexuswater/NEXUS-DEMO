import { Device } from "@/hooks/useDevices";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  newDevice: Device;
  setNewDevice: (d: Device) => void;
  onAdd: (d: Device) => Promise<{ error: string; field?: string } | null | undefined>;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ open, onClose, newDevice, setNewDevice, onAdd }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // const { toast } = useToast();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-xl p-6 w-full max-w-md border border-white/10 relative">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="font-bold text-lg mb-4">Add New Device</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="deviceName">Device Name</Label>
            <Input id="deviceName" value={newDevice.name} onChange={e => { setNewDevice({ ...newDevice, name: e.target.value }); setErrors({ ...errors, name: '' }); }} className="bg-black/20 border-white/10 mt-1" placeholder="e.g. AWG-Honolulu-01" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="deviceDesc">Description</Label>
            <Input id="deviceDesc" value={newDevice.description} onChange={e => setNewDevice({ ...newDevice, description: e.target.value })} className="bg-black/20 border-white/10 mt-1" placeholder="Short description" />
          </div>
          <div>
            <Label htmlFor="deviceRegion">Region</Label>
            <Input id="deviceRegion" value={newDevice.region} onChange={e => setNewDevice({ ...newDevice, region: e.target.value })} className="bg-black/20 border-white/10 mt-1" placeholder="e.g. Honolulu, HI" />
          </div>
          <div>
            <Label htmlFor="deviceTech">Technology</Label>
            <Input id="deviceTech" value={newDevice.tech} onChange={e => setNewDevice({ ...newDevice, tech: e.target.value })} className="bg-black/20 border-white/10 mt-1" placeholder="e.g. AWG, Solar, etc." />
          </div>
          <div>
            <Label htmlFor="oracleIndex">Oracle Index</Label>
            <Input id="oracleIndex" value={newDevice.oracleIndex} onChange={e => { setNewDevice({ ...newDevice, oracleIndex: e.target.value }); setErrors({ ...errors, oracleIndex: '' }); }} className="bg-black/20 border-white/10 mt-1" placeholder="e.g. 0xabc123..." />
            {errors.oracleIndex && <p className="text-red-500 text-sm mt-1">{errors.oracleIndex}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-primary text-background hover:bg-primary/90"
            onClick={async () => {
              const error = await onAdd(newDevice);
              if (error && error.field) {
                setErrors({ [error.field]: error.error });
                return;
              }
              setErrors({});
              onClose();
            }}
            disabled={!newDevice.name || !newDevice.description || !newDevice.region || !newDevice.tech || !newDevice.oracleIndex}
          >
            Add Device
          </Button>
        </div>
      </div>
    </div>
  );
};

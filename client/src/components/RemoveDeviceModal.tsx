import { Device } from "@/hooks/useDevices";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";

interface RemoveDeviceModalProps {
  open: boolean;
  onClose: () => void;
  devices: Device[];
  onRemove: (deviceName: string) => Promise<void>;
}

export const RemoveDeviceModal: React.FC<RemoveDeviceModalProps> = ({ open, onClose, devices, onRemove }) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmRemove = async () => {
    if (selectedDevice) {
      setLoading(true);
      await onRemove(selectedDevice);
      setLoading(false);
      setShowConfirmModal(false);
      onClose();
    }
  };

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
        <h3 className="font-bold text-lg mb-4">Remove Device</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="deviceSelect">Select Device</Label>
            <Select onValueChange={(value) => setSelectedDevice(value)}>
              <SelectTrigger className="bg-black/20 border-white/10 mt-1">
                <SelectValue placeholder="Choose a device to remove" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.name} value={device.name}>
                    {device.name} ({device.tech})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-red-500 text-background hover:bg-red-600"
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedDevice || loading}
          >
            {loading ? "Removing..." : "Remove Device"}
          </Button>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card rounded-xl p-6 w-full max-w-sm border border-white/10 relative">
            <h3 className="font-bold text-lg mb-4">Confirm Removal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to remove the device "{selectedDevice}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button
                className="bg-red-500 text-background hover:bg-red-600"
                onClick={handleConfirmRemove}
                disabled={loading}
              >
                {loading ? "Removing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
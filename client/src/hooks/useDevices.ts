import { useState, useEffect } from "react";

export interface Device {
  name: string;
  description: string;
  region: string;
  tech: string;
  oracleIndex: string;
  account: string;
}

export function useDevices(account?: string) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showRemoveDevice, setShowRemoveDevice] = useState(false); // State for remove modal
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null); // State for selected device
  const [newDevice, setNewDevice] = useState<Device>({ name: "", description: "", region: "", tech: "", oracleIndex: "", account: account || "" });
  const [loading, setLoading] = useState(false);

  // Fetch devices for the account
  useEffect(() => {
    if (!account) return;
    setLoading(true);
    fetch(`/api/devices/${account}`)
      .then(res => res.json())
      .then(data => setDevices(data.devices || []))
      .finally(() => setLoading(false));
  }, [account]);

  // Add device to backend
  const addDevice = async (device: Device) => {
    setLoading(true);
    let error: null | { error: string; field?: string } = null;
    const res = await fetch('/api/device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device),
    });
    if (res.ok) {
      // Refetch devices after successful add
      const updated = await fetch(`/api/devices/${device.account}`)
        .then(r => r.json())
        .then(data => data.devices || []);
      setDevices(updated);
      setShowAddDevice(false); // Only close and reset on success
      setNewDevice({ name: "", description: "", region: "", tech: "", oracleIndex: "", account: device.account });
      setLoading(false);
      return null;
    } else {
      error = await res.json();
      setLoading(false);
      // Do NOT close or reset modal on error
      return error;
    }
  };

  // Remove device from backend
  const removeDevice = async (deviceName: string) => {
    setLoading(true);
    const res = await fetch(`/api/device/${account}/${deviceName}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      // Refetch devices after successful removal
      const updated = await fetch(`/api/devices/${account}`)
        .then(r => r.json())
        .then(data => data.devices || []);
      setDevices(updated);
      setShowRemoveDevice(false); // Close modal on success
      setSelectedDevice(null); // Reset selected device
    }
    setLoading(false);
  };

  return {
    devices,
    showAddDevice,
    setShowAddDevice,
    showRemoveDevice,
    setShowRemoveDevice,
    selectedDevice,
    setSelectedDevice,
    newDevice,
    setNewDevice,
    addDevice,
    removeDevice,
    loading,
  };
}

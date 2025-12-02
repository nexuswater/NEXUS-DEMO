import { useState, useEffect } from "react";

export interface ExplorerDevice {
  name: string;
  description: string;
  region: string;
  tech: string;
  oracleIndex: string;
  account: string;
  creationDate?: string; // ISO string or formatted date
  tov?: number | null;
  class?: string | null;
}

export function useExplorerDevices() {
  const [devices, setDevices] = useState<ExplorerDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/devices")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch devices");
        return res.json();
      })
      .then(async data => {
        const devicesRaw = data.devices || [];
        // Fetch TOV and class for each device in parallel
        const devicesWithOracle = await Promise.all(devicesRaw.map(async (d: any) => {
          let tov = null;
          let oracleClass = null;
          try {
            // Fetch TOV and assetClass together
            const tovRes = await fetch(`/api/oracle-data/tov?oracleIndex=${d.oracleIndex}`);
            if (tovRes.ok) {
              const tovData = await tovRes.json();
              tov = tovData.tov ?? null;
              oracleClass = tovData.assetClass || null;
            } else {
              // If TOV fetch fails, mark as pending
              return {
                ...d,
                creationDate: d.creationDate || d.createdAt || undefined,
                tov: null,
                class: null
              };
            }
          } catch (e) {
            // On any error, mark as pending
            return {
              ...d,
              creationDate: d.creationDate || d.createdAt || undefined,
              tov: null,
              class: null
            };
          }
          return {
            ...d,
            creationDate: d.creationDate || d.createdAt || undefined,
            tov,
            class: oracleClass
          };
        }));
        setDevices(devicesWithOracle);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { devices, loading, error };
}

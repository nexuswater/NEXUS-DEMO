import { useEffect, useState, useCallback } from "react";
import * as xrpl from "xrpl";

const NXS_ISSUER = "rUu9EGTQe6TLpvdunWqFs1aLyB9HGmgE4d";
const NXS_CURRENCY = "NXS";
const WTR_MPT_ISSUANCE_ID = "00163FF81198BB2A440E6260282AE0BFC90AA4F7D551D1AB";
const ENG_MPT_ISSUANCE_ID = "00163FFD5819C1450392DBE19E29497A911DB71F45B0D10A";

export function useAccountBalances(address: string | null, isConnected: boolean) {
  const [xrpBalance, setXrpBalance] = useState<string | null>(null);
  const [xrpReserved, setXrpReserved] = useState<string | null>(null);
  const [nxsBalance, setNxsBalance] = useState<string | null>(null);
  const [wtrBalance, setWtrBalance] = useState<string | null>(null);
  const [engBalance, setEngBalance] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address) return;
    // Prevent fetching more than once every 5 seconds to reduce flicker
    if (lastFetched && Date.now() - lastFetched < 5000) return;
    setFetching(true);
    setError(null);
    try {
      const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
      await client.connect();
      // XRP
      const info = await client.request({
        command: "account_info",
        account: address,
        ledger_index: "validated"
      });
      const xrp = info.result.account_data.Balance;
      const reserve = info.result.account_data.OwnerCount
        ? xrpl.xrpToDrops(2 + info.result.account_data.OwnerCount * 2)
        : xrpl.xrpToDrops(2);
      setXrpBalance(String(xrpl.dropsToXrp(xrp)));
      setXrpReserved(String(xrpl.dropsToXrp(reserve)));
      // NXS
      const lines = await client.request({
        command: "account_lines",
        account: address
      });
      const nxsLine = lines.result.lines.find(
        (line: any) => line.currency === NXS_CURRENCY && line.account === NXS_ISSUER
      );
      setNxsBalance(nxsLine ? nxsLine.balance : "0");
      // MPTs
      let wtr = null;
      let eng = null;
      let mptObjects: any[] = [];
      try {
        const mptRes = await client.request({
          command: "account_objects",
          account: address,
          type: "mptoken"
        });
        if (Array.isArray(mptRes.result.account_objects)) {
          mptObjects = mptRes.result.account_objects;
          for (const obj of mptRes.result.account_objects) {
            const anyObj = obj as any;
            const issuanceId = anyObj["MPTokenIssuanceID"] || anyObj["mpt_issuance_id"];
            const mptAmount = anyObj["MPTAmount"] || anyObj["mpt_amount"];
            if (issuanceId === WTR_MPT_ISSUANCE_ID) wtr = String(mptAmount);
            if (issuanceId === ENG_MPT_ISSUANCE_ID) eng = String(mptAmount);
          }
        }
      } catch (e) {}
      setWtrBalance(wtr);
      setEngBalance(eng);
      await client.disconnect();
      setLastFetched(Date.now());
      // Send to backend for DB upsert
      try {
        const payload = {
          wallet_address: address,
          xrp_balance: String(xrpl.dropsToXrp(xrp)),
          nxs_balance: nxsLine ? String(nxsLine.balance) : "0",
          wtr_balance: wtr || "0",
          eng_balance: eng || "0"
        };
        await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
    } catch (e) {
      setError("Failed to fetch balances");
      setXrpBalance(null);
      setXrpReserved(null);
      setNxsBalance(null);
      setWtrBalance(null);
      setEngBalance(null);
    } finally {
      setFetching(false);
    }
  }, [address, isConnected, lastFetched]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    xrpBalance,
    xrpReserved,
    nxsBalance,
    wtrBalance,
    engBalance,
    fetching,
    error,
    refetch: fetchBalances
  };
}
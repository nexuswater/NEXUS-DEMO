import React, { useEffect, useState } from "react";
import * as xrpl from "xrpl";

// Constants for tokens
const NXS_ISSUER = "rUu9EGTQe6TLpvdunWqFs1aLyB9HGmgE4d";
const NXS_CURRENCY = "NXS";
const WTR_ISSUER = "rpcsTUtQKNrMCN4xaoFQhsbNYr6DdnLnzU";
const WTR_CURRENCY = "00163FF81198BB2A440E6260282AE0BFC90AA4F7D551D1AB";
const ENG_ISSUER = "r9pqK4HCS6tuWbEWZZosxdC6wyEzCvqjoF";
const ENG_CURRENCY = "00163FFD5819C1450392DBE19E29497A911DB71F45B0D10A";

type AccountBalancesProps = {
  address: string;
};

export default function AccountBalances({ address }: AccountBalancesProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [xrp, setXrp] = useState<string | null>(null);
  const [nxs, setNxs] = useState<string | null>(null);
  const [wtr, setWtr] = useState<string | null>(null);
  const [eng, setEng] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
        await client.connect();
        // XRP
        const info = await client.request({
          command: "account_info",
          account: address,
          ledger_index: "validated"
        });
        setXrp(String(xrpl.dropsToXrp(info.result.account_data.Balance)));
        // NXS (trust line)
        const lines = await client.request({
          command: "account_lines",
          account: address
        });
        const nxsLine = lines.result.lines.find(
          (line) => line.currency === NXS_CURRENCY && line.account === NXS_ISSUER
        );
        setNxs(nxsLine ? String(nxsLine.balance) : null);
        // MPTs (account_objects)
  let wtrBal = null, engBal = null;
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
              if (issuanceId === `${WTR_CURRENCY}${WTR_ISSUER}`) wtrBal = String(mptAmount);
              if (issuanceId === `${ENG_CURRENCY}${ENG_ISSUER}`) engBal = String(mptAmount);
            }
          }
        } catch (e) {}
        setWtr(wtrBal);
        setEng(engBal);
        await client.disconnect();

        // Send to backend for DB upsert
        try {
          console.log('[AccountBalances] Sending to backend:', {
            wallet_address: address,
            account_info: info.result.account_data,
            account_lines: lines.result.lines,
            mpt_objects: mptObjects
          });
          const resp = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet_address: address,
              account_info: info.result.account_data,
              account_lines: lines.result.lines,
              mpt_objects: mptObjects
            })
          });
          console.log('[AccountBalances] Backend response:', resp.status, await resp.text());
        } catch (e) {
          console.error('[AccountBalances] Failed to send to backend:', e);
        }
      } catch (e) {
        setError("Failed to fetch balances");
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  if (!address) return <div>No address provided.</div>;
  if (loading) return <div>Loading balances...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-2 text-sm">
      <div><strong>XRP:</strong> {xrp ?? "-"}</div>
      <div><strong>NXS:</strong> {nxs ?? "-"}</div>
      <div><strong>WTR (MPT):</strong> {wtr ?? "-"}</div>
      <div><strong>ENG (MPT):</strong> {eng ?? "-"}</div>
    </div>
  );
}

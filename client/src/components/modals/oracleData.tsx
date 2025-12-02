import React, { useState, useEffect } from "react";
import { useManageOracleData } from "../../hooks/manageOracleData";
// Modal to display Oracle Data as a table
const OracleDataModal = ({ open, onClose, oracleIndex }: { open: boolean; onClose: () => void; oracleIndex: string | null }) => {
  const { isFetching, error, fetchOracleTOV } = useManageOracleData();
  const [oracleData, setOracleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && oracleIndex) {
      setLoading(true);
      fetch(`/api/oracle-data/read?oracleIndex=${oracleIndex}`)
        .then(res => res.json())
        .then(res => {
            if (res.success && res.data) {
              setOracleData(res.data);
            } else {
              setOracleData(null);
            }
        })
        .catch(() => setOracleData(null))
        .finally(() => setLoading(false));
    }
  }, [open, oracleIndex]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-6 rounded-xl shadow-xl max-w-2xl w-full border border-white/10 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-lg text-muted-foreground hover:text-primary"
        >
          ×
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">Oracle Data</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : Array.isArray(oracleData) && oracleData.length > 0 ? (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full text-xs border border-white/10 rounded">
              <thead>
                <tr className="bg-black/20">
                  {["timestamp", "ledger_index", "hash", "PRV", "TOV"].map((key) => {
                    let label = key;
                    if (key === "PRV") label = "Produced (L)";
                    if (key === "TOV") label = "Total (L)";
                    return (
                      <th key={key} className="px-4 py-3 text-left font-bold text-primary border-b border-white/10 whitespace-nowrap">{label}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {oracleData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-black/10 transition-colors">
                    {["timestamp", "ledger_index", "hash", "PRV", "TOV"].map((key, i) => {
                      let val = row[key];
                      let display: React.ReactNode = '';
                      let tooltip: string | undefined = undefined;
                      if (val === null || val === undefined) {
                        display = '—';
                      } else if (key === 'timestamp' && typeof val === 'number') {
                        const d = new Date(val * 1000);
                        // Format: MM/DD HH:mm:ss (no year)
                        display = d.toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                        tooltip = val.toString();
                      } else if (key === 'hash' && typeof val === 'string') {
                        if (val.length > 8) {
                          tooltip = val;
                          const shortHash = val.slice(0, 6) + '...' + val.slice(-4);
                          display = (
                            <a
                              href={`https://devnet.xrplwin.com/tx/${val}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-primary hover:text-primary/80"
                              title={val}
                            >
                              {shortHash}
                            </a>
                          );
                        } else {
                          display = val;
                        }
                      } else if (typeof val === 'string' || typeof val === 'number') {
                        display = val;
                      } else {
                        display = JSON.stringify(val);
                      }
                      return (
                        <td
                          key={i}
                          className="px-4 py-3 border-b border-white/10 font-mono break-all whitespace-nowrap text-xs max-w-[120px] overflow-hidden text-ellipsis"
                          title={tooltip}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground">No oracle data found.</div>
        )}
        <div className="flex justify-between mt-6">
          <div className="flex items-center gap-3">
            {Array.isArray(oracleData) && oracleData.length > 0 && (
              <>
                <button
                  onClick={() => {
                    const keys = ["timestamp", "ledger_index", "hash", "PRV", "TOV"];
                    const header = keys.map((key) => {
                      if (key === "PRV") return "Produced (L)";
                      if (key === "TOV") return "Total (L)";
                      return key;
                    }).join("\t");
                    const rows = oracleData.map((row: any) =>
                      keys.map((key) => {
                        if (key === "timestamp" && typeof row[key] === "number") {
                          const d = new Date(row[key] * 1000);
                          return d.toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                        }
                        return row[key] ?? "";
                      }).join("\t")
                    );
                    const text = [header, ...rows].join("\n");
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `oracle-data-${oracleIndex || ''}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }, 100);
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors mr-2"
                >
                  Download
                </button>
                {oracleIndex && (
                  <a
                    href={`https://devnet.xrplwin.com/entry/${oracleIndex}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors mr-2"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    View Ledger Entry
                  </a>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default OracleDataModal;
export { default as OracleDataLoadingModal } from "./oracleDataLoading";
export { default as OracleDataSuccessModal } from "./oracleDataSuccess";
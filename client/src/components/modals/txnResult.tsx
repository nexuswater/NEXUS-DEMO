import { CheckCircle2, Copy } from "lucide-react";

const TxResultModal = ({ open, onClose, txResult }: { open: boolean; onClose: () => void; txResult: any }) => {
  if (!open || !txResult) return null;

  const handleCopy = () => {
    if (txResult.hash) {
      navigator.clipboard.writeText(txResult.hash);
    }
  };

  const xrplWinUrl = `https://devnet.xrplwin.com/tx/${txResult.hash}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gradient-to-br from-[#1a2e23] to-[#10181a] p-0 rounded-2xl shadow-2xl max-w-xl w-full border border-emerald-700/40 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-muted-foreground hover:text-primary/80 focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center gap-3 px-7 pt-7 pb-2">
          <CheckCircle2 className="w-7 h-7 text-emerald-400 drop-shadow" />
          <h2 className="text-2xl font-bold text-emerald-300 tracking-tight">Mint Transaction Successful</h2>
        </div>
        <div className="px-7 pb-2 pt-1 text-sm space-y-3 max-h-96 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-muted-foreground">Transaction Hash</span>
            <span className="font-mono text-xs break-all text-emerald-200 bg-black/30 px-2 py-1 rounded">{txResult.hash}</span>
          </div>
          {/* ...other fields as before... */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-muted-foreground">Ledger Index</span>
            <span className="font-mono text-xs text-primary bg-black/20 px-2 py-1 rounded">{txResult.ledger_index}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-muted-foreground">Close Time</span>
            <span className="font-mono text-xs text-primary bg-black/20 px-2 py-1 rounded">{txResult.close_time_iso}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-muted-foreground">Result</span>
            <span className="font-mono text-xs text-emerald-400 bg-black/20 px-2 py-1 rounded">{txResult.meta?.TransactionResult}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-muted-foreground">Delivered Amount</span>
            <span className="font-mono text-xs text-emerald-300 bg-black/20 px-2 py-1 rounded">
              {txResult.meta?.delivered_amount?.value} <span className="text-muted-foreground">(MPT ID: {txResult.meta?.delivered_amount?.mpt_issuance_id})</span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-muted-foreground">CTID</span>
            <span className="font-mono text-xs text-primary bg-black/20 px-2 py-1 rounded">{txResult.ctid}</span>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-emerald-400 font-semibold">Full JSON</summary>
            <pre className="bg-black/90 text-xs p-3 rounded mt-2 max-h-48 overflow-y-auto border border-emerald-900/30 text-emerald-200">
              {JSON.stringify(txResult, null, 2)}
            </pre>
          </details>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end px-7 pb-7 pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-zinc-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-zinc-600 transition"
            title="Copy Transaction Hash"
          >
            <Copy className="w-4 h-4" /> Copy Hash
          </button>
          <a
            href={xrplWinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition"
            title="View on XRPLWin"
          >
            <img src="/xrplWin.jpg" alt="XRPLWin" className="w-6 h-6 rounded" />
            XRPLWin
          </a>
          <button
            onClick={onClose}
            className="bg-emerald-500 text-background px-6 py-2 rounded-lg font-semibold shadow hover:bg-emerald-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default TxResultModal;
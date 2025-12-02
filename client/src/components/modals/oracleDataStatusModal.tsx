import React, { useEffect, useRef, useState } from "react";

interface OracleDataStatusModalProps {
  open: boolean;
  loading?: boolean;
  success?: boolean;
  message?: string;
  entryCount?: number;
  oracleIndex?: string;
  onClose?: () => void;
}

const OracleDataStatusModal: React.FC<OracleDataStatusModalProps> = ({
  open,
  loading = false,
  success = false,
  message,
  entryCount,
  oracleIndex,
  onClose,
}) => {
  // Animation state for entry/exit
  const [show, setShow] = useState(open);
  const [animState, setAnimState] = useState(open ? "open" : "closed");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setShow(true);
      setTimeout(() => setAnimState("open"), 10); // allow DOM mount before anim
    } else if (show) {
      setAnimState("closed");
      timeoutRef.current = setTimeout(() => setShow(false), 200); // match duration-200
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={[
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          animState === "open" ? "data-[state=open]" : "data-[state=closed]"
        ].join(" ")}
        style={{ pointerEvents: "auto" }}
      />
      {/* Modal content */}
      <div
        className={[
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-card rounded-xl p-8 w-full max-w-sm border border-white/10 shadow-xl flex flex-col items-center",
          "duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          animState === "open" ? "data-[state=open]" : "data-[state=closed]"
        ].join(" ")}
        style={{ transition: "opacity 200ms, transform 200ms" }}
      >
        {loading && (
          <>
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-lg font-bold text-primary mb-2">Loading</div>
            <div className="text-muted-foreground text-sm text-center">{message || "Fetching oracle data..."}</div>
          </>
        )}
        {success && !loading && (
          <>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-lg font-bold text-green-400 mb-2">Success</div>
            <div className="text-muted-foreground text-sm text-center mb-4">
              Retrieved and stored <span className="text-primary font-bold">{entryCount}</span> entries.<br />From oracle index
              {oracleIndex && (
                <a
                  href={`https://devnet.xrplwin.com/entry/${oracleIndex}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 px-1 rounded bg-black/20 hover:bg-primary/10 text-primary font-mono font-bold underline text-xs transition-colors"
                  title={oracleIndex}
                >
                  {oracleIndex.length > 16 ? `${oracleIndex.slice(0, 6)}...${oracleIndex.slice(-4)}` : oracleIndex}
                </a>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OracleDataStatusModal;

import React from "react";

interface OracleDataSuccessModalProps {
  open: boolean;
  onClose: () => void;
  entryCount: number;
  oracleIndex: string;
}

const OracleDataSuccessModal: React.FC<OracleDataSuccessModalProps> = ({ open, onClose, entryCount, oracleIndex }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-8 rounded-xl shadow-xl max-w-sm w-full border border-white/10 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="text-lg font-bold text-green-400 mb-2">Success</div>
        <div className="text-muted-foreground text-sm text-center mb-4">
          Retrieved and stored <span className="text-primary font-bold">{entryCount}</span> entries. <br /> From oracle index
          <a
            href={`https://devnet.xrplwin.com/entry/${oracleIndex}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-1 rounded bg-black/20 hover:bg-primary/10 text-primary font-mono font-bold underline text-xs transition-colors"
            title={oracleIndex}
          >
            {oracleIndex.length > 16 ? `${oracleIndex.slice(0, 6)}...${oracleIndex.slice(-4)}` : oracleIndex}
          </a>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OracleDataSuccessModal;

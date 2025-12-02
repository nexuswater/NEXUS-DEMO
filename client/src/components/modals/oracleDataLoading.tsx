import React from "react";

interface OracleDataLoadingModalProps {
  open: boolean;
  message?: string;
}

const OracleDataLoadingModal: React.FC<OracleDataLoadingModalProps> = ({ open, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-8 rounded-xl shadow-xl max-w-sm w-full border border-white/10 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-lg font-bold text-primary mb-2">Loading</div>
        <div className="text-muted-foreground text-sm text-center">{message || "Fetching oracle data..."}</div>
      </div>
    </div>
  );
};

export default OracleDataLoadingModal;

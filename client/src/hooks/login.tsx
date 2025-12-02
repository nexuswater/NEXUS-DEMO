import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useState } from "react";

interface LoginOverlayProps {
  open: boolean;
  onConnect: (seed: string) => Promise<void>;
  connecting: boolean;
  xrplError: string | null;
  setShowSeedDialog: (open: boolean) => void;
}

export default function LoginOverlay({ open, onConnect, connecting, xrplError, setShowSeedDialog }: LoginOverlayProps) {
  const { toast } = useToast();
  const [seed, setSeed] = useState("");

  return (
    <Dialog open={open} onOpenChange={setShowSeedDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to XRPL Devnet</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async e => {
            e.preventDefault();
            await onConnect(seed);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="xrpl-seed">Enter your XRPL Seed or Family Seed</Label>
            <Input
              id="xrpl-seed"
              type="password"
              autoComplete="off"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              placeholder="s████████████ or family seed"
              required
            />
            {xrplError && <div className="text-red-500 text-xs mt-1">{xrplError}</div>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={connecting || !seed} className="w-full">
              {connecting ? "Connecting..." : (
                <><Wallet className="w-4 h-4 mr-2" />Connect</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TokenOfferModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	asset?: any;
}

const TokenOfferModal: React.FC<TokenOfferModalProps> = ({ open, onOpenChange, asset }) => {
	const [amount, setAmount] = useState("");
	const [recipient, setRecipient] = useState("");
	const [finishAfter, setFinishAfter] = useState(300); // seconds
	const [cancelAfter, setCancelAfter] = useState(3600); // seconds
	const [condition, setCondition] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = () => {
		setIsSubmitting(true);
		// TODO: Call backend API to create escrow offer
		setTimeout(() => {
			setIsSubmitting(false);
			onOpenChange(false);
		}, 1200);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Create Token Escrow Offer</DialogTitle>
					<DialogDescription>
						List your asset for secure exchange. All offers use token escrow for atomic, trustless settlement.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<div>
						<Label>Asset</Label>
						<Input value={asset?.name || ""} disabled placeholder="Asset name" className="bg-black/20 border-white/10" />
					</div>
					<div>
						<Label>Amount</Label>
						<Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="bg-black/20 border-white/10" />
					</div>
					<div>
						<Label>Recipient Address (XRPL)</Label>
						<Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="r..." className="bg-black/20 border-white/10" />
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<Label>Finish After (sec)</Label>
							<Input type="number" value={finishAfter} onChange={e => setFinishAfter(Number(e.target.value))} min={0} className="bg-black/20 border-white/10" />
						</div>
						<div>
							<Label>Cancel After (sec)</Label>
							<Input type="number" value={cancelAfter} onChange={e => setCancelAfter(Number(e.target.value))} min={0} className="bg-black/20 border-white/10" />
						</div>
					</div>
					<div>
						<Label>Condition (optional)</Label>
						<Input value={condition} onChange={e => setCondition(e.target.value)} placeholder="Crypto-condition (hex)" className="bg-black/20 border-white/10" />
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleSubmit} disabled={isSubmitting || !amount || !recipient} className="w-full bg-primary text-background">
						{isSubmitting ? "Creating..." : "Create Offer"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default TokenOfferModal;

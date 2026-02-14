"use client";

import { Button } from "@/components/ui/button";
import { CreditPurchaseModal } from "@/components/credit-purchase-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DealerCreditSection({ initialCredits, userId }: { initialCredits: number; userId: string }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Dealer Credits</h3>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Available Credits</span>
                <span className="font-bold text-lg">{initialCredits}</span>
            </div>
            <Button onClick={() => setOpen(true)} className="w-full">
                Buy Credits
            </Button>
            <CreditPurchaseModal
                isOpen={open}
                onClose={() => setOpen(false)}
                userId={userId}
                onSuccess={() => {
                    setOpen(false);
                    router.refresh(); // Refresh to update credits
                }}
            />
        </div>
    );
}

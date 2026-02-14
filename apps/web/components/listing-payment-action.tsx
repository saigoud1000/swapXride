"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payment-modal";
import { useRouter } from "next/navigation";

interface Props {
    listingId: string;
    status: string;
    isOwner: boolean;
    isPaid?: boolean;
}

export function ListingPaymentAction({ listingId, status, isOwner, isPaid }: Props) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const router = useRouter();

    // Show if owner and NOT verified (isPaid is false)
    if (!isOwner || isPaid) {
        return null;
    }

    return (
        <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <p className="text-blue-800 font-semibold">Get Verified!</p>
                <p className="text-blue-600 text-sm">Upgrade to a Verified listing for better visibility and trust.</p>
            </div>
            <Button onClick={() => setIsPaymentOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Verify for $5.00
            </Button>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                listingId={listingId}
                onSuccess={() => {
                    setIsPaymentOpen(false);
                    router.refresh();
                }}
            />
        </div>
    );
}

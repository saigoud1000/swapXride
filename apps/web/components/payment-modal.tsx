"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Initialize Stripe outside of component to avoid recreating it
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ listingId, onSuccess, onSkip }: { listingId: string; onSuccess: () => void; onSkip?: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { paymentIntent, error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/listings/${listingId}`,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment successful!
            // Call backend to verify
            try {
                const supabase = (await import('@/lib/supabase/client')).createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/listings/${listingId}/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ paymentIntentId: paymentIntent.id })
                    });
                }

                onSuccess();
            } catch (err) {
                console.error(err);
                setMessage("Payment successful but verification failed. Contact support.");
            }
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* @ts-ignore */}
            <PaymentElement id="payment-element" />
            {message && <div className="text-red-500 text-sm">{message}</div>}
            <Button disabled={isLoading || !stripe} id="submit" className="w-full">
                <span id="button-text">
                    {isLoading ? "Processing..." : "Pay $5.00 & Verify"}
                </span>
            </Button>
            <Button variant="ghost" type="button" onClick={onSkip} className="w-full">
                Maybe Later
            </Button>
        </form>
    );
}

export function PaymentModal({
    isOpen,
    onClose,
    listingId,
    onSuccess,
    onSkip,
}: {
    isOpen: boolean;
    onClose: () => void;
    listingId: string | null;
    onSuccess: () => void;
    onSkip?: () => void;
}) {
    const [clientSecret, setClientSecret] = useState("");

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        } else {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen && listingId) {
            // Create PaymentIntent as soon as the modal opens
            const createPaymentIntent = async () => {
                try {
                    const supabase = (await import('@/lib/supabase/client')).createClient();
                    const { data: { session } } = await supabase.auth.getSession();

                    if (!session) {
                        console.error('No session found');
                        return;
                    }

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/payments/create-payment-intent`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ amount: 500, currency: "usd" }), // $5.00 for Verification
                    });

                    if (!res.ok) {
                        console.error('Failed to create payment intent');
                        return;
                    }

                    const data = await res.json();
                    setClientSecret(data.clientSecret);
                } catch (error) {
                    console.error('Error creating payment intent:', error);
                }
            };

            createPaymentIntent();
        }
    }, [isOpen, listingId]);

    const appearance = {
        theme: 'stripe' as const,
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Get Verified</DialogTitle>
                    <DialogDescription>
                        Upgrade your listing to <strong>Verified</strong> for $5.00.
                        <ul className="list-disc list-inside mt-2 text-sm">
                            <li>Verified Blue Badge</li>
                            <li>Top Placement in Search Results</li>
                            <li>Increased Trust from Buyers</li>
                        </ul>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {clientSecret && (
                        // @ts-ignore
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm listingId={listingId || ""} onSuccess={onSuccess} onSkip={handleSkip} />
                        </Elements>
                    )}
                    {!clientSecret && <div>Loading payment details...</div>}
                </div>
            </DialogContent>
        </Dialog>
    );
}

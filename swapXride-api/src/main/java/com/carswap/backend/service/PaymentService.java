package com.carswap.backend.service;

import com.carswap.backend.model.User;
import com.carswap.backend.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.UUID;
import java.util.Optional;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    private final UserRepository userRepository;

    public PaymentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        System.out.println("=== PaymentService Init ===");
        // Log a masked version for debugging
        System.out.println("Stripe API Key from @Value (first 10 chars): " 
            + (stripeApiKey != null && stripeApiKey.length() > 10 ? stripeApiKey.substring(0, 10) + "..." : "NULL/SHORT"));

        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
             System.err.println("CRITICAL: Stripe API key is missing!");
        }

        Stripe.apiKey = stripeApiKey;
    }

    public PaymentIntent createPaymentIntent(Long amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .build();

        return PaymentIntent.create(params);
    }

    @Transactional
    public boolean deductCredit(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getListingCredits() > 0) {
                user.setListingCredits(user.getListingCredits() - 1);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void addCredits(UUID userId, int credits) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setListingCredits(user.getListingCredits() + credits);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found: " + userId);
        }
    }

    public int getCredits(String email) {
        return userRepository.findByEmail(email).map(User::getListingCredits).orElse(0);
    }

    public boolean verifyPayment(String paymentIntentId) {
        // Allow mock payment for testing/demo
        if ("mock_mobile_payment_intent".equals(paymentIntentId)) {
            System.out.println("Mock payment verification successful.");
            return true;
        }

        try {
            if (paymentIntentId == null)
                return false;
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            return "succeeded".equals(intent.getStatus());
        } catch (StripeException e) {
            System.err.println("Error verifying payment: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}

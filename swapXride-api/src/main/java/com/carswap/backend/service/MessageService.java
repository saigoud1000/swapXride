package com.carswap.backend.service;

import com.carswap.backend.model.Message;
import com.carswap.backend.model.User;
import com.carswap.backend.repository.MessageRepository;
import com.carswap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final com.carswap.backend.repository.ListingDbRepository listingRepository;

    public Message sendMessage(UUID recipientId, String content, UUID listingId) {
        System.out.println("Processing sendMessage. Recipient: " + recipientId + ", Listing: " + listingId);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User sender = userRepository.findByEmail(email).orElseThrow();
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        var messageBuilder = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(content);

        if (listingId != null) {
            System.out.println("Fetching listing: " + listingId);
            var listing = listingRepository.findById(listingId)
                    .orElseThrow(() -> new RuntimeException("Listing not found"));
            messageBuilder.listing(listing);
        }

        Message saved = messageRepository.save(messageBuilder.build());
        System.out.println("Message saved: " + saved.getId());
        return saved;
    }

    public List<Message> getConversation(UUID otherUserId, UUID listingId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        List<Message> messages;
        if (listingId != null) {
            messages = messageRepository.findConversationByListing(currentUser.getId(), otherUserId, listingId);
        } else {
            messages = messageRepository.findConversation(currentUser.getId(), otherUserId);
        }

        // Mark messages as read
        boolean needsUpdate = false;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (Message m : messages) {
            if (m.getRecipient().getId().equals(currentUser.getId()) && m.getReadAt() == null) {
                m.setReadAt(now);
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            messageRepository.saveAll(messages);
        }

        return messages;
    }

    public List<Message> getInbox() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        return messageRepository.findInboxConversations(currentUser.getId());
    }

    public int getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        return messageRepository.countByRecipientIdAndReadAtIsNull(currentUser.getId());
    }
}

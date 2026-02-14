package com.carswap.backend.repository;

import com.carswap.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, java.util.UUID> {

        @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1 AND m.recipient.id = :user2) " +
                        "OR (m.sender.id = :user2 AND m.recipient.id = :user1) ORDER BY m.createdAt ASC")
        List<Message> findConversation(@Param("user1") UUID user1, @Param("user2") UUID user2);

        @Query("SELECT m FROM Message m WHERE m.listing.id = :listingId AND " +
                        "((m.sender.id = :user1 AND m.recipient.id = :user2) " +
                        "OR (m.sender.id = :user2 AND m.recipient.id = :user1)) " +
                        "ORDER BY m.createdAt ASC")
        List<Message> findConversationByListing(@Param("user1") UUID user1, @Param("user2") UUID user2,
                        @Param("listingId") UUID listingId);

        @Query("SELECT m FROM Message m WHERE m.createdAt IN " +
                        "(SELECT MAX(m2.createdAt) FROM Message m2 WHERE m2.sender.id = :userId OR m2.recipient.id = :userId "
                        +
                        "GROUP BY CASE WHEN m2.sender.id = :userId THEN m2.recipient.id ELSE m2.sender.id END) " +
                        "ORDER BY m.createdAt DESC")
        List<Message> findInboxConversations(@Param("userId") UUID userId);

        int countByRecipientIdAndReadAtIsNull(UUID recipientId);
}

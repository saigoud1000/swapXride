package com.carswap.backend.controller;

import com.carswap.backend.dto.MessageRequest;
import com.carswap.backend.model.Message;
import com.carswap.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8082" }, allowCredentials = "true")
public class MessageController {

    private final MessageService service;

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody MessageRequest request) {
        return ResponseEntity
                .ok(service.sendMessage(request.getRecipientId(), request.getContent(), request.getListingId()));
    }

    @GetMapping("/{otherUserId}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable UUID otherUserId,
            @RequestParam(required = false) UUID listingId) {
        return ResponseEntity.ok(service.getConversation(otherUserId, listingId));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<Message>> getInbox() {
        return ResponseEntity.ok(service.getInbox());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount() {
        return ResponseEntity.ok(service.getUnreadCount());
    }
}

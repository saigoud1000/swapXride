package com.carswap.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "listings")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Listing {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @JsonProperty("user_id")
    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }

    @JsonProperty("user_info")
    public Map<String, Object> getUserInfo() {
        if (user == null)
            return null;
        return Map.of(
                "id", user.getId(),
                "display_name", user.getDisplayName() != null ? user.getDisplayName() : "User",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "profile_photo_url", user.getProfilePhotoUrl() != null ? user.getProfilePhotoUrl() : "",
                "account_type", user.getAccountType() != null ? user.getAccountType() : "private");
    }

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos;

    // Vehicle Details
    @JsonProperty("have_year")
    private int haveYear;
    @JsonProperty("have_make")
    private String haveMake;
    @JsonProperty("have_model")
    private String haveModel;
    @JsonProperty("body_type")
    private String bodyType;
    @JsonProperty("have_trim")
    private String haveTrim;
    @JsonProperty("have_mileage")
    private int haveMileage;
    @JsonProperty("location_zip")
    private String locationZip;

    // Swap Details
    @Column(columnDefinition = "TEXT")
    @JsonProperty("want_description")
    private String wantDescription;
    @JsonProperty("cash_differential_min")
    private Integer cashDifferentialMin;
    @JsonProperty("cash_differential_max")
    private Integer cashDifferentialMax;
    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonProperty("condition")
    private String condition;

    @JsonProperty("title_status")
    private String titleStatus;

    @Column(columnDefinition = "TEXT")
    @JsonProperty("modifications")
    private String modifications;

    @JsonProperty("want_make")
    private String wantMake;

    @JsonProperty("want_model")
    private String wantModel;

    @JsonProperty("want_year_min")
    private Integer wantYearMin;

    @JsonProperty("cash_direction")
    private String cashDirection;

    @Enumerated(EnumType.STRING)
    @JsonProperty("status")
    private ListingStatus status;

    @Column(name = "stripe_payment_intent_id")
    @JsonProperty("stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "is_paid")
    @JsonProperty("is_paid")
    @Builder.Default
    private Boolean isPaid = false;

    @JsonProperty("view_count")
    private int viewCount;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now(ZoneOffset.UTC);
        if (status == null)
            status = ListingStatus.active;
    }
}

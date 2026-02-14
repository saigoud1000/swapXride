package com.carswap.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.ToString;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@ToString
@lombok.Data
public class ListingRequest {
    @com.fasterxml.jackson.annotation.JsonProperty("have_year")
    public int haveYear;
    @com.fasterxml.jackson.annotation.JsonProperty("have_make")
    public String haveMake;
    @com.fasterxml.jackson.annotation.JsonProperty("have_model")
    public String haveModel;
    @com.fasterxml.jackson.annotation.JsonProperty("body_type")
    public String bodyType;
    @com.fasterxml.jackson.annotation.JsonProperty("have_trim")
    public String haveTrim;
    @com.fasterxml.jackson.annotation.JsonProperty("have_mileage")
    public int haveMileage;
    @com.fasterxml.jackson.annotation.JsonProperty("location_zip")
    public String locationZip;
    @com.fasterxml.jackson.annotation.JsonProperty("want_description")
    public String wantDescription;
    @com.fasterxml.jackson.annotation.JsonProperty("cash_differential_min")
    public Integer cashDifferentialMin;
    @com.fasterxml.jackson.annotation.JsonProperty("cash_differential_max")
    public Integer cashDifferentialMax;
    @com.fasterxml.jackson.annotation.JsonProperty("description")
    public String description;

    @com.fasterxml.jackson.annotation.JsonProperty("condition")
    public String condition;
    @com.fasterxml.jackson.annotation.JsonProperty("title_status")
    public String titleStatus;
    @com.fasterxml.jackson.annotation.JsonProperty("modifications")
    public String modifications;

    @com.fasterxml.jackson.annotation.JsonProperty("want_make")
    public String wantMake;
    @com.fasterxml.jackson.annotation.JsonProperty("want_model")
    public String wantModel;
    @com.fasterxml.jackson.annotation.JsonProperty("want_year_min")
    public Integer wantYearMin;

    @com.fasterxml.jackson.annotation.JsonProperty("cash_direction")
    public String cashDirection;
    @com.fasterxml.jackson.annotation.JsonProperty("photos")
    public List<PhotoRequest> photos;

    @com.fasterxml.jackson.annotation.JsonProperty("payment_intent_id")
    public String paymentIntentId;

    @ToString
    public static class PhotoRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("url")
        public String url;
        @com.fasterxml.jackson.annotation.JsonProperty("display_order")
        public int displayOrder;
    }
}

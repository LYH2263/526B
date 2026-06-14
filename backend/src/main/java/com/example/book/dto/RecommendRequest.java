package com.example.book.dto;

import lombok.Data;

@Data
public class RecommendRequest {
    private String query;
    private Integer limit = 10;
    private String mode;
}

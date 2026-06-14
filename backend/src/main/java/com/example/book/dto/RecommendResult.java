package com.example.book.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RecommendResult {
    private Long bookId;
    private String title;
    private String author;
    private BigDecimal price;
    private String description;
    private String publishDate;
    private Double score;
    private String reason;
    private String matchedConstraints;
    private String searchMode;
}

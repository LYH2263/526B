package com.example.book.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class RecommendResponse {
    private List<RecommendResult> results;
    private ParsedConstraints parsedConstraints;
    private String searchMode;
    private Long totalCount;
    private String processingTime;
    private String message;
}

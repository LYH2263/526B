package com.example.book.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ParsedConstraints {
    private List<String> genres;
    private List<String> audiences;
    private List<String> styles;
    private List<String> keywords;
    private String cleanedQuery;
    private Map<String, String> matchedPatterns;
}

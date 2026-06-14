package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookSemanticIndex {
    private Long id;
    private Long bookId;
    private String contentText;
    private String keywords;
    private String genreTags;
    private String audienceTags;
    private String styleTags;
    private String embeddingVector;
    private String tfidfScores;
    private Integer indexVersion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.example.book.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReadingProgress {
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Integer currentPage;
    private Integer totalPages;
    private BigDecimal progressPercent;
    private LocalDateTime lastReadAt;
    private LocalDateTime createdAt;
}

package com.example.book.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReadingProgressVO {
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Integer currentPage;
    private Integer totalPages;
    private BigDecimal progressPercent;
    private LocalDateTime lastReadAt;
    private String lastReadTimeStr;
}

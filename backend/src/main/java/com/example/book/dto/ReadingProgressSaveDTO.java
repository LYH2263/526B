package com.example.book.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ReadingProgressSaveDTO {
    private Long userId;
    private Long bookId;
    private Integer currentPage;
    private Integer totalPages;
    private BigDecimal progressPercent;
}

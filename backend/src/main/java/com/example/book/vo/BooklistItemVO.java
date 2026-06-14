package com.example.book.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BooklistItemVO {
    private Long id;
    private Long booklistId;
    private Long bookId;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private String title;
    private String author;
    private BigDecimal price;
    private LocalDate publishDate;
    private String description;
}

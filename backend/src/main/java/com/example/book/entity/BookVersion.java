package com.example.book.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookVersion {
    private Long id;
    private Long bookId;
    private Integer versionNumber;
    private String modifierName;
    private String changeType;
    private String title;
    private String author;
    private BigDecimal price;
    private LocalDate publishDate;
    private String description;
    private Integer rollbackFromVersion;
    private LocalDateTime createdAt;
}

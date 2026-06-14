package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BooklistItem {
    private Long id;
    private Long booklistId;
    private Long bookId;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}

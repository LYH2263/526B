package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookStock {
    private Long id;
    private Long bookId;
    private Long branchId;
    private Integer stockQuantity;
    private Integer availableQuantity;
    private Integer inTransitQuantity;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

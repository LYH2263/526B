package com.example.book.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PriceHistory {
    private Long id;
    private Long bookId;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private String modifierName;
    private String changeReason;
    private LocalDateTime createdAt;
}

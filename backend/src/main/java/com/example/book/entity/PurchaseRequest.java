package com.example.book.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PurchaseRequest {
    private Long id;
    private String bookTitle;
    private String bookAuthor;
    private BigDecimal estimatedPrice;
    private Integer quantity;
    private String purchaseReason;
    private String status;
    private String rejectReason;
    private Long applicantId;
    private String applicantName;
    private Long approverId;
    private String approverName;
    private Long stockerId;
    private String stockerName;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime stockedAt;
}

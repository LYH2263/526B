package com.example.book.vo;

import com.example.book.entity.PurchaseRequestLog;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseRequestVO {
    private Long id;
    private String bookTitle;
    private String bookAuthor;
    private BigDecimal estimatedPrice;
    private Integer quantity;
    private String purchaseReason;
    private String status;
    private String statusText;
    private String rejectReason;
    private Long applicantId;
    private String applicantName;
    private Long approverId;
    private String approverName;
    private Long stockerId;
    private String stockerName;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime stockedAt;
    private List<PurchaseRequestLog> logs;
}

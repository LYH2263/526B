package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransferOrder {
    private Long id;
    private String transferNo;
    private Long bookId;
    private String bookTitle;
    private Long sourceBranchId;
    private String sourceBranchName;
    private Long targetBranchId;
    private String targetBranchName;
    private Integer quantity;
    private String status;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private String cancelReason;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime receivedAt;
    private LocalDateTime cancelledAt;
}

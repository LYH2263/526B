package com.example.book.vo;

import com.example.book.entity.TransferOrderLog;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TransferOrderVO {
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
    private String statusText;
    private String operatorName;
    private String remark;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime shippedAt;
    private LocalDateTime receivedAt;
    private LocalDateTime cancelledAt;
    private List<TransferOrderLog> logs;
}

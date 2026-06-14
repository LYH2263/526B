package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PurchaseRequestLog {
    private Long id;
    private Long requestId;
    private String fromStatus;
    private String toStatus;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private LocalDateTime createdAt;
}

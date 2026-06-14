package com.example.book.dto;

import lombok.Data;

@Data
public class PurchaseRequestRejectDTO {
    private Long id;
    private Long approverId;
    private String rejectReason;
}

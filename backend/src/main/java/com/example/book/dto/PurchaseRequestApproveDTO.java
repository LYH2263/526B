package com.example.book.dto;

import lombok.Data;

@Data
public class PurchaseRequestApproveDTO {
    private Long id;
    private Long approverId;
    private String remark;
}

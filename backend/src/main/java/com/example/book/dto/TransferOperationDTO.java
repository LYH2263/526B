package com.example.book.dto;

import lombok.Data;

@Data
public class TransferOperationDTO {
    private Long operatorId;
    private String remark;
    private String cancelReason;
}

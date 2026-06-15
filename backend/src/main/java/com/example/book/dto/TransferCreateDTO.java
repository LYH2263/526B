package com.example.book.dto;

import lombok.Data;

@Data
public class TransferCreateDTO {
    private Long bookId;
    private Long sourceBranchId;
    private Long targetBranchId;
    private Integer quantity;
    private String remark;
    private Long operatorId;
}

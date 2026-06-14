package com.example.book.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PurchaseRequestCreateDTO {
    private String bookTitle;
    private String bookAuthor;
    private BigDecimal estimatedPrice;
    private Integer quantity;
    private String purchaseReason;
    private Long applicantId;
}

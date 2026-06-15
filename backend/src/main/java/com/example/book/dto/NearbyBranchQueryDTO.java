package com.example.book.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class NearbyBranchQueryDTO {
    private Long bookId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer quantity;
}

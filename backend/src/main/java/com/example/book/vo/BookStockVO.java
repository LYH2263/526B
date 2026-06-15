package com.example.book.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookStockVO {
    private Long branchId;
    private String branchName;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String businessHours;
    private Integer stockQuantity;
    private Integer availableQuantity;
    private Integer inTransitQuantity;
    private Double distance;
    private String distanceText;
}

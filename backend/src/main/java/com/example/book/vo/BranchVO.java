package com.example.book.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BranchVO {
    private Long id;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String businessHours;
    private Integer status;
}

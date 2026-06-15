package com.example.book.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Branch {
    private Long id;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String businessHours;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

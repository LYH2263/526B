package com.example.book.vo;

import com.example.book.entity.OrderItem;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderInfoVO {
    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal totalAmount;
    private Integer status;
    private String statusText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItem> items;

    public String getStatusText() {
        if (status == null) return "";
        switch (status) {
            case 1: return "已创建";
            case 2: return "已支付";
            case 3: return "已取消";
            default: return "未知";
        }
    }
}

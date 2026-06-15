package com.example.book.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PriceStatsVO {
    private BigDecimal currentPrice;
    private BigDecimal highestPrice;
    private BigDecimal lowestPrice;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;
}

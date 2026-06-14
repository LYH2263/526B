package com.example.book.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartVO {
    private Long id;
    private Long userId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;

    public BigDecimal getSubtotal() {
        if (price != null && quantity != null) {
            return price.multiply(BigDecimal.valueOf(quantity));
        }
        return subtotal != null ? subtotal : BigDecimal.ZERO;
    }
}

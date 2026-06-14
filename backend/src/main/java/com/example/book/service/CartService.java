package com.example.book.service;

import com.example.book.entity.Cart;
import com.example.book.mapper.CartMapper;
import com.example.book.vo.CartVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    @Autowired
    private CartMapper cartMapper;

    public List<CartVO> findByUserId(Long userId) {
        return cartMapper.findByUserId(userId);
    }

    public Map<String, Object> addToCart(Long userId, Long bookId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            quantity = 1;
        }
        Cart existing = cartMapper.findByUserIdAndBookId(userId, bookId);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            cartMapper.updateQuantity(existing);
        } else {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setBookId(bookId);
            cart.setQuantity(quantity);
            cartMapper.insert(cart);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return result;
    }

    public void updateQuantity(Long userId, Long bookId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            cartMapper.deleteByUserIdAndBookId(userId, bookId);
            return;
        }
        Cart existing = cartMapper.findByUserIdAndBookId(userId, bookId);
        if (existing != null) {
            existing.setQuantity(quantity);
            cartMapper.updateQuantity(existing);
        }
    }

    public void removeItem(Long userId, Long bookId) {
        cartMapper.deleteByUserIdAndBookId(userId, bookId);
    }

    public void clearCart(Long userId) {
        cartMapper.clearByUserId(userId);
    }

    public Map<String, Object> getCartSummary(Long userId) {
        List<CartVO> items = cartMapper.findByUserId(userId);
        BigDecimal total = BigDecimal.ZERO;
        int totalCount = 0;
        for (CartVO item : items) {
            BigDecimal subtotal = item.getSubtotal();
            total = total.add(subtotal);
            totalCount += item.getQuantity();
        }
        Map<String, Object> summary = new HashMap<>();
        summary.put("items", items);
        summary.put("totalAmount", total);
        summary.put("totalCount", totalCount);
        return summary;
    }
}

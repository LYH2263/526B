package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.CartRequest;
import com.example.book.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public Result<Map<String, Object>> getCart(@RequestParam Long userId) {
        return Result.success(cartService.getCartSummary(userId));
    }

    @PostMapping("/add")
    public Result<Map<String, Object>> addToCart(@RequestBody CartRequest request) {
        if (request.getUserId() == null || request.getBookId() == null) {
            return Result.error("用户ID和图书ID不能为空");
        }
        return Result.success(cartService.addToCart(request.getUserId(), request.getBookId(), request.getQuantity()));
    }

    @PutMapping("/update")
    public Result<Void> updateQuantity(@RequestBody CartRequest request) {
        if (request.getUserId() == null || request.getBookId() == null) {
            return Result.error("用户ID和图书ID不能为空");
        }
        cartService.updateQuantity(request.getUserId(), request.getBookId(), request.getQuantity());
        return Result.success(null);
    }

    @DeleteMapping("/remove")
    public Result<Void> removeItem(@RequestParam Long userId, @RequestParam Long bookId) {
        cartService.removeItem(userId, bookId);
        return Result.success(null);
    }

    @DeleteMapping("/clear")
    public Result<Void> clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
        return Result.success(null);
    }
}

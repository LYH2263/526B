package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.PlaceOrderRequest;
import com.example.book.service.OrderService;
import com.example.book.vo.OrderInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public Result<Map<String, Object>> placeOrder(@RequestBody PlaceOrderRequest request) {
        try {
            if (request.getUserId() == null) {
                return Result.error("用户ID不能为空");
            }
            return Result.success(orderService.placeOrder(request.getUserId()));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping
    public Result<List<OrderInfoVO>> getMyOrders(@RequestParam Long userId) {
        return Result.success(orderService.findMyOrders(userId));
    }

    @GetMapping("/{id}")
    public Result<OrderInfoVO> getOrderDetail(@PathVariable Long id, @RequestParam Long userId) {
        OrderInfoVO order = orderService.getOrderDetail(id, userId);
        if (order == null) {
            return Result.error("订单不存在或无权限查看");
        }
        return Result.success(order);
    }
}

package com.example.book.mapper;

import com.example.book.entity.OrderItem;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface OrderItemMapper {
    void insert(OrderItem orderItem);

    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);
}

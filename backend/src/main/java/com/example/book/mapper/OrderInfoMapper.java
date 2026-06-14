package com.example.book.mapper;

import com.example.book.entity.OrderInfo;
import com.example.book.vo.OrderInfoVO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface OrderInfoMapper {
    void insert(OrderInfo orderInfo);

    List<OrderInfoVO> findByUserId(@Param("userId") Long userId);

    OrderInfoVO findById(@Param("id") Long id);
}

package com.example.book.mapper;

import com.example.book.entity.Cart;
import com.example.book.vo.CartVO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface CartMapper {
    List<CartVO> findByUserId(@Param("userId") Long userId);

    Cart findByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);

    void insert(Cart cart);

    void updateQuantity(Cart cart);

    void deleteById(@Param("id") Long id);

    void deleteByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);

    void clearByUserId(@Param("userId") Long userId);
}

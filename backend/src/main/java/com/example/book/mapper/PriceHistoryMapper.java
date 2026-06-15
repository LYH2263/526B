package com.example.book.mapper;

import com.example.book.entity.PriceHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface PriceHistoryMapper {
    int insert(PriceHistory priceHistory);

    List<PriceHistory> findByBookId(@Param("bookId") Long bookId);

    List<PriceHistory> findByBookIdAndTimeRange(
            @Param("bookId") Long bookId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}

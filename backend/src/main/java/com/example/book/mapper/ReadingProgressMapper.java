package com.example.book.mapper;

import com.example.book.entity.ReadingProgress;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReadingProgressMapper {
    ReadingProgress findByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);
    List<ReadingProgress> findReadingListByUserId(@Param("userId") Long userId);
    int insert(ReadingProgress progress);
    int update(ReadingProgress progress);
}

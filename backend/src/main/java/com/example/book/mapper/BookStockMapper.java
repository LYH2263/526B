package com.example.book.mapper;

import com.example.book.entity.BookStock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BookStockMapper {
    int insert(BookStock stock);
    int update(BookStock stock);
    BookStock findById(@Param("id") Long id);
    BookStock findByBookIdAndBranchId(@Param("bookId") Long bookId, @Param("branchId") Long branchId);
    BookStock findByBookIdAndBranchIdForUpdate(@Param("bookId") Long bookId, @Param("branchId") Long branchId);
    List<BookStock> findByBookId(@Param("bookId") Long bookId);
    List<BookStock> findByBranchId(@Param("branchId") Long branchId);
    int decreaseAvailable(@Param("bookId") Long bookId, @Param("branchId") Long branchId, @Param("quantity") Integer quantity, @Param("version") Integer version);
    int increaseAvailable(@Param("bookId") Long bookId, @Param("branchId") Long branchId, @Param("quantity") Integer quantity, @Param("version") Integer version);
    int decreaseInTransit(@Param("bookId") Long bookId, @Param("branchId") Long branchId, @Param("quantity") Integer quantity, @Param("version") Integer version);
    int increaseInTransit(@Param("bookId") Long bookId, @Param("branchId") Long branchId, @Param("quantity") Integer quantity, @Param("version") Integer version);
    int decreaseStockAndAvailable(@Param("bookId") Long bookId, @Param("branchId") Long branchId, @Param("quantity") Integer quantity, @Param("version") Integer version);
    int increaseStockAndAvailable(@Param("bookId") Long bookId, @Param("branchId") Long branchId, @Param("quantity") Integer quantity, @Param("version") Integer version);
}

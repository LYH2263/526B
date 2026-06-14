package com.example.book.mapper;

import com.example.book.entity.BooklistItem;
import com.example.book.vo.BooklistItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BooklistItemMapper {
    List<BooklistItemVO> findByBooklistId(@Param("booklistId") Long booklistId);
    BooklistItem findByBooklistIdAndBookId(@Param("booklistId") Long booklistId, @Param("bookId") Long bookId);
    int insert(BooklistItem item);
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
    int deleteById(@Param("id") Long id);
    int deleteByBooklistIdAndBookId(@Param("booklistId") Long booklistId, @Param("bookId") Long bookId);
    int deleteByBooklistId(@Param("booklistId") Long booklistId);
    int countByBooklistId(@Param("booklistId") Long booklistId);
}

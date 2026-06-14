package com.example.book.mapper;

import com.example.book.entity.BookVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BookVersionMapper {
    int insert(BookVersion bookVersion);

    List<BookVersion> findByBookId(@Param("bookId") Long bookId);

    BookVersion findByBookIdAndVersionNumber(@Param("bookId") Long bookId, @Param("versionNumber") Integer versionNumber);

    Integer findMaxVersionNumber(@Param("bookId") Long bookId);
}

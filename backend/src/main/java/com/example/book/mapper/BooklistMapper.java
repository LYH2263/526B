package com.example.book.mapper;

import com.example.book.entity.Booklist;
import com.example.book.vo.BooklistVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BooklistMapper {
    List<BooklistVO> findByUserId(@Param("userId") Long userId);
    Booklist findById(@Param("id") Long id);
    BooklistVO findDetailById(@Param("id") Long id);
    BooklistVO findByShareToken(@Param("shareToken") String shareToken);
    int insert(Booklist booklist);
    int update(Booklist booklist);
    int deleteById(@Param("id") Long id);
    int updateShareToken(@Param("id") Long id, @Param("shareToken") String shareToken);
}

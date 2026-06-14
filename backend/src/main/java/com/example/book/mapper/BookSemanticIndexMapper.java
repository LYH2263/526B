package com.example.book.mapper;

import com.example.book.entity.BookSemanticIndex;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BookSemanticIndexMapper {
    
    BookSemanticIndex findById(Long id);
    
    BookSemanticIndex findByBookId(Long bookId);
    
    List<BookSemanticIndex> findAll();
    
    void insert(BookSemanticIndex index);
    
    void update(BookSemanticIndex index);
    
    void deleteById(Long id);
    
    void deleteByBookId(Long bookId);
    
    List<BookSemanticIndex> findByGenreTag(@Param("tag") String tag);
    
    List<BookSemanticIndex> findByAudienceTag(@Param("tag") String tag);
    
    List<BookSemanticIndex> findByStyleTag(@Param("tag") String tag);
}

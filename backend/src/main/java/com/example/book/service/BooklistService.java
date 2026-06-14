package com.example.book.service;

import com.example.book.dto.BooklistCreateDTO;
import com.example.book.dto.BooklistUpdateDTO;
import com.example.book.dto.BooklistItemSortDTO;
import com.example.book.entity.Booklist;
import com.example.book.entity.BooklistItem;
import com.example.book.mapper.BooklistItemMapper;
import com.example.book.mapper.BooklistMapper;
import com.example.book.vo.BooklistItemVO;
import com.example.book.vo.BooklistVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Base64;

@Service
public class BooklistService {

    @Autowired
    private BooklistMapper booklistMapper;

    @Autowired
    private BooklistItemMapper booklistItemMapper;

    private static final SecureRandom RANDOM = new SecureRandom();

    public List<BooklistVO> listMyBooklists(Long userId) {
        return booklistMapper.findByUserId(userId);
    }

    public BooklistVO getDetail(Long id, Long userId) {
        Booklist booklist = booklistMapper.findById(id);
        if (booklist == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!booklist.getIsPublic() && !booklist.getUserId().equals(userId)) {
            throw new RuntimeException("无权限访问该私有书单");
        }
        BooklistVO vo = booklistMapper.findDetailById(id);
        List<BooklistItemVO> items = booklistItemMapper.findByBooklistId(id);
        vo.setItems(items);
        return vo;
    }

    public BooklistVO getByShareToken(String shareToken) {
        BooklistVO vo = booklistMapper.findByShareToken(shareToken);
        if (vo == null) {
            throw new RuntimeException("分享链接无效或书单已设为私有");
        }
        List<BooklistItemVO> items = booklistItemMapper.findByBooklistId(vo.getId());
        vo.setItems(items);
        return vo;
    }

    @Transactional
    public Long create(BooklistCreateDTO dto) {
        Booklist booklist = new Booklist();
        booklist.setName(dto.getName());
        booklist.setDescription(dto.getDescription());
        booklist.setCoverUrl(dto.getCoverUrl());
        booklist.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false);
        booklist.setUserId(dto.getUserId());
        if (booklist.getIsPublic()) {
            booklist.setShareToken(generateShareToken());
        }
        booklistMapper.insert(booklist);
        return booklist.getId();
    }

    @Transactional
    public void update(BooklistUpdateDTO dto, Long userId) {
        Booklist existing = booklistMapper.findById(dto.getId());
        if (existing == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改该书单");
        }
        existing.setName(dto.getName() != null ? dto.getName() : existing.getName());
        existing.setDescription(dto.getDescription() != null ? dto.getDescription() : existing.getDescription());
        existing.setCoverUrl(dto.getCoverUrl() != null ? dto.getCoverUrl() : existing.getCoverUrl());
        if (dto.getIsPublic() != null) {
            existing.setIsPublic(dto.getIsPublic());
            if (dto.getIsPublic() && existing.getShareToken() == null) {
                existing.setShareToken(generateShareToken());
            }
            if (!dto.getIsPublic()) {
                existing.setShareToken(null);
            }
        }
        booklistMapper.update(existing);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Booklist existing = booklistMapper.findById(id);
        if (existing == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权限删除该书单");
        }
        booklistItemMapper.deleteByBooklistId(id);
        booklistMapper.deleteById(id);
    }

    @Transactional
    public String generateShareLink(Long id, Long userId) {
        Booklist existing = booklistMapper.findById(id);
        if (existing == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作该书单");
        }
        String token = existing.getShareToken();
        if (token == null) {
            token = generateShareToken();
            booklistMapper.updateShareToken(id, token);
            existing.setIsPublic(true);
            booklistMapper.update(existing);
        }
        return token;
    }

    @Transactional
    public void addBook(Long booklistId, Long bookId, Long userId) {
        Booklist booklist = booklistMapper.findById(booklistId);
        if (booklist == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!booklist.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改该书单");
        }
        BooklistItem existing = booklistItemMapper.findByBooklistIdAndBookId(booklistId, bookId);
        if (existing != null) {
            throw new RuntimeException("该书已在书单中");
        }
        int count = booklistItemMapper.countByBooklistId(booklistId);
        BooklistItem item = new BooklistItem();
        item.setBooklistId(booklistId);
        item.setBookId(bookId);
        item.setSortOrder(count);
        booklistItemMapper.insert(item);
    }

    @Transactional
    public void removeBook(Long booklistId, Long bookId, Long userId) {
        Booklist booklist = booklistMapper.findById(booklistId);
        if (booklist == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!booklist.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改该书单");
        }
        booklistItemMapper.deleteByBooklistIdAndBookId(booklistId, bookId);
    }

    @Transactional
    public void reorderBooks(BooklistItemSortDTO dto, Long userId) {
        Booklist booklist = booklistMapper.findById(dto.getBooklistId());
        if (booklist == null) {
            throw new RuntimeException("书单不存在");
        }
        if (!booklist.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改该书单");
        }
        List<Long> bookIds = dto.getBookIds();
        for (int i = 0; i < bookIds.size(); i++) {
            Long bookId = bookIds.get(i);
            BooklistItem item = booklistItemMapper.findByBooklistIdAndBookId(dto.getBooklistId(), bookId);
            if (item != null) {
                booklistItemMapper.updateSortOrder(item.getId(), i);
            }
        }
    }

    private String generateShareToken() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

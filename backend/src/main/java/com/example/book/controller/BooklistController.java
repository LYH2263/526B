package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.BooklistCreateDTO;
import com.example.book.dto.BooklistUpdateDTO;
import com.example.book.dto.BooklistItemSortDTO;
import com.example.book.service.BooklistService;
import com.example.book.vo.BooklistVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booklists")
public class BooklistController {

    @Autowired
    private BooklistService booklistService;

    @GetMapping
    public Result<List<BooklistVO>> list(@RequestParam Long userId) {
        return Result.success(booklistService.listMyBooklists(userId));
    }

    @GetMapping("/{id}")
    public Result<BooklistVO> getDetail(@PathVariable Long id, @RequestParam Long userId) {
        return Result.success(booklistService.getDetail(id, userId));
    }

    @GetMapping("/share/{shareToken}")
    public Result<BooklistVO> getByShareToken(@PathVariable String shareToken) {
        return Result.success(booklistService.getByShareToken(shareToken));
    }

    @PostMapping
    public Result<Long> create(@RequestBody BooklistCreateDTO dto) {
        return Result.success(booklistService.create(dto));
    }

    @PutMapping
    public Result<Void> update(@RequestBody BooklistUpdateDTO dto, @RequestParam Long userId) {
        booklistService.update(dto, userId);
        return Result.success(null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, @RequestParam Long userId) {
        booklistService.delete(id, userId);
        return Result.success(null);
    }

    @PostMapping("/{id}/share")
    public Result<String> generateShareLink(@PathVariable Long id, @RequestParam Long userId) {
        return Result.success(booklistService.generateShareLink(id, userId));
    }

    @PostMapping("/items")
    public Result<Void> addBook(@RequestBody Map<String, Long> body, @RequestParam Long userId) {
        Long booklistId = body.get("booklistId");
        Long bookId = body.get("bookId");
        booklistService.addBook(booklistId, bookId, userId);
        return Result.success(null);
    }

    @DeleteMapping("/items")
    public Result<Void> removeBook(@RequestParam Long booklistId, @RequestParam Long bookId, @RequestParam Long userId) {
        booklistService.removeBook(booklistId, bookId, userId);
        return Result.success(null);
    }

    @PostMapping("/items/reorder")
    public Result<Void> reorderBooks(@RequestBody BooklistItemSortDTO dto, @RequestParam Long userId) {
        booklistService.reorderBooks(dto, userId);
        return Result.success(null);
    }
}

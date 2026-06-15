package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.entity.Book;
import com.example.book.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public Result<List<Book>> list() {
        return Result.success(bookService.findAll());
    }

    @GetMapping("/{id}")
    public Result<Book> get(@PathVariable Long id) {
        return Result.success(bookService.findById(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody Map<String, Object> body) {
        Book book = mapToBook(body);
        String modifierName = (String) body.getOrDefault("modifierName", "未知");
        bookService.save(book, modifierName);
        return Result.success(null);
    }

    @PutMapping
    public Result<Void> update(@RequestBody Map<String, Object> body) {
        Book book = mapToBook(body);
        String modifierName = (String) body.getOrDefault("modifierName", "未知");
        bookService.save(book, modifierName);
        return Result.success(null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        bookService.deleteById(id);
        return Result.success(null);
    }

    @SuppressWarnings("unchecked")
    private Book mapToBook(Map<String, Object> body) {
        Book book = new Book();
        if (body.get("id") != null) {
            book.setId(((Number) body.get("id")).longValue());
        }
        book.setTitle((String) body.get("title"));
        book.setAuthor((String) body.get("author"));
        if (body.get("price") != null) {
            book.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        }
        if (body.get("publishDate") != null && !body.get("publishDate").toString().isEmpty()) {
            book.setPublishDate(java.time.LocalDate.parse(body.get("publishDate").toString()));
        }
        book.setDescription((String) body.get("description"));
        book.setCoverUrl((String) body.get("coverUrl"));
        book.setCoverThumbList((String) body.get("coverThumbList"));
        book.setCoverThumbDetail((String) body.get("coverThumbDetail"));
        return book;
    }
}

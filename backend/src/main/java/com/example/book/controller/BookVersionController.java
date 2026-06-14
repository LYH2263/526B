package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.entity.BookVersion;
import com.example.book.service.BookVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books/{bookId}/versions")
public class BookVersionController {

    @Autowired
    private BookVersionService bookVersionService;

    @GetMapping
    public Result<List<BookVersion>> listVersions(@PathVariable Long bookId) {
        return Result.success(bookVersionService.getVersionList(bookId));
    }

    @GetMapping("/{versionNumber}")
    public Result<BookVersion> getVersionDetail(@PathVariable Long bookId,
                                                 @PathVariable Integer versionNumber) {
        return Result.success(bookVersionService.getVersionDetail(bookId, versionNumber));
    }

    @GetMapping("/compare")
    public Result<List<Map<String, Object>>> compareVersions(@PathVariable Long bookId,
                                                              @RequestParam Integer v1,
                                                              @RequestParam Integer v2) {
        return Result.success(bookVersionService.compareVersions(bookId, v1, v2));
    }

    @PostMapping("/{versionNumber}/rollback")
    public Result<BookVersion> rollbackToVersion(@PathVariable Long bookId,
                                                  @PathVariable Integer versionNumber,
                                                  @RequestBody Map<String, String> body) {
        String modifierName = body.getOrDefault("modifierName", "未知");
        return Result.success(bookVersionService.rollbackToVersion(bookId, versionNumber, modifierName));
    }
}

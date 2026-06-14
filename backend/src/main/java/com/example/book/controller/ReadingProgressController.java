package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.ReadingProgressSaveDTO;
import com.example.book.service.ReadingProgressService;
import com.example.book.vo.ReadingProgressVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reading-progress")
public class ReadingProgressController {

    @Autowired
    private ReadingProgressService readingProgressService;

    @PostMapping
    public Result<Void> saveProgress(@RequestBody ReadingProgressSaveDTO dto) {
        readingProgressService.saveProgress(dto);
        return Result.success(null);
    }

    @GetMapping
    public Result<ReadingProgressVO> getProgress(@RequestParam Long userId, @RequestParam Long bookId) {
        return Result.success(readingProgressService.getProgress(userId, bookId));
    }

    @GetMapping("/my-reading")
    public Result<List<ReadingProgressVO>> getMyReadingList(@RequestParam Long userId) {
        return Result.success(readingProgressService.getReadingList(userId));
    }
}

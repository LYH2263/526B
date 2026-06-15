package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.service.ImageService;
import com.example.book.vo.ImageUploadVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @PostMapping("/upload/cover")
    public Result<ImageUploadVO> uploadCover(@RequestParam("file") MultipartFile file) {
        try {
            ImageUploadVO result = imageService.uploadCover(file);
            return Result.success(result);
        } catch (IllegalArgumentException e) {
            return Result.error(400, e.getMessage());
        } catch (IOException e) {
            return Result.error(500, "图片处理失败：" + e.getMessage());
        }
    }
}

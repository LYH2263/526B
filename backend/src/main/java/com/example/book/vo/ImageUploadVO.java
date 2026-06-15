package com.example.book.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadVO {
    private String originalUrl;
    private String originalPath;
    private String thumbListUrl;
    private String thumbListPath;
    private String thumbDetailUrl;
    private String thumbDetailPath;
    private String filename;
    private long size;
    private int width;
    private int height;
}

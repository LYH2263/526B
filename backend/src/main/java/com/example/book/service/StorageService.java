package com.example.book.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {

    String upload(MultipartFile file, String path);

    InputStream download(String path);

    void delete(String path);

    boolean exists(String path);

    String getUrl(String path);
}

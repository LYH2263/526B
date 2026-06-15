package com.example.book.service;

import com.example.book.config.StorageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class LocalStorageService implements StorageService {

    @Autowired
    private StorageProperties storageProperties;

    private Path basePath;

    @PostConstruct
    public void init() {
        basePath = Paths.get(storageProperties.getLocal().getBasePath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(basePath);
            Files.createDirectories(basePath.resolve("original"));
            Files.createDirectories(basePath.resolve("thumb_list"));
            Files.createDirectories(basePath.resolve("thumb_detail"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String upload(MultipartFile file, String path) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }
        Path targetLocation = basePath.resolve(path).normalize();
        if (!targetLocation.startsWith(basePath)) {
            throw new RuntimeException("Cannot store file outside current directory");
        }
        try {
            Files.createDirectories(targetLocation.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            return path;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public InputStream download(String path) {
        try {
            Path file = basePath.resolve(path).normalize();
            if (!file.startsWith(basePath)) {
                throw new RuntimeException("Cannot access file outside current directory");
            }
            return Files.newInputStream(file);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            if (path == null || path.isEmpty()) {
                return;
            }
            Path file = basePath.resolve(path).normalize();
            if (!file.startsWith(basePath)) {
                throw new RuntimeException("Cannot delete file outside current directory");
            }
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public boolean exists(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }
        Path file = basePath.resolve(path).normalize();
        return file.startsWith(basePath) && Files.exists(file);
    }

    @Override
    public String getUrl(String path) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        return storageProperties.getLocal().getUrlPrefix() + "/" + path;
    }

    public Path getBasePath() {
        return basePath;
    }
}

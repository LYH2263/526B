package com.example.book.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private String type;
    private LocalStorage local = new LocalStorage();
    private Thumbnail thumbnail = new Thumbnail();
    private Watermark watermark = new Watermark();

    @Data
    public static class LocalStorage {
        private String basePath;
        private String urlPrefix;
    }

    @Data
    public static class Thumbnail {
        private ThumbnailConfig list = new ThumbnailConfig();
        private ThumbnailConfig detail = new ThumbnailConfig();

        @Data
        public static class ThumbnailConfig {
            private int width;
            private int height;
            private float quality;
        }
    }

    @Data
    public static class Watermark {
        private boolean enabled;
        private String text;
        private float opacity;
    }
}

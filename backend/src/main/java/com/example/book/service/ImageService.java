package com.example.book.service;

import com.example.book.config.StorageProperties;
import com.example.book.vo.ImageUploadVO;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ImageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Autowired
    private StorageService storageService;

    @Autowired
    private LocalStorageService localStorageService;

    @Autowired
    private StorageProperties storageProperties;

    public ImageUploadVO uploadCover(MultipartFile file) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String uniqueName = UUID.randomUUID().toString().replace("-", "");
        String filename = uniqueName + "." + extension;

        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        String originalPath = "original/" + filename;
        storageService.upload(file, originalPath);

        StorageProperties.Thumbnail.ThumbnailConfig listConfig = storageProperties.getThumbnail().getList();
        String thumbListPath = "thumb_list/" + uniqueName + "." + extension;
        generateThumbnail(originalImage, listConfig.getWidth(), listConfig.getHeight(),
                listConfig.getQuality(), thumbListPath, extension);

        StorageProperties.Thumbnail.ThumbnailConfig detailConfig = storageProperties.getThumbnail().getDetail();
        String thumbDetailPath = "thumb_detail/" + uniqueName + "." + extension;
        generateThumbnail(originalImage, detailConfig.getWidth(), detailConfig.getHeight(),
                detailConfig.getQuality(), thumbDetailPath, extension);

        ImageUploadVO vo = new ImageUploadVO();
        vo.setOriginalUrl(storageService.getUrl(originalPath));
        vo.setOriginalPath(originalPath);
        vo.setThumbListUrl(storageService.getUrl(thumbListPath));
        vo.setThumbListPath(thumbListPath);
        vo.setThumbDetailUrl(storageService.getUrl(thumbDetailPath));
        vo.setThumbDetailPath(thumbDetailPath);
        vo.setFilename(filename);
        vo.setSize(file.getSize());
        vo.setWidth(originalWidth);
        vo.setHeight(originalHeight);

        return vo;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("仅支持JPG、PNG、WebP格式的图片");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("文件名不能为空");
        }

        String extension = getExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("仅支持JPG、PNG、WebP格式的图片");
        }

        byte[] header = new byte[8];
        try {
            file.getInputStream().read(header);
            if (!isValidImageHeader(header, extension)) {
                throw new IllegalArgumentException("文件内容与扩展名不匹配，可能是伪造文件");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("无法读取文件内容");
        }
    }

    private boolean isValidImageHeader(byte[] header, String extension) {
        extension = extension.toLowerCase();
        if (extension.equals("jpg") || extension.equals("jpeg")) {
            return header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF;
        } else if (extension.equals("png")) {
            return header[0] == (byte) 0x89 && header[1] == (byte) 0x50
                    && header[2] == (byte) 0x4E && header[3] == (byte) 0x47;
        } else if (extension.equals("webp")) {
            return header[0] == (byte) 0x52 && header[1] == (byte) 0x49
                    && header[2] == (byte) 0x46 && header[3] == (byte) 0x46
                    && header[8] == (byte) 0x57 && header[9] == (byte) 0x45
                    && header[10] == (byte) 0x42 && header[11] == (byte) 0x50;
        }
        return false;
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }

    private void generateThumbnail(BufferedImage originalImage, int targetWidth, int targetHeight,
                                   float quality, String outputPath, String extension) throws IOException {
        Path tempPath = localStorageService.getBasePath().resolve(outputPath + "_temp");
        Path finalPath = localStorageService.getBasePath().resolve(outputPath);

        Files.createDirectories(finalPath.getParent());

        Thumbnails.Builder<BufferedImage> builder = Thumbnails.of(originalImage)
                .size(targetWidth, targetHeight)
                .outputQuality(quality)
                .outputFormat(getOutputFormat(extension));

        if (storageProperties.getWatermark().isEnabled()) {
            String watermarkText = storageProperties.getWatermark().getText();
            float opacity = storageProperties.getWatermark().getOpacity();
            BufferedImage watermark = createTextWatermark(watermarkText, opacity);
            builder.watermark(Positions.BOTTOM_RIGHT, watermark, opacity);
        }

        builder.toFile(tempPath.toFile());

        Files.move(tempPath, finalPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
    }

    private String getOutputFormat(String extension) {
        extension = extension.toLowerCase();
        if (extension.equals("jpg") || extension.equals("jpeg")) {
            return "jpg";
        }
        return extension;
    }

    private BufferedImage createTextWatermark(String text, float opacity) {
        int width = 200;
        int height = 40;
        BufferedImage watermark = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = watermark.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));
        g2d.setPaint(Color.WHITE);
        g2d.setFont(new Font("Arial", Font.BOLD, 20));
        FontMetrics fm = g2d.getFontMetrics();
        int x = (width - fm.stringWidth(text)) / 2;
        int y = ((height - fm.getHeight()) / 2) + fm.getAscent();
        g2d.drawString(text, x, y);
        g2d.dispose();
        return watermark;
    }

    public void deleteCoverImage(String originalPath, String thumbListPath, String thumbDetailPath) {
        try {
            if (originalPath != null) {
                storageService.delete(originalPath);
            }
            if (thumbListPath != null) {
                storageService.delete(thumbListPath);
            }
            if (thumbDetailPath != null) {
                storageService.delete(thumbDetailPath);
            }
        } catch (Exception e) {
        }
    }
}

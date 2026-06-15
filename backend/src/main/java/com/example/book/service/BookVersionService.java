package com.example.book.service;

import com.example.book.entity.Book;
import com.example.book.entity.BookVersion;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.BookVersionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookVersionService {

    @Autowired
    private BookVersionMapper bookVersionMapper;

    @Autowired
    private BookMapper bookMapper;

    @Transactional
    public void createSnapshot(Book book, String modifierName, String changeType, Integer rollbackFromVersion) {
        Integer maxVersion = bookVersionMapper.findMaxVersionNumber(book.getId());
        int nextVersion = (maxVersion == null ? 0 : maxVersion) + 1;

        BookVersion version = new BookVersion();
        version.setBookId(book.getId());
        version.setVersionNumber(nextVersion);
        version.setModifierName(modifierName);
        version.setChangeType(changeType);
        version.setTitle(book.getTitle());
        version.setAuthor(book.getAuthor());
        version.setPrice(book.getPrice());
        version.setPublishDate(book.getPublishDate());
        version.setDescription(book.getDescription());
        version.setCoverUrl(book.getCoverUrl());
        version.setCoverThumbList(book.getCoverThumbList());
        version.setCoverThumbDetail(book.getCoverThumbDetail());
        version.setRollbackFromVersion(rollbackFromVersion);

        bookVersionMapper.insert(version);
    }

    public List<BookVersion> getVersionList(Long bookId) {
        return bookVersionMapper.findByBookId(bookId);
    }

    public BookVersion getVersionDetail(Long bookId, Integer versionNumber) {
        BookVersion version = bookVersionMapper.findByBookIdAndVersionNumber(bookId, versionNumber);
        if (version == null) {
            throw new IllegalArgumentException("版本不存在: 图书ID=" + bookId + ", 版本号=" + versionNumber);
        }
        return version;
    }

    public List<Map<String, Object>> compareVersions(Long bookId, Integer v1, Integer v2) {
        BookVersion version1 = bookVersionMapper.findByBookIdAndVersionNumber(bookId, v1);
        BookVersion version2 = bookVersionMapper.findByBookIdAndVersionNumber(bookId, v2);

        if (version1 == null || version2 == null) {
            throw new IllegalArgumentException("所比较的版本不存在");
        }

        List<Map<String, Object>> diffs = new ArrayList<>();

        addFieldDiff(diffs, "title", "书名", version1.getTitle(), version2.getTitle());
        addFieldDiff(diffs, "author", "作者", version1.getAuthor(), version2.getAuthor());
        addFieldDiff(diffs, "price", "价格",
                version1.getPrice() != null ? version1.getPrice().toPlainString() : null,
                version2.getPrice() != null ? version2.getPrice().toPlainString() : null);
        addFieldDiff(diffs, "publishDate", "出版日期",
                version1.getPublishDate() != null ? version1.getPublishDate().toString() : null,
                version2.getPublishDate() != null ? version2.getPublishDate().toString() : null);
        addFieldDiff(diffs, "description", "简介", version1.getDescription(), version2.getDescription());
        addFieldDiff(diffs, "coverUrl", "封面图片", version1.getCoverUrl(), version2.getCoverUrl());

        return diffs;
    }

    private void addFieldDiff(List<Map<String, Object>> diffs, String field, String label,
                              String oldValue, String newValue) {
        Map<String, Object> diff = new LinkedHashMap<>();
        diff.put("field", field);
        diff.put("label", label);
        diff.put("oldValue", oldValue);
        diff.put("newValue", newValue);
        diff.put("changed", !stringEquals(oldValue, newValue));
        diffs.add(diff);
    }

    private boolean stringEquals(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }

    @Transactional
    public BookVersion rollbackToVersion(Long bookId, Integer targetVersionNumber, String modifierName) {
        BookVersion targetVersion = bookVersionMapper.findByBookIdAndVersionNumber(bookId, targetVersionNumber);
        if (targetVersion == null) {
            throw new IllegalArgumentException("目标版本不存在: 版本号=" + targetVersionNumber);
        }

        Book book = bookMapper.findById(bookId);
        if (book == null) {
            throw new IllegalArgumentException("图书不存在: ID=" + bookId);
        }

        book.setTitle(targetVersion.getTitle());
        book.setAuthor(targetVersion.getAuthor());
        book.setPrice(targetVersion.getPrice());
        book.setPublishDate(targetVersion.getPublishDate());
        book.setDescription(targetVersion.getDescription());
        book.setCoverUrl(targetVersion.getCoverUrl());
        book.setCoverThumbList(targetVersion.getCoverThumbList());
        book.setCoverThumbDetail(targetVersion.getCoverThumbDetail());
        bookMapper.update(book);

        Integer maxVersion = bookVersionMapper.findMaxVersionNumber(bookId);
        int nextVersion = (maxVersion == null ? 0 : maxVersion) + 1;

        BookVersion rollbackVersion = new BookVersion();
        rollbackVersion.setBookId(bookId);
        rollbackVersion.setVersionNumber(nextVersion);
        rollbackVersion.setModifierName(modifierName);
        rollbackVersion.setChangeType("ROLLBACK");
        rollbackVersion.setTitle(book.getTitle());
        rollbackVersion.setAuthor(book.getAuthor());
        rollbackVersion.setPrice(book.getPrice());
        rollbackVersion.setPublishDate(book.getPublishDate());
        rollbackVersion.setDescription(book.getDescription());
        rollbackVersion.setCoverUrl(book.getCoverUrl());
        rollbackVersion.setCoverThumbList(book.getCoverThumbList());
        rollbackVersion.setCoverThumbDetail(book.getCoverThumbDetail());
        rollbackVersion.setRollbackFromVersion(targetVersionNumber);

        bookVersionMapper.insert(rollbackVersion);

        return rollbackVersion;
    }
}

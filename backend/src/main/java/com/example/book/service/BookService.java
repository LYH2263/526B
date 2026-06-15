package com.example.book.service;

import com.example.book.entity.Book;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.BookVersionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private BookVersionMapper bookVersionMapper;

    @Autowired
    private SemanticIndexService semanticIndexService;

    @Autowired
    private ImageService imageService;

    public List<Book> findAll() {
        return bookMapper.findAll();
    }

    public Book findById(Long id) {
        return bookMapper.findById(id);
    }

    @Transactional
    public void save(Book book, String modifierName) {
        if (book.getId() == null) {
            bookMapper.insert(book);
            createVersionSnapshot(book, modifierName, "CREATE", null);
            semanticIndexService.buildIndexForBook(book.getId());
        } else {
            Book oldBook = bookMapper.findById(book.getId());
            if (oldBook != null) {
                cleanupOldCoverIfChanged(oldBook, book);
            }
            bookMapper.update(book);
            createVersionSnapshot(book, modifierName, "UPDATE", null);
            semanticIndexService.rebuildIndexForBook(book.getId());
        }
    }

    @Transactional
    public void deleteById(Long id) {
        Book book = bookMapper.findById(id);
        if (book != null) {
            imageService.deleteCoverImage(
                    extractPathFromUrl(book.getCoverUrl()),
                    extractPathFromUrl(book.getCoverThumbList()),
                    extractPathFromUrl(book.getCoverThumbDetail())
            );
        }
        semanticIndexService.deleteIndexForBook(id);
        bookMapper.deleteById(id);
    }

    private void cleanupOldCoverIfChanged(Book oldBook, Book newBook) {
        String oldCover = oldBook.getCoverUrl();
        String newCover = newBook.getCoverUrl();

        if (oldCover != null && !oldCover.isEmpty()
                && (newCover == null || !oldCover.equals(newCover))) {
            imageService.deleteCoverImage(
                    extractPathFromUrl(oldBook.getCoverUrl()),
                    extractPathFromUrl(oldBook.getCoverThumbList()),
                    extractPathFromUrl(oldBook.getCoverThumbDetail())
            );
        }
    }

    private String extractPathFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        int index = url.indexOf("/uploads/");
        if (index != -1) {
            return url.substring(index + "/uploads/".length());
        }
        return null;
    }

    private void createVersionSnapshot(Book book, String modifierName, String changeType, Integer rollbackFromVersion) {
        Integer maxVersion = bookVersionMapper.findMaxVersionNumber(book.getId());
        int nextVersion = (maxVersion == null ? 0 : maxVersion) + 1;

        com.example.book.entity.BookVersion version = new com.example.book.entity.BookVersion();
        version.setBookId(book.getId());
        version.setVersionNumber(nextVersion);
        version.setModifierName(modifierName != null ? modifierName : "未知");
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
}

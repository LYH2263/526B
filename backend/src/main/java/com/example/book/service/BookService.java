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
        } else {
            bookMapper.update(book);
            createVersionSnapshot(book, modifierName, "UPDATE", null);
        }
    }

    public void deleteById(Long id) {
        bookMapper.deleteById(id);
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
        version.setRollbackFromVersion(rollbackFromVersion);

        bookVersionMapper.insert(version);
    }
}

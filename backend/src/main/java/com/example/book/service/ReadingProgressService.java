package com.example.book.service;

import com.example.book.dto.ReadingProgressSaveDTO;
import com.example.book.entity.Book;
import com.example.book.entity.ReadingProgress;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.ReadingProgressMapper;
import com.example.book.vo.ReadingProgressVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReadingProgressService {

    @Autowired
    private ReadingProgressMapper readingProgressMapper;

    @Autowired
    private BookMapper bookMapper;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Transactional
    public void saveProgress(ReadingProgressSaveDTO dto) {
        Book book = bookMapper.findById(dto.getBookId());
        if (book == null) {
            throw new RuntimeException("图书不存在");
        }

        ReadingProgress existing = readingProgressMapper.findByUserIdAndBookId(dto.getUserId(), dto.getBookId());
        if (existing != null) {
            existing.setCurrentPage(dto.getCurrentPage());
            existing.setTotalPages(dto.getTotalPages());
            existing.setProgressPercent(dto.getProgressPercent());
            readingProgressMapper.update(existing);
        } else {
            ReadingProgress progress = new ReadingProgress();
            progress.setUserId(dto.getUserId());
            progress.setBookId(dto.getBookId());
            progress.setBookTitle(book.getTitle());
            progress.setBookAuthor(book.getAuthor());
            progress.setCurrentPage(dto.getCurrentPage() != null ? dto.getCurrentPage() : 1);
            progress.setTotalPages(dto.getTotalPages() != null ? dto.getTotalPages() : 100);
            progress.setProgressPercent(dto.getProgressPercent() != null ? dto.getProgressPercent() : BigDecimal.ZERO);
            readingProgressMapper.insert(progress);
        }
    }

    public ReadingProgressVO getProgress(Long userId, Long bookId) {
        ReadingProgress progress = readingProgressMapper.findByUserIdAndBookId(userId, bookId);
        if (progress == null) {
            return null;
        }
        return convertToVO(progress);
    }

    public List<ReadingProgressVO> getReadingList(Long userId) {
        List<ReadingProgress> list = readingProgressMapper.findReadingListByUserId(userId);
        List<ReadingProgressVO> voList = new ArrayList<>();
        for (ReadingProgress progress : list) {
            voList.add(convertToVO(progress));
        }
        return voList;
    }

    private ReadingProgressVO convertToVO(ReadingProgress progress) {
        ReadingProgressVO vo = new ReadingProgressVO();
        BeanUtils.copyProperties(progress, vo);
        vo.setLastReadTimeStr(formatLastReadTime(progress.getLastReadAt()));
        return vo;
    }

    private String formatLastReadTime(LocalDateTime lastReadAt) {
        if (lastReadAt == null) {
            return "";
        }
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(lastReadAt, now);
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1) {
            return "刚刚";
        } else if (minutes < 60) {
            return minutes + "分钟前";
        } else if (hours < 24) {
            return hours + "小时前";
        } else if (days < 7) {
            return days + "天前";
        } else {
            return lastReadAt.format(FORMATTER);
        }
    }
}

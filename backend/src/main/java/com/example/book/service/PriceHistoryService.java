package com.example.book.service;

import com.example.book.entity.Book;
import com.example.book.entity.PriceHistory;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.PriceHistoryMapper;
import com.example.book.vo.PriceStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PriceHistoryService {

    @Autowired
    private PriceHistoryMapper priceHistoryMapper;

    @Autowired
    private BookMapper bookMapper;

    public void recordPriceChange(Long bookId, BigDecimal oldPrice, BigDecimal newPrice,
                                  String modifierName, String changeReason) {
        if (oldPrice == null || newPrice == null || oldPrice.compareTo(newPrice) == 0) {
            return;
        }
        PriceHistory history = new PriceHistory();
        history.setBookId(bookId);
        history.setOldPrice(oldPrice);
        history.setNewPrice(newPrice);
        history.setModifierName(modifierName != null ? modifierName : "未知");
        history.setChangeReason(changeReason);
        priceHistoryMapper.insert(history);
    }

    public List<PriceHistory> getPriceHistory(Long bookId) {
        return priceHistoryMapper.findByBookId(bookId);
    }

    public List<PriceHistory> getPriceHistoryByRange(Long bookId, String range) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime;
        switch (range != null ? range.toLowerCase() : "all") {
            case "month":
                startTime = endTime.minusMonths(1);
                break;
            case "year":
                startTime = endTime.minusYears(1);
                break;
            case "all":
            default:
                return priceHistoryMapper.findByBookId(bookId);
        }
        return priceHistoryMapper.findByBookIdAndTimeRange(bookId, startTime, endTime);
    }

    public PriceStatsVO getPriceStats(Long bookId, String range) {
        Book book = bookMapper.findById(bookId);
        if (book == null) {
            return null;
        }

        List<PriceHistory> historyList = getPriceHistoryByRange(bookId, range);
        List<BigDecimal> allPrices = new ArrayList<>();

        if (!historyList.isEmpty()) {
            PriceHistory earliest = historyList.stream()
                    .min(Comparator.comparing(PriceHistory::getCreatedAt))
                    .orElse(null);
            if (earliest != null) {
                allPrices.add(earliest.getOldPrice());
            }
            for (PriceHistory h : historyList) {
                allPrices.add(h.getNewPrice());
            }
        } else {
            allPrices.add(book.getPrice());
        }

        PriceStatsVO stats = new PriceStatsVO();
        stats.setCurrentPrice(book.getPrice());

        if (!allPrices.isEmpty()) {
            stats.setHighestPrice(allPrices.stream().max(BigDecimal::compareTo).orElse(book.getPrice()));
            stats.setLowestPrice(allPrices.stream().min(BigDecimal::compareTo).orElse(book.getPrice()));
        } else {
            stats.setHighestPrice(book.getPrice());
            stats.setLowestPrice(book.getPrice());
        }

        if (!historyList.isEmpty()) {
            PriceHistory earliest = historyList.stream()
                    .min(Comparator.comparing(PriceHistory::getCreatedAt))
                    .orElse(null);
            BigDecimal startPrice = earliest != null ? earliest.getOldPrice() : book.getPrice();
            BigDecimal changeAmount = book.getPrice().subtract(startPrice);
            stats.setChangeAmount(changeAmount);
            if (startPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal changePercent = changeAmount.divide(startPrice, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                stats.setChangePercent(changePercent);
            } else {
                stats.setChangePercent(BigDecimal.ZERO);
            }
        } else {
            stats.setChangeAmount(BigDecimal.ZERO);
            stats.setChangePercent(BigDecimal.ZERO);
        }

        return stats;
    }
}

package com.example.book.service;

import com.example.book.dto.ParsedConstraints;
import com.example.book.entity.Book;
import com.example.book.entity.BookSemanticIndex;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RecommendationReasonService {

    public String generateReason(Book book, 
                                  BookSemanticIndex index, 
                                  ParsedConstraints constraints,
                                  double score) {
        List<String> reasons = new ArrayList<>();
        List<String> matchedConstraints = getMatchedConstraints(index, constraints);

        if (!matchedConstraints.isEmpty()) {
            reasons.add("匹配您的需求：" + String.join("、", matchedConstraints));
        }

        if (score > 0.8) {
            reasons.add("高度相关的推荐");
        } else if (score > 0.6) {
            reasons.add("较为相关的推荐");
        } else if (score > 0.4) {
            reasons.add("部分相关的推荐");
        }

        List<String> keywordReasons = generateKeywordReasons(index, constraints);
        reasons.addAll(keywordReasons);

        if (reasons.isEmpty()) {
            if (book.getDescription() != null && !book.getDescription().isEmpty()) {
                reasons.add("根据您的兴趣为您推荐");
            } else {
                reasons.add("热门推荐");
            }
        }

        return String.join("；", reasons) + "。";
    }

    public List<String> getMatchedConstraints(BookSemanticIndex index, ParsedConstraints constraints) {
        List<String> matched = new ArrayList<>();

        List<String> bookGenres = parseTags(index.getGenreTags());
        List<String> queryGenres = constraints.getGenres();
        if (queryGenres != null) {
            for (String genre : queryGenres) {
                for (String bookGenre : bookGenres) {
                    if (isFuzzyMatch(genre, bookGenre)) {
                        matched.add("题材：" + genre);
                        break;
                    }
                }
            }
        }

        List<String> bookAudiences = parseTags(index.getAudienceTags());
        List<String> queryAudiences = constraints.getAudiences();
        if (queryAudiences != null) {
            for (String audience : queryAudiences) {
                for (String bookAudience : bookAudiences) {
                    if (isFuzzyMatch(audience, bookAudience)) {
                        matched.add("受众：" + audience);
                        break;
                    }
                }
            }
        }

        List<String> bookStyles = parseTags(index.getStyleTags());
        List<String> queryStyles = constraints.getStyles();
        if (queryStyles != null) {
            for (String style : queryStyles) {
                for (String bookStyle : bookStyles) {
                    if (isFuzzyMatch(style, bookStyle)) {
                        matched.add("风格：" + style);
                        break;
                    }
                }
            }
        }

        return matched;
    }

    private List<String> generateKeywordReasons(BookSemanticIndex index, ParsedConstraints constraints) {
        List<String> reasons = new ArrayList<>();
        List<String> queryKeywords = constraints.getKeywords();
        
        if (queryKeywords == null || queryKeywords.isEmpty()) {
            return reasons;
        }

        List<String> bookKeywords = parseKeywords(index.getKeywords());
        Set<String> matchedKeywords = new HashSet<>();

        for (String queryKw : queryKeywords) {
            for (String bookKw : bookKeywords) {
                if (isFuzzyMatch(queryKw, bookKw)) {
                    matchedKeywords.add(queryKw);
                    break;
                }
            }
        }

        if (!matchedKeywords.isEmpty()) {
            List<String> matchedList = new ArrayList<>(matchedKeywords);
            if (matchedList.size() <= 3) {
                reasons.add("内容包含关键词：" + String.join("、", matchedList));
            } else {
                reasons.add("内容包含关键词：" + String.join("、", 
                        matchedList.subList(0, 3)) + "等");
            }
        }

        return reasons;
    }

    private boolean isFuzzyMatch(String s1, String s2) {
        if (s1 == null || s2 == null) {
            return false;
        }
        String lower1 = s1.toLowerCase();
        String lower2 = s2.toLowerCase();
        return lower1.equals(lower2) || 
               lower1.contains(lower2) || 
               lower2.contains(lower1);
    }

    private List<String> parseTags(String tagString) {
        if (tagString == null || tagString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(tagString.split(","));
    }

    private List<String> parseKeywords(String keywordJson) {
        if (keywordJson == null || keywordJson.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            keywordJson = keywordJson.trim();
            if (keywordJson.startsWith("[") && keywordJson.endsWith("]")) {
                keywordJson = keywordJson.substring(1, keywordJson.length() - 1);
            }
            String[] parts = keywordJson.split(",");
            List<String> keywords = new ArrayList<>();
            for (String part : parts) {
                String kw = part.trim();
                if (kw.startsWith("\"") && kw.endsWith("\"")) {
                    kw = kw.substring(1, kw.length() - 1);
                }
                if (!kw.isEmpty()) {
                    keywords.add(kw);
                }
            }
            return keywords;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}

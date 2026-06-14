package com.example.book.service;

import com.example.book.entity.Book;
import com.example.book.entity.BookSemanticIndex;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.BookSemanticIndexMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SemanticIndexService {

    @Autowired
    private BookSemanticIndexMapper semanticIndexMapper;

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private KeywordExtractionService keywordExtractionService;

    @Autowired
    private ConstraintParserService constraintParserService;

    private static final double GENRE_WEIGHT = 0.35;
    private static final double AUDIENCE_WEIGHT = 0.25;
    private static final double STYLE_WEIGHT = 0.20;
    private static final double KEYWORD_WEIGHT = 0.20;

    @Transactional
    public void buildIndexForBook(Long bookId) {
        Book book = bookMapper.findById(bookId);
        if (book == null) {
            return;
        }

        String contentText = buildContentText(book);
        List<String> keywords = keywordExtractionService.extractKeywords(contentText, 50);
        
        List<String> allTexts = getAllBookTexts();
        Map<String, Double> tfidfScores = keywordExtractionService.calculateTfIdf(allTexts, keywords);
        
        List<String> expandedKeywords = keywordExtractionService.expandKeywords(keywords);
        
        List<String> genreTags = extractTags(contentText, constraintParserService.getAllGenreSynonyms());
        List<String> audienceTags = extractTags(contentText, constraintParserService.getAllAudienceSynonyms());
        List<String> styleTags = extractTags(contentText, constraintParserService.getAllStyleSynonyms());

        BookSemanticIndex existingIndex = semanticIndexMapper.findByBookId(bookId);
        BookSemanticIndex index = new BookSemanticIndex();
        index.setBookId(bookId);
        index.setContentText(contentText);
        index.setKeywords(keywordExtractionService.keywordsToJson(expandedKeywords));
        index.setGenreTags(String.join(",", genreTags));
        index.setAudienceTags(String.join(",", audienceTags));
        index.setStyleTags(String.join(",", styleTags));
        index.setTfidfScores(keywordExtractionService.mapToJson(tfidfScores));
        index.setIndexVersion(1);

        if (existingIndex != null) {
            index.setId(existingIndex.getId());
            index.setIndexVersion(existingIndex.getIndexVersion() + 1);
            semanticIndexMapper.update(index);
        } else {
            semanticIndexMapper.insert(index);
        }
    }

    @Transactional
    public void buildIndexForAllBooks() {
        List<Book> books = bookMapper.findAll();
        for (Book book : books) {
            buildIndexForBook(book.getId());
        }
    }

    @Transactional
    public void deleteIndexForBook(Long bookId) {
        semanticIndexMapper.deleteByBookId(bookId);
    }

    @Transactional
    public void rebuildIndexForBook(Long bookId) {
        deleteIndexForBook(bookId);
        buildIndexForBook(bookId);
    }

    public BookSemanticIndex getIndexForBook(Long bookId) {
        return semanticIndexMapper.findByBookId(bookId);
    }

    public List<BookSemanticIndex> getAllIndices() {
        return semanticIndexMapper.findAll();
    }

    private String buildContentText(Book book) {
        StringBuilder sb = new StringBuilder();
        sb.append(book.getTitle()).append(" ");
        sb.append(book.getAuthor()).append(" ");
        if (book.getDescription() != null) {
            sb.append(book.getDescription());
        }
        return sb.toString().trim();
    }

    private List<String> getAllBookTexts() {
        List<Book> books = bookMapper.findAll();
        return books.stream()
                .map(this::buildContentText)
                .collect(Collectors.toList());
    }

    private List<String> extractTags(String text, Map<String, List<String>> synonymMap) {
        Set<String> tags = new HashSet<>();
        String lowerText = text.toLowerCase();

        for (Map.Entry<String, List<String>> entry : synonymMap.entrySet()) {
            String standard = entry.getKey();
            for (String synonym : entry.getValue()) {
                if (lowerText.contains(synonym.toLowerCase())) {
                    tags.add(standard);
                    break;
                }
            }
        }

        return new ArrayList<>(tags);
    }

    public double calculateRelevanceScore(BookSemanticIndex index, 
                                          List<String> queryGenres,
                                          List<String> queryAudiences,
                                          List<String> queryStyles,
                                          List<String> queryKeywords) {
        double genreScore = calculateTagScore(
                parseTags(index.getGenreTags()), 
                queryGenres,
                constraintParserService.getAllGenreSynonyms()
        );

        double audienceScore = calculateTagScore(
                parseTags(index.getAudienceTags()), 
                queryAudiences,
                constraintParserService.getAllAudienceSynonyms()
        );

        double styleScore = calculateTagScore(
                parseTags(index.getStyleTags()), 
                queryStyles,
                constraintParserService.getAllStyleSynonyms()
        );

        double keywordScore = calculateKeywordScore(
                keywordExtractionService.jsonToKeywords(index.getKeywords()),
                keywordExtractionService.jsonToMap(index.getTfidfScores()),
                queryKeywords
        );

        double totalScore = genreScore * GENRE_WEIGHT +
                           audienceScore * AUDIENCE_WEIGHT +
                           styleScore * STYLE_WEIGHT +
                           keywordScore * KEYWORD_WEIGHT;

        return totalScore;
    }

    private double calculateTagScore(List<String> bookTags, 
                                     List<String> queryTags,
                                     Map<String, List<String>> synonymMap) {
        if (queryTags == null || queryTags.isEmpty()) {
            return 1.0;
        }

        if (bookTags == null || bookTags.isEmpty()) {
            return 0.0;
        }

        Set<String> expandedBookTags = new HashSet<>();
        for (String tag : bookTags) {
            expandedBookTags.add(tag);
            List<String> synonyms = synonymMap.getOrDefault(tag, Collections.emptyList());
            expandedBookTags.addAll(synonyms);
        }

        Set<String> expandedQueryTags = new HashSet<>();
        for (String tag : queryTags) {
            expandedQueryTags.add(tag);
            List<String> synonyms = synonymMap.getOrDefault(tag, Collections.emptyList());
            expandedQueryTags.addAll(synonyms);
        }

        int matches = 0;
        for (String queryTag : expandedQueryTags) {
            for (String bookTag : expandedBookTags) {
                if (queryTag.equalsIgnoreCase(bookTag) ||
                    bookTag.toLowerCase().contains(queryTag.toLowerCase()) ||
                    queryTag.toLowerCase().contains(bookTag.toLowerCase())) {
                    matches++;
                    break;
                }
            }
        }

        return (double) matches / queryTags.size();
    }

    private double calculateKeywordScore(List<String> bookKeywords,
                                         Map<String, Double> tfidfScores,
                                         List<String> queryKeywords) {
        if (queryKeywords == null || queryKeywords.isEmpty()) {
            return 0.5;
        }

        if (bookKeywords == null || bookKeywords.isEmpty()) {
            return 0.0;
        }

        List<String> expandedQueryKeywords = keywordExtractionService.expandKeywords(queryKeywords);

        double totalScore = 0.0;
        double maxPossibleScore = 0.0;

        for (String queryKeyword : expandedQueryKeywords) {
            maxPossibleScore += 1.0;
            
            for (String bookKeyword : bookKeywords) {
                double similarity = calculateWordSimilarity(queryKeyword, bookKeyword);
                if (similarity > 0) {
                    double tfidfWeight = tfidfScores.getOrDefault(bookKeyword, 0.5);
                    totalScore += similarity * (0.5 + 0.5 * tfidfWeight);
                    break;
                }
            }
        }

        return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0.0;
    }

    private double calculateWordSimilarity(String word1, String word2) {
        if (word1 == null || word2 == null) {
            return 0.0;
        }

        String w1 = word1.toLowerCase();
        String w2 = word2.toLowerCase();

        if (w1.equals(w2)) {
            return 1.0;
        }

        if (w1.contains(w2) || w2.contains(w1)) {
            return 0.8;
        }

        int maxLength = Math.max(w1.length(), w2.length());
        if (maxLength == 0) {
            return 0.0;
        }

        int editDistance = levenshteinDistance(w1, w2);
        double similarity = 1.0 - (double) editDistance / maxLength;

        return Math.max(0, similarity) * 0.5;
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                                   dp[i - 1][j - 1] + cost);
            }
        }

        return dp[s1.length()][s2.length()];
    }

    private List<String> parseTags(String tagString) {
        if (tagString == null || tagString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(tagString.split(","));
    }

    public boolean hasIndexForBook(Long bookId) {
        return semanticIndexMapper.findByBookId(bookId) != null;
    }
}

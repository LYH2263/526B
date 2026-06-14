package com.example.book.service;

import com.example.book.dto.ParsedConstraints;
import com.example.book.dto.RecommendResult;
import com.example.book.entity.Book;
import com.example.book.entity.BookSemanticIndex;
import com.example.book.mapper.BookMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SemanticSearchService {

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private SemanticIndexService semanticIndexService;

    @Autowired
    private ConstraintParserService constraintParserService;

    @Autowired
    private KeywordExtractionService keywordExtractionService;

    @Autowired
    private RecommendationReasonService reasonService;

    @Value("${recommendation.search.mode:auto}")
    private String defaultSearchMode;

    @Value("${recommendation.search.min-score:0.1}")
    private double minScore;

    @Value("${recommendation.search.use-embedding:false}")
    private boolean useEmbedding;

    private static final Set<String> SENSITIVE_WORDS = new HashSet<>(Arrays.asList(
        "色情", "赌博", "毒品", "暴力", "恐怖", "反动", "分裂",
        "porn", "gamble", "drug", "violence", "terror",
        "fuck", "shit", "bitch", "cunt", "dick", "pussy",
        "sex", "pornography", "xxx"
    ));

    public List<RecommendResult> search(String query, int limit, String mode) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        if (containsSensitiveContent(query)) {
            return Collections.emptyList();
        }

        String effectiveMode = determineSearchMode(mode);

        ParsedConstraints constraints = constraintParserService.parse(query);

        ensureIndicesBuilt();

        List<BookSemanticIndex> allIndices = semanticIndexService.getAllIndices();
        
        List<BookSemanticIndex> candidateIndices = filterByConstraints(allIndices, constraints);

        List<ScoredBook> scoredBooks = new ArrayList<>();
        
        if ("embedding".equals(effectiveMode) && useEmbedding) {
            scoredBooks = scoreByEmbedding(candidateIndices, constraints);
        } else {
            scoredBooks = scoreByKeyword(candidateIndices, constraints);
        }

        List<ScoredBook> filteredAndSorted = scoredBooks.stream()
                .filter(sb -> sb.getScore() >= minScore)
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(limit)
                .collect(Collectors.toList());

        return buildRecommendResults(filteredAndSorted, constraints, effectiveMode);
    }

    private boolean containsSensitiveContent(String query) {
        String lowerQuery = query.toLowerCase();
        for (String word : SENSITIVE_WORDS) {
            if (lowerQuery.contains(word.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private String determineSearchMode(String mode) {
        if (mode != null && !mode.trim().isEmpty()) {
            return mode;
        }
        return "auto".equals(defaultSearchMode) ? "keyword" : defaultSearchMode;
    }

    private void ensureIndicesBuilt() {
        List<Book> books = bookMapper.findAll();
        for (Book book : books) {
            if (!semanticIndexService.hasIndexForBook(book.getId())) {
                semanticIndexService.buildIndexForBook(book.getId());
            }
        }
    }

    private List<BookSemanticIndex> filterByConstraints(List<BookSemanticIndex> indices, 
                                                         ParsedConstraints constraints) {
        List<String> genres = constraints.getGenres();
        List<String> audiences = constraints.getAudiences();
        List<String> styles = constraints.getStyles();

        if ((genres == null || genres.isEmpty()) && 
            (audiences == null || audiences.isEmpty()) && 
            (styles == null || styles.isEmpty())) {
            return indices;
        }

        return indices.stream()
                .filter(index -> matchesConstraints(index, genres, audiences, styles))
                .collect(Collectors.toList());
    }

    private boolean matchesConstraints(BookSemanticIndex index,
                                       List<String> genres,
                                       List<String> audiences,
                                       List<String> styles) {
        if (genres != null && !genres.isEmpty()) {
            boolean genreMatch = false;
            List<String> bookGenres = parseTags(index.getGenreTags());
            for (String genre : genres) {
                for (String bookGenre : bookGenres) {
                    if (bookGenre.equalsIgnoreCase(genre) ||
                        bookGenre.toLowerCase().contains(genre.toLowerCase()) ||
                        genre.toLowerCase().contains(bookGenre.toLowerCase())) {
                        genreMatch = true;
                        break;
                    }
                }
                if (genreMatch) break;
            }
            if (!genreMatch) return false;
        }

        if (audiences != null && !audiences.isEmpty()) {
            boolean audienceMatch = false;
            List<String> bookAudiences = parseTags(index.getAudienceTags());
            for (String audience : audiences) {
                for (String bookAudience : bookAudiences) {
                    if (bookAudience.equalsIgnoreCase(audience) ||
                        bookAudience.toLowerCase().contains(audience.toLowerCase()) ||
                        audience.toLowerCase().contains(bookAudience.toLowerCase())) {
                        audienceMatch = true;
                        break;
                    }
                }
                if (audienceMatch) break;
            }
            if (!audienceMatch) return false;
        }

        if (styles != null && !styles.isEmpty()) {
            boolean styleMatch = false;
            List<String> bookStyles = parseTags(index.getStyleTags());
            for (String style : styles) {
                for (String bookStyle : bookStyles) {
                    if (bookStyle.equalsIgnoreCase(style) ||
                        bookStyle.toLowerCase().contains(style.toLowerCase()) ||
                        style.toLowerCase().contains(bookStyle.toLowerCase())) {
                        styleMatch = true;
                        break;
                    }
                }
                if (styleMatch) break;
            }
            if (!styleMatch) return false;
        }

        return true;
    }

    private List<ScoredBook> scoreByKeyword(List<BookSemanticIndex> indices, 
                                             ParsedConstraints constraints) {
        List<ScoredBook> scoredBooks = new ArrayList<>();

        for (BookSemanticIndex index : indices) {
            double score = semanticIndexService.calculateRelevanceScore(
                    index,
                    constraints.getGenres(),
                    constraints.getAudiences(),
                    constraints.getStyles(),
                    constraints.getKeywords()
            );

            Book book = bookMapper.findById(index.getBookId());
            if (book != null) {
                scoredBooks.add(new ScoredBook(book, index, score, "keyword"));
            }
        }

        return scoredBooks;
    }

    private List<ScoredBook> scoreByEmbedding(List<BookSemanticIndex> indices, 
                                               ParsedConstraints constraints) {
        List<ScoredBook> keywordScored = scoreByKeyword(indices, constraints);
        
        for (ScoredBook sb : keywordScored) {
            BookSemanticIndex index = sb.getIndex();
            if (index.getEmbeddingVector() != null && !index.getEmbeddingVector().isEmpty()) {
                double embeddingScore = calculateEmbeddingSimilarity(index, constraints);
                double finalScore = 0.6 * embeddingScore + 0.4 * sb.getScore();
                sb.setScore(finalScore);
                sb.setSearchMode("hybrid");
            }
        }

        return keywordScored;
    }

    private double calculateEmbeddingSimilarity(BookSemanticIndex index, 
                                                 ParsedConstraints constraints) {
        String embeddingJson = index.getEmbeddingVector();
        if (embeddingJson == null || embeddingJson.isEmpty()) {
            return 0.0;
        }

        List<Double> bookVector = parseEmbeddingVector(embeddingJson);
        List<Double> queryVector = generateQueryEmbedding(constraints);

        return cosineSimilarity(bookVector, queryVector);
    }

    private List<Double> parseEmbeddingVector(String json) {
        try {
            json = json.trim();
            if (json.startsWith("[") && json.endsWith("]")) {
                json = json.substring(1, json.length() - 1);
            }
            String[] parts = json.split(",");
            List<Double> vector = new ArrayList<>();
            for (String part : parts) {
                vector.add(Double.parseDouble(part.trim()));
            }
            return vector;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<Double> generateQueryEmbedding(ParsedConstraints constraints) {
        List<String> allTerms = new ArrayList<>();
        if (constraints.getGenres() != null) {
            allTerms.addAll(constraints.getGenres());
        }
        if (constraints.getAudiences() != null) {
            allTerms.addAll(constraints.getAudiences());
        }
        if (constraints.getStyles() != null) {
            allTerms.addAll(constraints.getStyles());
        }
        if (constraints.getKeywords() != null) {
            allTerms.addAll(constraints.getKeywords());
        }

        int dimension = 128;
        List<Double> vector = new ArrayList<>(dimension);
        for (int i = 0; i < dimension; i++) {
            double hash = 0;
            for (String term : allTerms) {
                hash += (term.hashCode() * (i + 1)) % 1000 / 1000.0;
            }
            vector.add(Math.sin(hash) * 0.5 + 0.5);
        }
        return vector;
    }

    private double cosineSimilarity(List<Double> v1, List<Double> v2) {
        if (v1 == null || v2 == null || v1.size() != v2.size() || v1.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;

        for (int i = 0; i < v1.size(); i++) {
            double d1 = v1.get(i);
            double d2 = v2.get(i);
            dotProduct += d1 * d2;
            norm1 += d1 * d1;
            norm2 += d2 * d2;
        }

        if (norm1 == 0 || norm2 == 0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    private List<RecommendResult> buildRecommendResults(List<ScoredBook> scoredBooks,
                                                        ParsedConstraints constraints,
                                                        String searchMode) {
        List<RecommendResult> results = new ArrayList<>();

        for (ScoredBook sb : scoredBooks) {
            RecommendResult result = new RecommendResult();
            Book book = sb.getBook();
            
            result.setBookId(book.getId());
            result.setTitle(book.getTitle());
            result.setAuthor(book.getAuthor());
            result.setPrice(book.getPrice());
            result.setDescription(book.getDescription());
            result.setPublishDate(book.getPublishDate() != null ? 
                    book.getPublishDate().toString() : null);
            result.setScore(Math.round(sb.getScore() * 10000) / 100.0);
            result.setSearchMode(sb.getSearchMode());

            String reason = reasonService.generateReason(book, sb.getIndex(), constraints, sb.getScore());
            result.setReason(reason);

            List<String> matchedConstraints = reasonService.getMatchedConstraints(sb.getIndex(), constraints);
            result.setMatchedConstraints(String.join(", ", matchedConstraints));

            results.add(result);
        }

        return results;
    }

    private List<String> parseTags(String tagString) {
        if (tagString == null || tagString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(tagString.split(","));
    }

    public ParsedConstraints parseQuery(String query) {
        return constraintParserService.parse(query);
    }

    public static class ScoredBook {
        private Book book;
        private BookSemanticIndex index;
        private double score;
        private String searchMode;

        public ScoredBook(Book book, BookSemanticIndex index, double score, String searchMode) {
            this.book = book;
            this.index = index;
            this.score = score;
            this.searchMode = searchMode;
        }

        public Book getBook() { return book; }
        public BookSemanticIndex getIndex() { return index; }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public String getSearchMode() { return searchMode; }
        public void setSearchMode(String searchMode) { this.searchMode = searchMode; }
    }
}

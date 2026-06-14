package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.ParsedConstraints;
import com.example.book.dto.RecommendRequest;
import com.example.book.dto.RecommendResponse;
import com.example.book.dto.RecommendResult;
import com.example.book.service.SemanticIndexService;
import com.example.book.service.SemanticSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
public class RecommendController {

    @Autowired
    private SemanticSearchService semanticSearchService;

    @Autowired
    private SemanticIndexService semanticIndexService;

    @PostMapping("/search")
    public Result<RecommendResponse> search(@RequestBody RecommendRequest request) {
        long startTime = System.currentTimeMillis();

        String query = request.getQuery();
        if (query == null || query.trim().isEmpty()) {
            return Result.error("请输入您的需求描述");
        }

        if (query.length() > 500) {
            return Result.error("输入内容过长，请精简后重试");
        }

        int limit = request.getLimit() != null ? request.getLimit() : 10;
        if (limit < 1) limit = 1;
        if (limit > 50) limit = 50;

        String mode = request.getMode();

        ParsedConstraints parsedConstraints = semanticSearchService.parseQuery(query);

        List<RecommendResult> results = semanticSearchService.search(query, limit, mode);

        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;

        RecommendResponse response = new RecommendResponse();
        response.setResults(results);
        response.setParsedConstraints(parsedConstraints);
        response.setSearchMode(results.isEmpty() ? "keyword" : 
                (results.size() > 0 ? results.get(0).getSearchMode() : "keyword"));
        response.setTotalCount((long) results.size());
        response.setProcessingTime(processingTime + "ms");

        if (results.isEmpty()) {
            boolean hasConstraints = !parsedConstraints.getGenres().isEmpty() || 
                                     !parsedConstraints.getAudiences().isEmpty() || 
                                     !parsedConstraints.getStyles().isEmpty();
            if (hasConstraints) {
                response.setMessage("未找到完全匹配的图书，您可以尝试调整需求描述");
            } else {
                response.setMessage("未找到相关图书，您可以尝试更具体的描述");
            }
        } else {
            response.setMessage("为您找到 " + results.size() + " 本相关图书");
        }

        return Result.success(response);
    }

    @PostMapping("/parse")
    public Result<ParsedConstraints> parseQuery(@RequestBody RecommendRequest request) {
        String query = request.getQuery();
        if (query == null || query.trim().isEmpty()) {
            return Result.error("请输入要解析的文本");
        }

        ParsedConstraints constraints = semanticSearchService.parseQuery(query);
        return Result.success(constraints);
    }

    @PostMapping("/index/rebuild/{bookId}")
    public Result<Void> rebuildIndex(@PathVariable Long bookId) {
        semanticIndexService.rebuildIndexForBook(bookId);
        return Result.success(null);
    }

    @PostMapping("/index/rebuild/all")
    public Result<Void> rebuildAllIndices() {
        semanticIndexService.buildIndexForAllBooks();
        return Result.success(null);
    }
}

package com.innovaura.modules.marketplace.controller;

import com.innovaura.modules.marketplace.dto.MarketplaceDetailResponse;
import com.innovaura.modules.marketplace.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    @Autowired
    private MarketplaceService marketplaceService;

    @GetMapping
    public ResponseEntity<Object> browse(
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) BigDecimal minFunding,
            @RequestParam(required = false) BigDecimal maxFunding,
            @RequestParam(required = false) BigDecimal minEquity,
            @RequestParam(required = false) BigDecimal maxEquity,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize
    ) {
        Object response = marketplaceService.browse(
                industry, category, department, minFunding, maxFunding, minEquity, maxEquity, sortBy, search, page, pageSize
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Object> search(@RequestParam(required = false) String q) {
        Object response = marketplaceService.browse(
                null, null, null, null, null, null, null, "recent", q, null, null
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{proposalId}")
    public ResponseEntity<MarketplaceDetailResponse> getDetails(@PathVariable Integer proposalId) {
        MarketplaceDetailResponse response = marketplaceService.getDetails(proposalId);
        return ResponseEntity.ok(response);
    }
}

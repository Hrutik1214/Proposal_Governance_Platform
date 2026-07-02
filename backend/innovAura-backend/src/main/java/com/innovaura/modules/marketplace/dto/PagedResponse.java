package com.innovaura.modules.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> items;
    private int currentPage;
    private int pageSize;
    private int totalPages;
    private long totalCount;
    private boolean hasNext;
    private boolean hasPrevious;
}

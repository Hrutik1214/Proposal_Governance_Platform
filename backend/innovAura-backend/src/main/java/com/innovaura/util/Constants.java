package com.innovaura.util;

public final class Constants {

    private Constants() {
        // Restrict instantiation
    }

    public static final String APP_NAME = "InnovAura";
    public static final String API_VERSION = "v1";

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";
}

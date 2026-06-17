package com.innovaura;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class InnovAuraApplication {

    public static void main(String[] args) {
        SpringApplication.run(InnovAuraApplication.class, args);
    }
}

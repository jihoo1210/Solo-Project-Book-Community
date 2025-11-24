package com.example.backend.controller.utilities;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheck {
    @GetMapping("/healthcheck")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok().build();
    }
}

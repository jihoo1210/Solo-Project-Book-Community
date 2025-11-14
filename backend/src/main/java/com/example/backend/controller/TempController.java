package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.temp.PasswordResetRequest;
import com.example.backend.service.TempService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/temp")
public class TempController {

    private final TempService service;

    @PatchMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest dto, BindingResult bindingResult) {
        try {
            log.info("PasswordResetRequest: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다");

            service.resetPassword(dto.getEmail(), dto.getPassword());
            return ResponseController.success(null);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}

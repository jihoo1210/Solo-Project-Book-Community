package com.example.demo.controller;

import com.example.demo.dto.ResponseDto;
import com.example.demo.dto.user.ShowUserResponse;
import com.example.demo.dto.user.UpdateUserRequest;
import com.example.demo.dto.user.UpdateUserResponse;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService service;

    @GetMapping("/detail")
    public ResponseEntity<?> show(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            ShowUserResponse responseDto = service.find(userDetails.getUsername());
            ResponseDto response = ResponseDto.<ShowUserResponse>builder().result(responseDto).build();
            return ResponseEntity.ok().body(response);
        } catch (Exception ex) {
            log.error(ex.getMessage());
            ResponseDto response = ResponseDto.builder().error(ex.getMessage()).build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PatchMapping("/update")
    public ResponseEntity<?> update(@Valid @RequestBody UpdateUserRequest dto, BindingResult bindingResult) {
        try {
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            UpdateUserResponse responseDto = service.update(dto);
            ResponseDto response = ResponseDto.<UpdateUserResponse>builder().result(responseDto).build();
            return ResponseEntity.ok().body(response);
        } catch (Exception ex) {
            log.error(ex.getMessage());
            ResponseDto response = ResponseDto.builder().error(ex.getMessage()).build();
            return ResponseEntity.badRequest().body(response);
        }
    }
}

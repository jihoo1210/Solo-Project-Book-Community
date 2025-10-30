package com.example.demo.controller;

import com.example.demo.dto.ResponseDto;
import com.example.demo.dto.auth.SigninRequest;
import com.example.demo.dto.auth.SigninResponse;
import com.example.demo.dto.auth.SignupRequest;
import com.example.demo.dto.auth.SignupResponse;
import com.example.demo.security.CustomUserDetailService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.security.JwtUtils;
import com.example.demo.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailService userDetailService;
    private final JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<?> create(@Valid @RequestBody SignupRequest dto, BindingResult bindingResult) {
        try {
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            SignupResponse responseDto = authService.create(dto);
            ResponseDto response = ResponseDto.<SignupResponse>builder().result(responseDto).build();
            return ResponseEntity.ok().body(response);

        } catch (Exception ex) {
            log.error(ex.getMessage());
            ResponseDto response = ResponseDto.builder().error(ex.getMessage()).build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> create(@Valid @RequestBody SigninRequest dto, BindingResult bindingResult) {
        try {
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) userDetailService.loadUserByUsername(dto.getUsername());

            String token = jwtUtils.createToken(userDetails);
            SigninResponse responseDto = SigninResponse.builder().token(token).build();

            ResponseDto response = ResponseDto.<SigninResponse>builder().result(responseDto).build();
            return ResponseEntity.ok().body(response);
        } catch (Exception ex) {
            log.error(ex.getMessage());
            ResponseDto response = ResponseDto.builder().error(ex.getMessage()).build();
            return ResponseEntity.badRequest().body(response);
        }
    }
}

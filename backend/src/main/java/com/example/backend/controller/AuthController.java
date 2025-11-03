/**
 * 인증(Authentication) 관련 HTTP 요청을 처리하는 컨트롤러.
 * 회원가입, 로그인 등의 엔드포인트를 제공합니다.
 */

package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.auth.signin.SigninRequest;
import com.example.backend.dto.auth.signin.SigninResponse;
import com.example.backend.dto.auth.signup.SignupRequest;
import com.example.backend.dto.auth.signup.SignupResponse;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.security.CustomUserDetailsService;
import com.example.backend.security.TokenProvider;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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

    private final UserService service;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final TokenProvider tokenProvider;

    /**
     * [POST] /auth/signup 엔드포인트: 사용자 회원가입 요청을 처리합니다.
     * @param dto 회원가입 정보를 담은 요청 본문. @Valid를 통해 유효성 검사를 수행합니다.
     * @param bindingResult @Valid 검사 결과를 담고 있는 객체
     * @return 성공 시 200 OK와 회원가입 응답 데이터를, 실패 시 400 Bad Request와 에러 메시지를 반환합니다.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest dto, BindingResult bindingResult) {
        try {
            log.info("SignupRequest: {}", dto);

            // 1. DTO 유효성 검사 (Validation)
            // @Valid를 통해 DTO 검사 후, BindingResult에 오류가 있는지 확인합니다.
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");

            // 2. 서비스 로직 호출 및 회원가입 처리
            SignupResponse responseDto = service.signup(dto);

            // 3. 성공 응답 반환
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            // 4. 예외 처리
            log.warn("Exception: {}", e.getMessage());

            // 실패 응답 반환
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * [POST] /auth/signin 엔드포인트: 사용자 로그인 요청을 처리하고 JWT를 발급합니다.
     * @param dto 로그인 정보를 담은 요청 본문 (이메일, 비밀번호).
     * @param bindingResult @Valid 검사 결과를 담고 있는 객체
     * @return 성공 시 200 OK와 JWT가 포함된 응답 DTO를, 실패 시 400 Bad Request와 에러 메시지를 반환합니다.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody SigninRequest dto, BindingResult bindingResult) {
        try {
            log.info("SigninRequest: {}", dto);

            // 1. DTO 유효성 검사 (Validation)
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("형식이 올바르지 않습니다");

            // 2. 인증 시도 (Authentication)
            // AuthenticationManager를 사용하여 사용자 ID/PW 인증을 시도합니다.
            // 성공하면 내부적으로 CustomUserDetailsService가 호출되어 DB와 비밀번호를 비교합니다.
            // 실패 시 AuthenticationException이 발생합니다.
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );

            // 3. 사용자 정보 로드
            // 인증에 성공하면, 토큰 발급을 위해 DB에서 사용자 정보를 다시 로드합니다.
            // 반환되는 객체는 UserDetails의 구현체인 CustomUserDetails입니다
            CustomUserDetails customUserDetails = (CustomUserDetails) customUserDetailsService.loadUserByUsername(dto.getEmail());

            // 4. JWT 토큰 발급
            // 로드된 사용자 정보를 기반으로 JWT 토큰을 생성합니다.
            String token = tokenProvider.tokenProvide(customUserDetails);

            // 5. 응답 DTO 구성
            SigninResponse responseDto = SigninResponse.builder()
                    .username(service.findUsernameByEmail(dto.getEmail()))
                    .token(token)
                    .build();

            // 6. 성공 응답 반환
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            log.warn("Signin failed: {}", e.getMessage());

            // 실패 응답 반환
            return ResponseController.fail(e.getMessage());
        }
    }
}

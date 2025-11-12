/**
 * 인증(Authentication) 관련 HTTP 요청을 처리하는 컨트롤러.
 * 회원가입, 로그인 등의 엔드포인트를 제공합니다.
 */

package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.auth.CheckEmailRequest;
import com.example.backend.dto.auth.CheckEmailResponse;
import com.example.backend.dto.auth.CheckUsernameResponse;
import com.example.backend.dto.auth.UsernameResponse;
import com.example.backend.dto.auth.signin.SigninRequest;
import com.example.backend.dto.auth.signin.SigninResponse;
import com.example.backend.dto.auth.signup.SignupRequest;
import com.example.backend.dto.auth.signup.SignupResponse;
import com.example.backend.dto.auth.verify.VerifyCodeRequest;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.security.CustomUserDetailsService;
import com.example.backend.security.TokenProvider;
import com.example.backend.service.EmailService;
import com.example.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService service;
    private final EmailService emailService;
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

            // 5. 실패 응답 반환
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
    public ResponseEntity<?> signin(HttpServletResponse response, @Valid @RequestBody SigninRequest dto, BindingResult bindingResult) {
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

            // 5. 화면 표시용 username 가져오기
            String username = customUserDetails.getUser().getUsername();

            // 6. JWT를 HttpOnly 쿠키로 설정 (가장 중요)
            long maxAgeSeconds = tokenProvider.getExpiration() / 1000; // 밀리초를 초로 변환

            Cookie cookie = new Cookie("ACCESS_TOKEN", token);
            cookie.setHttpOnly(true); // JavaScript 접근 불가
            // cookie.setSecure(true); // 운영 환경(HTTPS)에서는 주석 해제 필수
            cookie.setPath("/");
            cookie.setMaxAge((int) maxAgeSeconds);

            response.addCookie(cookie); // HTTP 응답에 쿠키를 추가

            SigninResponse responseDto = SigninResponse.builder()
                    .username(username)
                    .build();

            return ResponseController.success(responseDto);
        } catch (Exception e) {
            log.warn("Signin failed: {}", e.getMessage());

            // 실패 응답 반환
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * POST /auth/logout
     * HttpOnly 쿠키 삭제 (세션 만료)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // 1. 기존 JWT 쿠키를 덮어쓰고 만료 시간을 0으로 설정하여 삭제
        Cookie cookie = new Cookie("ACCESS_TOKEN", null);
        cookie.setHttpOnly(true);
        // cookie.setSecure(true); // 운영 환경에서는 주석 해제 필수
        cookie.setPath("/");
        cookie.setMaxAge(0); // 만료 시간을 0으로 설정하여 즉시 삭제

        response.addCookie(cookie);

        return ResponseController.success("로그아웃 되었습니다.");
    }

    /**
     * 이메일 중복 확인 및 인증 코드 전송
     * @param dto 사용자 이메일 정보
     * @param bindingResult 유효성 확인
     * @return 이메일 사용 가능 boolean 값
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@Valid @ModelAttribute CheckEmailRequest dto, BindingResult bindingResult) {
        try {
            log.info("dto: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("이메일 형식을 확인해주세요.");

            String email = dto.getEmail();

            if(!StringUtils.hasText(email)) throw new IllegalArgumentException("형식이 올바르지 않습니다");

            // 1. 이메일 중복 검사
            CheckEmailResponse responseDto = service.isEmailAvailable(email);
            if(!responseDto.isAvailable()) throw new IllegalArgumentException("동일한 이메일로 가입한 계정이 존재합니다.");

            // 2. 이메일로 코드 전송
            emailService.sendAuthCode(email);

            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @GetMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@Valid @ModelAttribute VerifyCodeRequest dto, BindingResult bindingResult) {
        try {
            boolean verified = emailService.verifyAuthCode(dto.getEmail(), dto.getCode());

            if(verified) {
                return ResponseEntity.ok().build();
            }
            throw new IllegalArgumentException("인증 코드가 유효하지 않습니다.");
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        try {
            log.info("username: {}", username);

            if(!StringUtils.hasText(username)) {
                throw new IllegalArgumentException("형식이 올바르지 않습니다");
            }
            
            // 1. 회원명 중복 검사
            CheckUsernameResponse responseDto = service.isUsernameAvailable(username);
            
            // 2. 성공 응답 반환
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            // 3. 예외 처리
            log.warn("Exception: {}", e.getMessage());
            
            // 4. 실패 응답 반환
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * GET /auth/me
     * 쿠키의 유효성을 검사하고 현재 인증된 사용자 정보를 반환 (프론트엔드 AuthContext에서 사용)
     * 이 API는 SecurityConfig에 의해 인증이 필요하도록 설정되어야 합니다.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {

        if(userDetails == null) return ResponseController.fail("인증 정보가 유효하지 않습니다.");

        String username = userDetails.getUser().getUsername();

        UsernameResponse userResponse = new UsernameResponse(username);

        return ResponseController.success(userResponse); // 응답 본문에 닉네임만 전달
    }
}

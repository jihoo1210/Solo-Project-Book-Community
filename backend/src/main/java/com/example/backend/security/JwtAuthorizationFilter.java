/**
 * JWT 기반 인증을 위해 모든 요청에 대해 실행되는 필터.
 * HTTP 요청 헤더에서 JWT 토큰을 추출하고, 토큰을 검증하여
 * 유효한 경우 Security Context에 인증 정보를 설정합니다.
 */

package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * HTTP 요청이 들어올 때마다 실행되는 필터 로직.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. HTTP 요청 헤더에서 Bearer 토큰을 파싱하여 JWT를 추출합니다.
            String token = parseBearerToken(request);
            log.info("token: {}", token);
            // 2. 토큰이 존재하고 내용이 있는 경우에만 검증을 진행합니다.
            if(StringUtils.hasText(token)) {
                // 3. TokenProvider를 사용하여 토큰을 검증하고 사용자 이름(PostsSubject)을 추출합니다.
                String username = tokenProvider.validateAndGetUsername(token);

                // 4. 추출된 사용자 이름으로 DB에서 UserDetails 객체를 로드합니다.
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                // 5. 로드된 UserDetails를 기반으로 Spring Security의 인증 객체를 생성합니다.
                // - 첫 번째 인자: 인증 주체 (Principal)로 UserDetails 객체를 사용합니다.
                // - 두 번째 인자: 자격 증명 (Credentials)은 JWT 인증에서는 null로 설정합니다.
                // - 세 번째 인자: 사용자의 권한 (Authorities)을 설정합니다.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // 6. 현재 요청의 세부 정보(IP 주소, 세션 ID 등)를 인증 객체에 설정합니다.
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Security Context에 최종 인증 객체를 설정합니다.
                // 이 시점부터 해당 요청은 인증된 상태로 간주됩니다.
                SecurityContextHolder.getContext().setAuthentication(authentication);

            }
        } catch (Exception e) {
            log.error("Can not set user authorization in security context: {}", e.getMessage());
        }
        // 필터 체인의 다음 필터로 요청을 넘깁니다.
        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청 쿠키에서 'ACCESS_TOKEN'이라는 이름의 토큰을 추출합니다.
     */
    private String parseBearerToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        // 'ACCESS_TOKEN' 이름의 쿠키를 찾아 값을 반환합니다.
        return Arrays.stream(cookies)
                .filter(cookie -> "ACCESS_TOKEN".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}

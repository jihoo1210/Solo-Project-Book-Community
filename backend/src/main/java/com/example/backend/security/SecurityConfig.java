/**
 * Spring Security의 핵심 설정 클래스입니다.
 * JWT 기반의 인증 방식을 적용하고, 애플리케이션의 보안 정책(인가 규칙)을 정의합니다.
 */

package com.example.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.filter.CorsFilter;

@RequiredArgsConstructor
@EnableWebSecurity // Spring Security 기능을 활성화하고 웹 보안 설정을 구성할 수 있도록 합니다.
@Configuration // 이 클래스를 스프링 설정(Configuration) 클래스로 등록합니다.
public class SecurityConfig {

    private final JwtAuthorizationFilter jwtAuthorizationFilter;

    /**
     * 비밀번호 암호화를 위한 BCryptPasswordEncoder 빈을 등록합니다.
     * @return BCrypt 해싱 알고리즘을 사용하는 PasswordEncoder 구현체
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Spring Security의 인증 관리자(AuthenticationManager) 빈을 등록합니다.
     * AuthenticationConfiguration을 통해 기존 설정을 가져와 사용합니다.
     * @param configuration 인증 설정을 담고 있는 객체
     * @return 설정된 AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * HTTP 보안 설정을 구성하고 SecurityFilterChain 빈을 생성합니다.
     * @param http HttpSecurity 객체 (보안 설정 빌더)
     * @return 구성된 SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. 보안 설정 비활성화
                // CSRF(Cross-Site Request Forgery) 보호 기능을 비활성화합니다. (REST API + JWT 사용 시)
                .csrf(AbstractHttpConfigurer::disable)
                // CORS(Cross-Origin Resource Sharing) 설정을 기본값으로 활성화합니다.
                .cors(Customizer.withDefaults())
                // 폼 기반 로그인(세션 기반) 기능을 비활성화합니다. (JWT 인증 사용)
                .formLogin(AbstractHttpConfigurer::disable)
                // HTTP Basic 인증(아이디/비밀번호를 헤더에 담는 방식)을 비활성화합니다. (JWT 인증 사용)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 2. 세션 관리 설정
                // 세션 생성 정책을 STATELESS(상태 없음)로 설정합니다. (JWT는 토큰으로 인증하므로 서버는 상태를 저장하지 않습니다.)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 3. 헤더 설정
                // X-Frame-Options 헤더를 sameOrigin으로 설정하여 같은 출처의 프레임 허용 (H2 Console 사용을 위함)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))

                // 4. 요청별 인가(권한) 규칙 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/posts").permitAll()
                        // "/auth/**" (인증/인가 관련 API)와 "/h2-console/**" 경로에 대한 접근은 모두 허용합니다.
                        .requestMatchers("/auth/**", "/h2-console/**").permitAll()
                        // "/admin/**" 경로는 "ADMIN" 권한을 가진 사용자만 접근 가능합니다. (권한명에는 "ROLE_" 접두사가 자동으로 붙습니다.)
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // "/temp" 경로는 "TEMP" 권한을 가진 사용자만 접근 가능합니다.
                        .requestMatchers("/temp").hasRole("TEMP")
                        // 위의 규칙에 해당하지 않는 나머지 모든 요청은 "USER" 권한을 가진 사용자만 접근 가능하도록 설정합니다.
                        .anyRequest().hasRole("USER"))

                // 5. 커스텀 필터 추가
                // CorsFilter 이후에 JwtAuthorizationFilter를 추가하여, 모든 요청에 대해 토큰을 검증하고 인증 처리하도록 합니다.
                .addFilterAfter(
                        jwtAuthorizationFilter, CorsFilter.class
                );

        return http.build(); // 설정 내용을 바탕으로 SecurityFilterChain을 생성하여 반환합니다.
    }

}
/**
 * Spring MVC 설정을 커스터마이징 하기 위한 클래스.
 * WebMvcConfigurer 인터페이스를 구현하여 CORS 설정을 정의합니다.
 */

package com.example.backend.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * CORS (Cross-Origin Resource Sharing) 설정을 추가합니다.
     * 다른 도메인이나 포트에서 오는 요청을 허용하기 위해 사용됩니다.
     * @param registry CORS 매핑을 등록하는 객체
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
                // 1. 매핑 경로 설정: 모든 경로 ("/**")에 대해 CORS 설정을 적용합니다.
                .addMapping("/**")
                // 2. 허용할 출처(Origin) 설정:
                // 요청을 허용할 특정 도메인(여기서는 로컬 개발 환경의 프런트엔드 주소)을 명시합니다.
                .allowedOrigins("http://localhost:3000")
                // 3. 허용할 HTTP 메서드 설정:
                // 클라이언트가 사용할 수 있는 HTTP 메서드 목록을 허용합니다.
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                // 4. 허용할 HTTP 헤더 설정:
                // 모든 종류의 HTTP 요청 헤더를 허용합니다.
                .allowedHeaders("*")
                // 5. 인증 정보 허용:
                // 쿠키나 인증 헤더(Authorization)와 같은 인증 정보(Credentials)를 요청에 담아 보낼 수 있도록 허용합니다.
                .allowCredentials(true)
                // 6. Pre-flight 요청 캐시 시간:
                // Pre-flight (OPTIONS) 요청 결과를 3600초(1시간) 동안 캐시하도록 설정합니다.
                .maxAge(3600);
    }

}

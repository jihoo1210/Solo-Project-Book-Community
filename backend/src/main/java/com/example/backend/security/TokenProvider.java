/**
 * JWT 토큰의 생성, 만료 시간 설정 및 토큰 유효성 검증을 담당하는 클래스.
 * Spring Security와 함께 사용하여 인증/인가 과정에서 토큰을 처리합니다.
 */

package com.example.backend.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class TokenProvider {

    private final SecretKey key; // 서명에 사용될 키

    @Getter
    private final long expiration; // 토큰의 만료 시간

    /**
     * 환경 설정 파일 에서 JWT 관련 설정 값을 주입받아 초기화합니다.
     *
     * @param secretKey 환경 설정에서 주입받은 Base64 인코딩된 비밀 키 문자열
     * @param expirationTime 환경 설정에서 주입받은 토큰 만료 시간 (밀리초)
     */
    public TokenProvider(@Value("${jwt.secret}") String secretKey,
                         @Value("${jwt.expiration}") long expirationTime) {
        // Base64 인코딩된 비밀 키를 디코딩합니다.
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        // 디코딩된 바이트 배열을 사용하여 HMAC SHA 키를 생성합니다.
        this.key = Keys.hmacShaKeyFor(keyBytes);
        // 토큰 만료 시간을 설정합니다.
        this.expiration = expirationTime;
    }

    /**
     * 사용자 정보(UserDetails)를 기반으로 JWT를 생성합니다.
     *
     * @param userDetails 인증된 사용자의 세부 정보
     * @return 생성된 JWT 문자열
     */
    public String tokenProvide(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, Jwts.SIG.HS256) // HS256 알고리즘과 비밀 키로 서명합니다.
                .compact(); // 토큰을 문자열로 압축(생성)합니다.
    }

    /**
     * 주어진 JWT 토큰을 검증하고 토큰에 담긴 사용자 이름(subject)을 추출합니다.
     *
     * @param token 검증할 JWT 문자열
     * @return 유효한 경우, 토큰의 subject
     * @return 유효하지 않거나 파싱에 실패한 경우 에러
     */
    public String validateAndGetUsername(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key) // 토큰 생성 시 사용된 것과 동일한 키로 서명을 검증합니다.
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            log.error("Can not parse JWT: {}", e.getMessage());
        }
        throw new JwtException("Invalid JWT token");
    }
}

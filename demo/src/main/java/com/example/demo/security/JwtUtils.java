package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtUtils {

    private final SecretKey key;
    private final long expiration;

    public JwtUtils(@Value("${jwt.secret}") String secretKey,
                    @Value("${jwt.expiration}") long expirationTime) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expiration = expirationTime;
    }

    /**
     * JWT 생성
     * @return HS256으로 암호화한 key로 토큰을 생성한다
     */
    public String createToken(UserDetails userDetails) {
        log.info("userDetails: {}", userDetails);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * 토큰에서 클레임 추출
     */
    public Claims extractClaim(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        throw new JwtException("Invalid JWT token");
    }

    /**
     * 토큰에서 사용자 이름 추출
     */
    public String extractUsername(String token) {
        return extractClaim(token).getSubject();
    }

    /**
     * 토큰 유효성 검증
     * 토큰의 서명, 구조, 만료 여부 확인
     */
    public boolean validateToken(String token) {
        try {
            extractClaim(token);
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}

package com.example.backend.security;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class AuthCodeGenerator {

    // 숫자만 (나중에 문자 추가 가능)
    private final String CHARACTERS = "0123456789";
    // 여섯 자리
    private final int CODE_LENGTH = 6;
    private final SecureRandom RANDOM = new SecureRandom();

    public String generateCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for(int i = 0; i < 6; i++) {
            // 1 ~ 10 무작위 수
            int radomIndex = RANDOM.nextInt(CHARACTERS.length());
            // 무작위 수 추가
            code.append(CHARACTERS.charAt(radomIndex));
        }
        return code.toString();
    }
}

package com.example.backend.service;

import com.example.backend.security.AuthCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@RequiredArgsConstructor
@Service
public class EmailService {

    private final AuthCodeGenerator authCodeGenerator;
    private final JavaMailSender mailSender;
    private final StringRedisTemplate redisTemplate;

    // 인증 코드 유효 시간
    private static final Duration AUTH_CODE_EXPIRATION_TIME = Duration.ofMinutes(5);

    /**
     * Redis에 저장한 후 이메일로 인증 코드를 전송합니다.
     * @param email
     * @return 인증 코드
     */
    public String sendAuthCode(String email) {
        String authCode = authCodeGenerator.generateCode();

        // 1. Redis에 <이메일, 코드> 저장
        // Redis key: "AuthCode" + email
        redisTemplate.opsForValue().set(
                "AuthCode:" + email,
                authCode,
                AUTH_CODE_EXPIRATION_TIME
        );

        // 2. 이메일 내용 구성 및 전송
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email); // 수신자
        message.setSubject("BBBB 회원가입 인증 코드입니다."); // 제목
        String text = String.format(
                "당신의 가입을 환영합니다. [%s] 해당 인증코드를 인증코드 작성 란에 입력해주세요.",
                authCode
        );
        message.setText(text); // 본문
        mailSender.send(message); // 전송

        return authCode; // 인증을 위해 전송된 인증 코드 리턴
    }

    public boolean verifyAuthCode(String email, String code) {
        String redisKey = "AuthCode:" + email;
        String storedCode = redisTemplate.opsForValue().get(redisKey);

        // 코드가 없거나 만료됨
        if(storedCode == null) {
            return false;
        }
        if(storedCode.equals(code)) {
            // 인증 성공: Redis에서 코드 삭제(재사용 방지)
            redisTemplate.delete(redisKey);
            return true;
        }
        // 일치하지 않을 경우
        return false;
    }
}

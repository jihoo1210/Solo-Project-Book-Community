package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.backend.entity.utilities.Role.ROLE_USER;

@Slf4j
@RequiredArgsConstructor
@Service
public class TempService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    /**
     * 비밀번호 재성절 메서드
     * @param email 이메일 - 회원 조회용
     * @param password 새 비밀번호
     */
    @Transactional
    public void resetPassword(String email, String password) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        user.setPassword(encoder.encode(password));
        user.setAuthority(ROLE_USER);
        log.info("user: {}", user);
    }
}

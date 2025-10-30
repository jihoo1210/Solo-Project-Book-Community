package com.example.demo.service;

import com.example.demo.dto.auth.SignupRequest;
import com.example.demo.dto.auth.SignupResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static com.example.demo.entity.Role.ROLE_USER;

@RequiredArgsConstructor
@Slf4j
@Service
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    public SignupResponse create(SignupRequest dto) throws Exception {
        log.info("dto: {}", dto);
        if(!repository.existsByEmail(dto.getEmail()) && !repository.existsByUsername(dto.getUsername())) {
            User user = User.builder()
                    .email(dto.getEmail())
                    .username(dto.getUsername())
                    .password(encoder.encode(dto.getPassword()))
                    .role(ROLE_USER)
                    .build();
            User response = repository.save(user);
            return SignupResponse.builder()
                    .email(response.getEmail())
                    .build();
        }
        if(repository.existsByEmail(dto.getEmail()) && repository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("동일한 이메일과 아이디로 가입한 계정이 이미 존재합니다");
        } else if (repository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("동일한 아이디로 가입한 계정이 이미 존재합니다");
        } else if (repository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("동일한 이메일로 가입한 계정이 이미 존재합니다");
        }
        throw new Exception("알 수 없는 오류 발생");
    }
}

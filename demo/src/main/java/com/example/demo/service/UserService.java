package com.example.demo.service;

import com.example.demo.dto.user.ShowUserResponse;
import com.example.demo.dto.user.UpdateUserRequest;
import com.example.demo.dto.user.UpdateUserResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;


    public UpdateUserResponse update(UpdateUserRequest dto) {
        User user = repository.findByUsername(dto.getUsername()).orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));
        log.info("user: {}", user);
        if(dto.getUsername() != null) user.setUsername(dto.getUsername());
        if(dto.getPassword() != null) user.setPassword(encoder.encode(dto.getPassword()));
        log.info("updated user: {}", user);
        return UpdateUserResponse.builder()
                .username(user.getUsername())
                .build();
    }

    public ShowUserResponse find(String username) {
        User user = repository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));
        log.info("user: {}", user);
        return ShowUserResponse.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }
}

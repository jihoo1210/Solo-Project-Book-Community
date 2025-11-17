package com.example.backend.web;

import com.example.backend.dto.auth.signup.SignupRequest;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;

    @Override
    public void run(String... args) throws Exception {
        {
            SignupRequest dto = SignupRequest.builder()
                    .email("jihoostudy1@gmail.com")
                    .username("DEV_ADMIN_USER")
                    .password("password")
                    .build();
            userService.signup(dto);
        }

        {
            SignupRequest dto = SignupRequest.builder()
                    .email("hello@world.com")
                    .username("DEV_TEST_USER")
                    .password("password")
                    .build();
            userService.signup(dto);
        }
    }
}

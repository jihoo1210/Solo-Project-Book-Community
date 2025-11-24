package com.example.backend.web;

import com.example.backend.dto.auth.signup.SignupRequest;
import com.example.backend.entity.utilities.Role;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final UserRepository userRepository;


    @Transactional
    @Override
    public void run(String... args) throws Exception {
        {
            String email = "jihoostudy1@gmail.com";
            if(!userRepository.existsByEmail(email)) {
                SignupRequest dto = SignupRequest.builder()
                        .email(email)
                        .username("DEV_ADMIN_USER")
                        .password("password")
                        .build();
                userService.signup(dto);

                userRepository.findByEmail(email).ifPresent(admin -> admin.setAuthority(Role.ROLE_ADMIN));
            }
        }

        {
            String email = "hello@world.com";
            if(!userRepository.existsByEmail(email))  {
                SignupRequest dto = SignupRequest.builder()
                        .email(email)
                        .username("DEV_TEST_USER")
                        .password("password")
                        .build();

                userService.signup(dto);
            }
        }
    }
}

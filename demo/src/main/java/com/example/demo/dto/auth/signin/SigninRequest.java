package com.example.demo.dto.auth.signin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class SigninRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}

package com.example.backend.dto.auth.signup;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class SignupRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String username;

    @NotBlank
    @Size(min = 8)
    private String password;
}

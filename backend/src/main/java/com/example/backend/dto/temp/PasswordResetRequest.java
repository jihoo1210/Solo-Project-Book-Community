package com.example.backend.dto.temp;

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
public class PasswordResetRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}

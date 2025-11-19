package com.example.backend.entity.utilities;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Role {
    ROLE_ADMIN("관리자"),
    ROLE_USER("회원"),
    ROLE_TEMP("임시");

    @Getter
    private final String role;
}

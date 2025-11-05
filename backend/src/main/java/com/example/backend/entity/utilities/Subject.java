package com.example.backend.entity.utilities;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Subject {
    RECRUIT("모집"),
    QUESTION("질문"),
    SHARE("공유");

    private final String subject;
}

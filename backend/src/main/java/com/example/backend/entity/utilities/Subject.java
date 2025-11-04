package com.example.backend.entity.utilities;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Subject {
    RECURIT("모집"),
    QUESTION("질문"),
    SHARE("공유");

    private final String subject;

}

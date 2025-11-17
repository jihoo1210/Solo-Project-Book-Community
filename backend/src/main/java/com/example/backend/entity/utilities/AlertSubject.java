package com.example.backend.entity.utilities;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum AlertSubject {
    COMMENT("댓글"),
    ADOPTED("채택"),
    APPLICATION("신청"),
    APPROVAL("승인"),
    REJECTED("거절"),
    DEADLINE("마감");

    @Getter
    private final String subject;
}

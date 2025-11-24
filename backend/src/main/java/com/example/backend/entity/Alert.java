package com.example.backend.entity;

import com.example.backend.entity.utilities.AlertSubject;
import com.example.backend.entity.utilities.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter

@Entity
public class Alert extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * COMMENT("댓글"),
     * ADOPTED("채택"),
     * APPLICATION("신청"),
     * APPROVAL("승인"),
     * REJECTED("거절"),
     */
    @Column
    private AlertSubject subject;

    // 게시글 작성자
    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User user;

    // 답변 작성자
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    // 게시글 정보
    @ManyToOne
    private Posts posts;

    // 알림 내용
    @Column
    private String content;

    // 댓글 정보
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;

    // 알림 조회 리스트
    @OneToMany(mappedBy = "alert", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlertViewed> alertViewedList;
}

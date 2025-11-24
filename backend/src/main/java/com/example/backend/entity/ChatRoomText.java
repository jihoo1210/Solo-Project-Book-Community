package com.example.backend.entity;

import com.example.backend.entity.utilities.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter

@Entity
public class ChatRoomText extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 채팅방 정보
    @ManyToOne
    private ChatRoom room;

    // 글쓴이 정보
    @ManyToOne
    private User writer;

    // 글 내용
    @Column
    private String text;
}

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

    @ManyToOne
    private ChatRoom room;

    @ManyToOne
    private User writer;

    @Column
    private String text;
}

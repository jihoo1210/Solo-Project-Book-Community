package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data

@Entity
public class AlertViewed {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 누가 보았나?
    @ManyToOne
    private User user;

    // 어떤 알림을 보았나?
    @ManyToOne
    private Alert alert;
}

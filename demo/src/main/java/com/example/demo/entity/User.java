package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data

@Entity(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String email;

    @Column
    private String username;

    @Column
    private String password;

    @Column
    private Role role;

    /*@OneToMany
    private List<Board> boards;

    @OneToMany
    private List<Comment> comments;

    @OneToMany
    private List<Alert> alerts;

    @OneToMany
    private List<Community> communities;*/
}

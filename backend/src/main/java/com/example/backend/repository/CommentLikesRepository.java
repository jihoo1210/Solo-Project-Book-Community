package com.example.backend.repository;

import com.example.backend.entity.Comment;
import com.example.backend.entity.CommentLikes;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikesRepository extends JpaRepository<CommentLikes, Long>, JpaSpecificationExecutor<CommentLikes> {

    Optional<CommentLikes> findByUserAndComment(User user, Comment comment);
    boolean existsByUserAndComment(User user, Comment comment);
}

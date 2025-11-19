package com.example.backend.repository;

import com.example.backend.entity.Comment;
import com.example.backend.entity.Posts;
import com.example.backend.entity.Report;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {

    boolean existsByUserAndPosts(User user, Posts posts);
    boolean existsByUserAndComment(User user, Comment comment);

    List<Report> findAllByPosts(Posts posts);
    List<Report> findAllByComment(Comment comment);
    Optional<Report> findByUser(User user);
}

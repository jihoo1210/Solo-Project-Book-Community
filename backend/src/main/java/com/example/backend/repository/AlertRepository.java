package com.example.backend.repository;

import com.example.backend.entity.Alert;
import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import com.example.backend.entity.utilities.AlertSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long>, JpaSpecificationExecutor<Alert> {
    boolean existsByPostsAndSenderAndSubject(Posts posts, User sender, AlertSubject subject);
    Optional<Alert> findByPostsAndUserAndSubject(Posts posts, User user, AlertSubject subject);
    boolean existsByUser(User user);

    Collection<Alert> findAllByUser(User user);
}

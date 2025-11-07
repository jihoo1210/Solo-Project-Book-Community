package com.example.backend.repository;

import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import com.example.backend.entity.UserViewed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserViewedRepository extends JpaRepository<UserViewed, Long> {
    boolean existsByUserAndPosts(User user, Posts posts);
}

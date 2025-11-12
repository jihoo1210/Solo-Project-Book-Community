package com.example.backend.repository;

import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import com.example.backend.entity.PostsViewed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostsViewedRepository extends JpaRepository<PostsViewed, Long> {
    boolean existsByUserAndPosts(User user, Posts posts);
}

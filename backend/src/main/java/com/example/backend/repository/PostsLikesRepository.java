package com.example.backend.repository;

import com.example.backend.entity.PostsLikes;
import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostsLikesRepository extends JpaRepository<PostsLikes, Long>, JpaSpecificationExecutor<PostsLikes> {
    Optional<PostsLikes> findByUserAndPosts(User user, Posts posts);
    boolean existsByUserAndPosts(User user, Posts posts);
}

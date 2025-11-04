package com.example.backend.service;

import com.example.backend.dto.posts.create.PostsCreateRequest;
import com.example.backend.dto.posts.create.PostsCreateResponse;
import com.example.backend.dto.posts.delete.PostsDeleteResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.posts.show.PostsShowResponse;
import com.example.backend.dto.posts.update.PostsUpdateRequest;
import com.example.backend.dto.posts.update.PostsUpdateResponse;
import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import com.example.backend.repository.PostsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class PostsService {

    private final PostsRepository repository;

    public List<PostsIndexResponse> index() {
        return repository.findAll().stream().map(post -> PostsIndexResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .username(post.getUser().getUsername())
                .modifiedDate(post.getModifiedDate())
                .likeCount(post.getLikeCount())
                .viewCount(post.getViewCount())
                .build()).toList();
    }

    @Transactional
    public PostsShowResponse show(Long postsId) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        target.setViewCount(target.getViewCount() + 1);

        return PostsShowResponse.builder()
                .id(target.getId())
                .title(target.getTitle())
                .content(target.getContent())
                .username(target.getUser().getUsername())
                .modifiedDate(target.getModifiedDate())
                .likeCount(target.getLikeCount())
                .viewCount(target.getViewCount())
                .build();
    }

    @Transactional
    public void increaseLikeCount(Long postsId) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        target.setLikeCount(target.getLikeCount() + 1);
    }

    @Transactional
    public PostsCreateResponse create(PostsCreateRequest dto, User user) {
        log.info("PostsCreateRequest: {}", dto);
        log.info("User: {}", user);
        Posts target = Posts.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .user(user)
                .build();
        Posts created = repository.save(target);
        return PostsCreateResponse.builder()
                .title(created.getTitle())
                .content(created.getContent())
                .username(created.getUser().getUsername())
                .modifiedDate(created.getModifiedDate())
                .likeCount(created.getLikeCount())
                .viewCount(created.getViewCount())
                .build();
    }

    @Transactional
    public PostsUpdateResponse update(Long postsId, PostsUpdateRequest dto, User user) throws IllegalAccessException {
        log.info("posts id: {}", postsId);
        log.info("PostsUpdateRequest: {}", dto);
        log.info("User: {}", user);
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        if(!target.getUser().equals(user)) throw new IllegalAccessException("다른 사용자의 글을 수정할 수 없습니다.");

        target.setTitle(dto.getTitle());
        target.setContent(dto.getContent());

        return PostsUpdateResponse.builder()
                .id(target.getId())
                .title(target.getTitle())
                .content(target.getContent())
                .username(target.getUser().getUsername())
                .modifiedDate(target.getModifiedDate())
                .likeCount(target.getLikeCount())
                .viewCount(target.getViewCount())
                .build();
    }

    @Transactional
    public PostsDeleteResponse delete(Long postsId, User user) throws IllegalAccessException {
        log.info("posts id: {}", postsId);
        log.info("User: {}", user);

        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalAccessException("해당 게시글이 존재하지 않습니다."));
        if(!user.equals(target.getUser())) throw new IllegalAccessException("다른 사용자의 글을 삭제할 수 없습니다.");

        repository.delete(target);

        return PostsDeleteResponse.builder()
                .id(target.getId())
                .build();
    }
}

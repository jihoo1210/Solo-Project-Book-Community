package com.example.backend.service;

import com.example.backend.dto.comment.CommentResponse;
import com.example.backend.dto.likes.LikesResponse;
import com.example.backend.dto.posts.create.PostsCreateRequest;
import com.example.backend.dto.posts.delete.PostsDeleteResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.posts.show.PostsShowResponse;
import com.example.backend.dto.posts.update.PostsUpdateRequest;
import com.example.backend.dto.posts.update.PostsUpdateResponse;
import com.example.backend.entity.Posts;
import com.example.backend.entity.PostsLikes;
import com.example.backend.entity.User;
import com.example.backend.entity.utilities.Subject;
import com.example.backend.repository.CommentLikesRepository;
import com.example.backend.repository.PostsLikesRepository;
import com.example.backend.repository.PostsRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.utilities.PostSearchSpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.example.backend.entity.utilities.Subject.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class PostsService {

    private final PostsRepository repository;
    private final UserRepository userRepository;
    private final PostsLikesRepository postsLikesRepository;
    private final CommentLikesRepository commentLikesRepository;

    // 게시글 목록을 검색 조건과 페이징 조건에 따라 조회
    public Page<PostsIndexResponse> index(User user,
                                          Pageable pageable,
                                          String searchField,
                                          String searchTerm,
                                          Integer tab) {

        // 1. 검색 조건(Specification) 생성
        Specification<Posts> spec = PostSearchSpec.search(searchField, searchTerm, tab);

        // 2. 검색 조건(spec)과 페이징 조건(pageable)을 함께 Repository에 전달
        Page<Posts> postPage = repository.findAll(spec, pageable);

        // 조회된 Page<Posts>를 Page<PostsIndexResponse>로 변환하여 반환
        return postPage.map(post -> PostsIndexResponse.builder()
                .id(post.getId())
                .subject(post.getSubject().getSubject())
                .title(post.getTitle())
                .username(post.getUser().getUsername())
                .createdDate(post.getCreatedDate())
                .modifiedDate(post.getModifiedDate())
                .likes(post.getLikes().size())
                .commentNumber(post.getComments().size())
                .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, post))
                .viewCount(post.getViewCount())
                .build());
    }

    // 특정 게시글 상세 조회 및 조회수 증가 처리
    @Transactional
    public PostsShowResponse show(User user, Long postsId) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        target.setViewCount(target.getViewCount() + 1);

        List<CommentResponse> comments = target.getComments().stream().map(comment -> CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .username(comment.getUser().getUsername())
                .likes(comment.getLikes().size())
                .savedInLikes(commentLikesRepository.existsByUserAndComment(user, comment))
                .createdDate(comment.getCreatedDate())
                .modifiedDate(comment.getModifiedDate())
                .build()).toList();

        return PostsShowResponse.builder()
                .id(target.getId())
                .subject(target.getSubject().getSubject())
                .title(target.getTitle())
                .content(target.getContent())
                .username(target.getUser().getUsername())
                .modifiedDate(target.getModifiedDate())

                .likes(target.getLikes().size())
                .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, target))
                .viewCount(target.getViewCount())
                .comments(comments)
                .region(target.getRegion())
                .meetingInfo(target.getMeetingInfo())
                .bookTitle(target.getBookTitle())
                .pageNumber(target.getPageNumber())
                .build();
    }

    // 게시글 좋아요 수 증감
    @Transactional
    public LikesResponse handleLikes(Long postsId, User user) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        // 이미 좋아요가 되어 있을 때
        if(postsLikesRepository.existsByUserAndPosts(user, target)) {
            log.warn("User {} already liked post {}", user, postsId);
            PostsLikes removedTarget = postsLikesRepository.findByUserAndPosts(user, target).orElseThrow(() -> new IllegalArgumentException("해당 게시글 또는 사용자가 존재하지 않습니다."));
            postsLikesRepository.delete(removedTarget);

            // 좋아요를 취소 했으니 '좋아요에 등록되어 있음'을 거짓으로
            return LikesResponse.builder()
                    .savedInLikes(false)
                    .build();
        }

        // 좋아요가 되어있지 않았을 때
        PostsLikes likes = PostsLikes.builder()
                .user(user)
                .posts(target)
                .build();
        postsLikesRepository.save(likes);

        log.info("User {} successfully liked post {}", user, postsId);
        // 좋아요를 등록 했으니 '좋아요에 등록되어 있음'을 참으로
        return LikesResponse.builder()
                .savedInLikes(true)
                .build();
    }

    // 새로운 게시글 생성
    @Transactional
    public void create(PostsCreateRequest dto, User user) throws IllegalAccessException {
        log.info("PostsCreateRequest: {}", dto);
        log.info("User: {}", user);

        Subject dtoSubjectToEnum = switch (dto.getSubject()) {
            case "질문" -> QUESTION;
            case "모집" -> RECRUIT;
            default -> SHARE;
        };

        Posts target = Posts.builder()
                .subject(dtoSubjectToEnum)
                .title(dto.getTitle())
                .content(dto.getContent())
                .bookTitle(dto.getBookTitle())
                .pageNumber(dto.getPageNumber())
                .region(dto.getRegion())
                .meetingInfo(dto.getMeetingInfo())
                .user(user)
                .build();

        repository.save(target);
    }

    // 게시글 수정 (작성자 검증 포함)
    @Transactional
    public PostsUpdateResponse update(Long postsId, PostsUpdateRequest dto, User user) throws IllegalAccessException {
        log.info("posts id: {}", postsId);
        log.info("PostsUpdateRequest: {}", dto);
        log.info("User: {}", user);
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        if(!target.getUser().equals(user)) throw new IllegalAccessException("다른 사용자의 글을 수정할 수 없습니다.");

        Subject dtoSubjectToEnum = switch (dto.getSubject()) {
            case "질문" -> QUESTION;
            case "모집" -> RECRUIT;
            default -> SHARE;
        };

        target.setSubject(dtoSubjectToEnum);
        target.setTitle(dto.getTitle());
        target.setContent(dto.getContent());
        target.setRegion(dto.getRegion());
        target.setMeetingInfo(dto.getMeetingInfo());
        target.setBookTitle(dto.getBookTitle());
        target.setPageNumber(dto.getPageNumber());

        return PostsUpdateResponse.builder()
                .id(target.getId())
                .subject(target.getSubject())
                .title(target.getTitle())
                .content(target.getContent())
                .username(target.getUser().getUsername())
                .modifiedDate(target.getModifiedDate())
                .likes(target.getLikes().size())
                .viewCount(target.getViewCount())
                .region(target.getRegion())
                .meetingInfo(target.getMeetingInfo())
                .bookTitle(target.getBookTitle())
                .pageNumber(target.getPageNumber())
                .build();
    }

    // 게시글 삭제 (작성자 검증 포함)
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

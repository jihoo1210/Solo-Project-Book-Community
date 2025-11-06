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
import com.example.backend.entity.utilities.Subject;
import com.example.backend.repository.PostsRepository;
import com.example.backend.service.utilities.PostSearchSpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.backend.entity.utilities.Subject.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class PostsService {

    private final PostsRepository repository;

    // 게시글 목록을 검색 조건과 페이징 조건에 따라 조회
    public Page<PostsIndexResponse> index(Pageable pageable,
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
                .modifiedDate(post.getModifiedDate())
                .likeCount(post.getLikeCount())
                .viewCount(post.getViewCount())
                .build());
    }

    // 특정 게시글 상세 조회 및 조회수 증가 처리
    @Transactional
    public PostsShowResponse show(Long postsId) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        target.setViewCount(target.getViewCount() + 1);

        return PostsShowResponse.builder()
                .id(target.getId())
                .subject(target.getSubject().getSubject())
                .title(target.getTitle())
                .content(target.getContent())
                .username(target.getUser().getUsername())
                .modifiedDate(target.getModifiedDate())
                .likeCount(target.getLikeCount())
                .viewCount(target.getViewCount())
                .region(target.getRegion())
                .meetingInfo(target.getMeetingInfo())
                .bookTitle(target.getBookTitle())
                .pageNumber(target.getPageNumber())
                .build();
    }

    // 게시글 좋아요 수 증가
    @Transactional
    public void increaseLikeCount(Long postsId) {
        Posts target = repository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        target.setLikeCount(target.getLikeCount() + 1);
    }

    // 새로운 게시글 생성
    @Transactional
    public PostsCreateResponse create(PostsCreateRequest dto, User user) throws IllegalAccessException {
        log.info("PostsCreateRequest: {}", dto);
        log.info("User: {}", user);

        Subject dtoSubjectToEnum = switch (dto.getSubject()) {
            case "질문" -> QUESTION;
            case "모집" -> RECRUIT;
            default -> SHARE;
        };

        if(dtoSubjectToEnum.equals(RECRUIT)) {
            if(dto.getRegion() == null || dto.getMeetingInfo() == null) {
                throw new IllegalAccessException("유효하지 않은 형식입니다.");
            }
        }

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

        Posts created = repository.save(target);
        return PostsCreateResponse.builder()
                .subject(created.getSubject().getSubject())
                .title(created.getTitle())
                .content(created.getContent())
                .username(created.getUser().getUsername())
                .modifiedDate(created.getModifiedDate())
                .likeCount(created.getLikeCount())
                .viewCount(created.getViewCount())
                .region(created.getRegion())
                .meetingInfo(created.getMeetingInfo())
                .bookTitle(created.getBookTitle())
                .pageNumber(created.getPageNumber())
                .build();
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
                .likeCount(target.getLikeCount())
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

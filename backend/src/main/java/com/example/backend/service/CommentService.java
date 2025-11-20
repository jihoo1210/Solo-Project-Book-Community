package com.example.backend.service;

import com.example.backend.dto.comment.create.CommentCreateRequest;
import com.example.backend.dto.comment.create.CommentCreateResponse;
import com.example.backend.dto.comment.delete.CommentDeleteResponse;
import com.example.backend.dto.comment.index.CommentIndexResponse;
import com.example.backend.dto.comment.update.CommentUpdateRequest;
import com.example.backend.dto.comment.update.CommentUpdateResponse;
import com.example.backend.dto.likes.LikesResponse;
import com.example.backend.entity.*;
import com.example.backend.entity.utilities.Role;
import com.example.backend.repository.*;
import com.example.backend.service.searchSpec.CommentLikesSearchSpec;
import com.example.backend.service.searchSpec.CommentSearchSpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

import static com.example.backend.entity.utilities.AlertSubject.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostsRepository postsRepository;
    private final CommentLikesRepository commentLikesRepository;
    private final AlertRepository alertRepository;
    private final AlertViewedRepository alertViewedRepository;
    private final UserRepository userRepository;

    /**
     * 댓글 생성하는 메서드
     * @param dto 댓글 정보를 담은 DTO
     * @param user 작성자
     * @param postsId 게시글 ID
     * @return 프론트엔드에 표시할 작성된 댓글 정보
     */
    @Transactional
    public CommentCreateResponse create(CommentCreateRequest dto, User user, Long postsId) {
        Posts posts = postsRepository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다"));

        // 댓글 생성
        Comment target = Comment.builder()
                .content(dto.getContent())
                .user(user)
                .posts(posts)
                .build();
        Comment created = commentRepository.save(target);

        // 알림 생성 및 작성자에게 전달
        Alert alert = Alert.builder()
                .subject(COMMENT)
                // 게시글 작성자
                .user(posts.getUser())
                // 댓글 작성자(나)
                .sender(user)
                .posts(posts)
                .content(target.getContent())
                .comment(target)
                .build();
        alertRepository.save(alert);

        // 댓글 등록
        return CommentCreateResponse.builder()
                .id(created.getId())
                .content(created.getContent())
                .username(created.getUser().getUsername())
                .createdDate(created.getCreatedDate())
                .modifiedDate(created.getModifiedDate())
                .likes(created.getLikes().size())
                .build();
    }

    /**
     * 댓글 즐결찾기 증감 메서드
     * @param user 현재 회원
     * @param commentId 댓글 ID
     * @return 현재 회원의 해당 댓글 즐겨찾기 여부
     */
    @Transactional
    public LikesResponse handleLikes(User user, Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다."));
        Posts posts = comment.getPosts();
        // 이미 좋아요를 한 경우
        if(commentLikesRepository.existsByUserAndComment(user, comment)) {
            CommentLikes target = commentLikesRepository.findByUserAndComment(user, comment).orElseThrow(() -> new IllegalArgumentException("해당 댓글 또는 사용자가 존재하지 않습니다."));
            commentLikesRepository.delete(target);

            // 좋아요 제거했으므로
            return LikesResponse.builder()
                    .savedInLikes(false)
                    .build();
        }

        CommentLikes target = CommentLikes.builder()
                .user(user)
                .posts(posts)
                .comment(comment)
                .build();
        commentLikesRepository.save(target);

        // 좋아요 저장 되었으므로
        return LikesResponse.builder()
                .savedInLikes(true)
                .build();
    }

    /**
     * 댓글 수정 메서드
     * @param user 현재 회원
     * @param commentId 수정할 댓글 ID
     * @param dto 수정한 댓글 정보
     * @return 수정한 댓글 내용
     */
    @Transactional
    public CommentUpdateResponse update(User user, Long commentId, CommentUpdateRequest dto) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다."));
        if(!user.getId().equals(target.getUser().getId())) throw new IllegalAccessException("다른 사용자의 댓글을 수정할 수 없습니다");

        if(StringUtils.hasText(dto.getContent())) target.setContent(dto.getContent());

        target.setModifiedDate(LocalDateTime.now());

        return CommentUpdateResponse.builder()
                .content(target.getContent())
                .build();
    }

    /**
     * 자신의 댓글 조회 메서드
     * @param user 회원 정보
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 검색 탭
     * @return 필터링된 댓글 페이지 리스트
     */
    public Page<CommentIndexResponse> indexByUser(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<Comment> spec = CommentSearchSpec.search(user, searchField, searchTerm, tab);

        Page<Comment> commentPage = commentRepository.findAll(spec, pageable);

        return commentPage.map(item -> CommentIndexResponse.builder()
                .id(item.getId())
                .postId(item.getPosts().getId())
                .postTitle(item.getPosts().getTitle())
                .subject(item.getPosts().getSubject().getSubject())
                .content(item.getContent())
                .username(item.getUser().getUsername())
                .modifiedDate(item.getModifiedDate())
                .createdDate(item.getCreatedDate())
                .commentNumber(item.getPosts().getCommentList().size())
                .likes(item.getLikes().size())
                .savedInLikes(commentLikesRepository.existsByUserAndComment(user, item))
                .build());
    }

    /**
     * 댓글 삭제 메서드
     * @param user 현재 회원
     * @param commentId 삭제할 댓글 ID
     * @return 삭제된 댓글 ID
     */
    @Transactional
    public CommentDeleteResponse delete(User user, Long commentId) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다."));
        if(!user.getId().equals(target.getUser().getId()) || !user.getAuthority().equals(Role.ROLE_ADMIN)) throw new IllegalAccessException("다른 사용자의 댓글을 삭제할 수 없습니다");

        commentRepository.delete(target);

        return CommentDeleteResponse.builder()
                .id(commentId)
                .build();
    }

    /**
     * 즐겨찾기한 댓글 조회 메서드
     * @param user 회원 정보
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 검색 탭
     * @return 필터링된 댓글 페이지 리스트
     */
    public Page<CommentIndexResponse> indexFavoriteByUser(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<CommentLikes> spec = CommentLikesSearchSpec.search(user, searchField, searchTerm, tab);

        Page<CommentLikes> commentLikesPage = commentLikesRepository.findAll(spec, pageable);

        return commentLikesPage.map(item -> CommentIndexResponse.builder()
                .id(item.getId())
                .postId(item.getPosts().getId())
                .postTitle(item.getPosts().getTitle())
                .subject(item.getPosts().getSubject().getSubject())
                .content(item.getComment().getContent())
                .username(item.getUser().getUsername())
                .modifiedDate(item.getComment().getModifiedDate())
                .createdDate(item.getComment().getCreatedDate())
                .commentNumber(item.getPosts().getCommentList().size())
                .likes(item.getComment().getLikes().size())
                .savedInLikes(true)
                .build());
    }

    /**
     * 게시글 [질문]의 댓글 채택 메서드
     * @param user 현재 회원
     * @param commentId 채택할 댓글 ID
     */
    @Transactional
    public void adopt(User user, Long commentId) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다"));
        Posts targetPosts = target.getPosts();

        if(targetPosts.getAdoptedComment() == null) {
            targetPosts.setAdoptedComment(target);

            Alert newAlert = Alert.builder()
                    // 채택된 댓글 작성자
                    .user(target.getUser())
                    // 댓글을 채택한 사람(나)
                    .sender(user)
                    .posts(targetPosts)
                    .content(target.getContent())
                    .subject(ADOPTED)
                    .build();
            alertRepository.save(newAlert);
        } else {
            throw new IllegalAccessException("이미 채택된 게시글이 존재합니다");
        }
    }

    /**
     * 게시글 [모집]에 신청하는 메서드
     * @param dto 신청 정보를 담은 DTO
     * @param user 현재 회원
     * @param postsId 게시글 ID
     */
    @Transactional
    public void applyRecruitment(CommentCreateRequest dto, User user, Long postsId) {
        Posts posts = postsRepository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        User postsUser = posts.getUser();

        // 신청 알림
        Alert alert = Alert.builder()
                // 게시글 작성자
                .user(postsUser)
                // 신청 요청을 보냄(나)
                .sender(user)
                .posts(posts)
                .content(dto.getContent())
                .subject(APPLICATION)
                .build();
        alertRepository.save(alert);
    }
}

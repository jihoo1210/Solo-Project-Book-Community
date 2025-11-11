package com.example.backend.service;

import com.example.backend.dto.comment.create.CommentCreateRequest;
import com.example.backend.dto.comment.create.CommentCreateResponse;
import com.example.backend.dto.comment.delete.CommentDeleteResponse;
import com.example.backend.dto.comment.index.CommentIndexResponse;
import com.example.backend.dto.comment.update.CommentUpdateRequest;
import com.example.backend.dto.comment.update.CommentUpdateResponse;
import com.example.backend.dto.likes.LikesResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.AlertRepository;
import com.example.backend.repository.CommentLikesRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostsRepository;
import com.example.backend.service.utilities.CommentLikesSearchSpec;
import com.example.backend.service.utilities.CommentSearchSpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

import static com.example.backend.entity.utilities.AlertSubject.COMMENT;

@Slf4j
@RequiredArgsConstructor
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostsRepository postsRepository;
    private final CommentLikesRepository commentLikesRepository;
    private final AlertRepository alertRepository;

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
                .user(posts.getUser())
                .posts(posts)
                .content(target.getContent())
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

    @Transactional
    public CommentUpdateResponse update(User user, Long commentId, CommentUpdateRequest dto) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다."));
        if(!user.equals(target.getUser())) throw new IllegalAccessException("다른 사용자의 댓글을 수정할 수 없습니다");

        if(StringUtils.hasText(dto.getContent())) target.setContent(dto.getContent());

        target.setModifiedDate(LocalDateTime.now());

        return CommentUpdateResponse.builder()
                .content(target.getContent())
                .build();
    }

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
                .commentNumber(item.getPosts().getComments().size())
                .likes(item.getLikes().size())
                .savedInLikes(commentLikesRepository.existsByUserAndComment(user, item))
                .build());
    }

    @Transactional
    public CommentDeleteResponse delete(User user, Long commentId) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다."));
        if(!user.equals(target.getUser())) throw new IllegalAccessException("다른 사용자의 댓글을 삭제할 수 없습니다");

        commentRepository.delete(target);

        return CommentDeleteResponse.builder()
                .id(commentId)
                .build();
    }

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
                .commentNumber(item.getPosts().getComments().size())
                .likes(item.getComment().getLikes().size())
                .savedInLikes(true)
                .build());
    }

    @Transactional
    public void adopt(Long commentId) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다"));
        Posts targetPosts = target.getPosts();

        if(targetPosts.getAdoptedComment() == null) {
            targetPosts.setAdoptedComment(target);
        } else {
            throw new IllegalAccessException("이미 채택된 게시글이 존재합니다");
        }
    }
}

package com.example.backend.service;

import com.example.backend.dto.comment.index.CommentIndexResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.user.UserIndexResponse;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Posts;
import com.example.backend.entity.Report;
import com.example.backend.entity.User;
import com.example.backend.repository.*;
import com.example.backend.service.searchSpec.ReportCommentSearchSpec;
import com.example.backend.service.searchSpec.ReportPostsSearchSpec;
import com.example.backend.service.searchSpec.ReportUserSearchSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AdminService {

    private final ReportRepository reportRepository;
    private final PostsRepository postsRepository;
    private final PostsLikesRepository postsLikesRepository;
    private final PostsViewedRepository postsViewedRepository;
    private final CommentRepository commentRepository;
    private final CommentLikesRepository commentLikesRepository;
    private final UserRepository userRepository;


    /**
     * 신고된 개시글 조회하고 Page<?>로 반환
     * @param user 현재 회원
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 검색 탭
     * @return 조회된 게시글 페이지
     */
    public Page<PostsIndexResponse> indexPosts(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<Report> spec = ReportPostsSearchSpec.search(searchField, searchTerm, tab);

        Page<Report> reportPage =  reportRepository.findAll(spec, pageable);

        return reportPage.map(item -> {
            Posts posts = item.getPosts();
            return PostsIndexResponse.builder()
                    .id(posts.getId())
                    .subject(posts.getSubject().getSubject())
                    .title(posts.getTitle())
                    .username(posts.getUser().getUsername())
                    .likes(posts.getLikes().size())
                    .savedInLikes(postsLikesRepository.existsByUserAndPosts(user, posts))
                    .savedInViews(postsViewedRepository.existsByUserAndPosts(user, posts))
                    .viewCount(posts.getViewCount())
                    .createdDate(posts.getCreatedDate())
                    .modifiedDate(posts.getModifiedDate())
                    .build();
        });
    }

    /**
     * 신고된 댓글 조회하고 Page<?>로 반환
     * @param user 현재 회원
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 검색 탭
     * @return 조회된 댓글 페이지
     */
    public Page<CommentIndexResponse> indexComment(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<Report> spec = ReportCommentSearchSpec.search(searchField, searchTerm, tab);
        Page<Report> reportPage = reportRepository.findAll(spec, pageable);

        return reportPage.map(item -> {
            Comment comment = item.getComment();
            return CommentIndexResponse.builder()
                    .id(comment.getId())
                    .postId(comment.getPosts().getId())
                    .postTitle(comment.getPosts().getTitle())
                    .subject(comment.getPosts().getSubject().getSubject())
                    .content(comment.getContent())
                    .username(comment.getUser().getUsername())
                    .modifiedDate(comment.getModifiedDate())
                    .createdDate(comment.getCreatedDate())
                    .commentNumber(comment.getPosts().getCommentList().size())
                    .likes(comment.getLikes().size())
                    .savedInLikes(commentLikesRepository.existsByUserAndComment(user, comment))
                    .build();
        });
    }

    /**
     * 사용자 조회하고 Page<?>로 반환
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @return 조회된 사용자 페이지
     */
    public Page<UserIndexResponse> indexUser(Pageable pageable, String searchField, String searchTerm) {
        Specification<User> spec = ReportUserSearchSpec.search(searchField, searchTerm);
        Page<User> userPage = userRepository.findAll(spec, pageable);

        return userPage.map(item -> UserIndexResponse.builder()
                .id(item.getId())
                .email(item.getEmail())
                .username(item.getUsername())
                .createdDate(item.getCreatedDate())
                .build());
    }

    /**
     * 신고된 객체 무시하는 메서드(부가적인 기능 실행 안하고 바로 신고 삭제)
     * @param objectType 무시할 객체 타입
     * @param reportId 무시할 객체 ID
     */
    @Transactional
    public void ignore(String objectType, Long reportId) {
        switch (objectType) {
            case "posts" -> {
                Posts posts = postsRepository.findById(reportId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
                List<Report> targetList = reportRepository.findAllByPosts(posts);
                reportRepository.deleteAll(targetList);
            }
            case "comment" -> {
                Comment comment = commentRepository.findById(reportId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
                List<Report> targetList = reportRepository.findAllByComment(comment);
                reportRepository.deleteAll(targetList);
            }
            case "user" -> {
                User user = userRepository.findById(reportId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
                Report target = reportRepository.findByUser(user).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));
                reportRepository.delete(target);
            }
            default -> throw new IllegalArgumentException("존재하지 않는 타입의 객체입니다,");
        }

    }
}

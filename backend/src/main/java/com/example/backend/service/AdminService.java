package com.example.backend.service;

import com.example.backend.dto.comment.index.CommentIndexResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.user.UserIndexResponse;
import com.example.backend.entity.Comment;
import com.example.backend.entity.Posts;
import com.example.backend.entity.Report;
import com.example.backend.entity.User;
import com.example.backend.repository.*;
import com.example.backend.service.utilities.ReportCommentSearchSpec;
import com.example.backend.service.utilities.ReportPostsSearchSpec;
import com.example.backend.service.utilities.ReportUserSearchSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

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

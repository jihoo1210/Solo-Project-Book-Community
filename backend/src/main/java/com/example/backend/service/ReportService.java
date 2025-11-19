package com.example.backend.service;

import com.example.backend.entity.Comment;
import com.example.backend.entity.Posts;
import com.example.backend.entity.Report;
import com.example.backend.entity.User;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostsRepository;
import com.example.backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final PostsRepository postsRepository;
    private final CommentRepository commentRepository;

    public void reportPosts(User user, Long postsId) throws IllegalAccessException {
        Posts target = postsRepository.findById(postsId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        if(reportRepository.existsByUserAndPosts(user, target)) {
            throw new IllegalAccessException("이미 신고한 게시글입니다.");
        }
        Report report = Report.builder()
                .posts(target)
                .user(user)
                .build();
        reportRepository.save(report);
    }

    public void reportComment(User user, Long commentId) throws IllegalAccessException {
        Comment target = commentRepository.findById(commentId).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
        if(reportRepository.existsByUserAndComment(user, target)) {
            throw new IllegalAccessException("이미 신고한 댓글입니다.");
        }
        Report report = Report.builder()
                .comment(target)
                .user(user)
                .build();
        reportRepository.save(report);
    }
}

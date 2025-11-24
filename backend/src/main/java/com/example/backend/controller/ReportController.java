package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/report")
public class ReportController {

    private final ReportService reportService;

    /**
     * 게시글 신고 메서드
     * @param userDetails 회원 정보 - 신고한 회원 정보
     * @param postsId 신고할 게시글 ID
     * @return null
     */
    @PostMapping("/posts/{postsId}")
    public ResponseEntity<?> reportPosts(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId) {
        try {
            User user = userDetails.getUser();
            reportService.reportPosts(user, postsId);
            return ResponseController.success(null);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 댓글 신고 메서드
     * @param userDetails 회원 정보 - 신고한 회원 정보
     * @param commentId 신고할 댓글 ID
     * @return null
     */
    @PostMapping("/comment/{commentId}")
    public ResponseEntity<?> reportComment(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            User user = userDetails.getUser();
            reportService.reportComment(user, commentId);
            return ResponseController.success(null);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}

package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.comment.index.CommentIndexResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.user.UserIndexResponse;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.AdminService;
import com.example.backend.service.CommentService;
import com.example.backend.service.PostsService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final PostsService postsService;
    private final CommentService commentService;
    private final UserService userService;

    /**
     * 신고된 게시글 반환하는 메서드
     * @param userDetails 회원 정보 - 읽음, 좋아요 상태 표시용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드(제목, 내용 등)
     * @param searchTerm 검색 내용
     * @param tab 현재 탭(질문, 모임, 모집 등)
     * @return 신고된 게시글 목록
     */
    @GetMapping("/posts")
    public ResponseEntity<?> indexPosts(@AuthenticationPrincipal CustomUserDetails userDetails,
                                        @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                   @RequestParam(required = false, defaultValue = "") String searchField,
                                   @RequestParam(required = false, defaultValue = "") String searchTerm,
                                   @RequestParam(required = false, defaultValue = "0") Integer tab) {
        try {
            User user = userDetails.getUser();
            Page<PostsIndexResponse> responseDto = adminService.indexPosts(user, pageable, searchField, searchTerm, tab);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 신고된 게시글 삭제하는 메서드
     * @param userDetails 사용자 - ADMIN인지 확인
     * @param postsId 삭제할 게시글 ID
     * @return null
     */
    @DeleteMapping("/posts/{postsId}")
    public ResponseEntity<?> deletePosts(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId) {
        try {
            User user = userDetails.getUser();
            postsService.delete(postsId, user);
            return ResponseController.success(null);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 신고된 댓글을 보여주는 메서드
     * @param userDetails 사용자 - 좋아요 확인용
     * @param pageable 페이지 정보
     * @param searchField 검색할 필드
     * @param searchTerm 검색할 단어
     * @param tab 현재 탭
     * @return 신고된 댓글
     */
    @GetMapping("/comment")
    public ResponseEntity<?> indexComment(@AuthenticationPrincipal CustomUserDetails userDetails,
                                        @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                        @RequestParam(required = false, defaultValue = "") String searchField,
                                        @RequestParam(required = false, defaultValue = "") String searchTerm,
                                        @RequestParam(required = false, defaultValue = "0") Integer tab) {
        try {
            User user = userDetails.getUser();
            Page<CommentIndexResponse> responseDto = adminService.indexComment(user, pageable, searchField, searchTerm, tab);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 신고된 댓글 삭제 메서드
     * @param userDetails 사용자 정보 - ADMIN 확인용
     * @param commentId 삭제할 댓글 ID
     * @return null
     */
    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<?> deleteComment(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            User user = userDetails.getUser();
            commentService.delete(user, commentId);
            return ResponseController.success(null);
        } catch (Exception e) {
            log.warn(e.getMessage());
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 사용자 정보를 반환하는 메서드
     * @param pageable 페이지 정보
     * @param searchField 검색 필드(회원명, 이메일)
     * @param searchTerm 검색 단어
     * @return 사용자 정보
     */
    @GetMapping("/user")
    public ResponseEntity<?> indexUser(@PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                       @RequestParam(required = false, defaultValue = "") String searchField,
                                       @RequestParam(required = false, defaultValue = "") String searchTerm) {
        try {
            Page<UserIndexResponse> responsesDto = adminService.indexUser(pageable, searchField, searchTerm);
            return ResponseController.success(responsesDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 회원 삭제 메서드
     * @param userId 삭제할 회원 ID
     * @return null
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseController.success(null);
        } catch (Exception e) {
            log.error("e: ", e);
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 신고 무시 메서드
     * @param objectType 신고를 무시할 객체 타입
     * @param reportId 신고할 객체 ID
     * @return null
     */
    @DeleteMapping("/ignore/{objectType}/{reportId}")
    public ResponseEntity<?> ignore(@PathVariable String objectType, @PathVariable Long reportId) {
        try {
            adminService.ignore(objectType, reportId);
            return ResponseController.success(null);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}

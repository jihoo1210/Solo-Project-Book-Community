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

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long userId) {
        try {
            User user = userDetails.getUser();
            userService.deleteUser(user);
            return ResponseController.success(null);
        } catch (Exception e) {
            log.warn(e.getMessage());
            return ResponseController.fail(e.getMessage());
        }
    }

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

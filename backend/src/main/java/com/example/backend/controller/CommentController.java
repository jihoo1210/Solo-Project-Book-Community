package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.comment.create.CommentCreateRequest;
import com.example.backend.dto.comment.create.CommentCreateResponse;
import com.example.backend.dto.comment.delete.CommentDeleteResponse;
import com.example.backend.dto.comment.index.CommentIndexResponse;
import com.example.backend.dto.comment.update.CommentUpdateRequest;
import com.example.backend.dto.comment.update.CommentUpdateResponse;
import com.example.backend.dto.likes.LikesResponse;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/comment")
public class CommentController {

    private final CommentService service;

    // 댓글 생성
    @PostMapping("/{postsId}")
    public ResponseEntity<?> create(@AuthenticationPrincipal CustomUserDetails userDetails,
                                    @PathVariable Long postsId,
                                    @Valid @RequestBody CommentCreateRequest dto,
                                    BindingResult bindingResult) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("postsId: {}", postsId);
            log.info("CommentCreateRequest: {}", dto);

            if(bindingResult.hasErrors()) throw new IllegalArgumentException("형식이 올바르지 않습니다.");

            User user = userDetails.getUser();

            CommentCreateResponse responseDto = service.create(dto, user, postsId);

            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @PostMapping("/{postsId}/apply-recruitment")
    public ResponseEntity<?> applyRecruitment(@AuthenticationPrincipal CustomUserDetails userDetails,
                                              @PathVariable Long postsId,
                                              @Valid @RequestBody CommentCreateRequest dto,
                                              BindingResult bindingResult) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("postsId: {}", postsId);
            log.info("CommentCreateRequest: {}", dto);

            if(bindingResult.hasErrors()) throw new IllegalArgumentException("형식이 올바르지 않습니다.");

            User user = userDetails.getUser();

            service.applyRecruitment(dto, user, postsId);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> indexByUser(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                         @RequestParam(required = false, defaultValue = "") String searchField,
                                         @RequestParam(required = false, defaultValue = "") String searchTerm,
                                         @RequestParam(required = false, defaultValue = "0") Integer tab) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("Pageable: {}", pageable);
            log.info("searchField: {}", searchField);
            log.info("searchTerm: {}", searchTerm);

            Page<CommentIndexResponse> responseDto = service.indexByUser(userDetails.getUser(), pageable, searchField, searchTerm, tab);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @GetMapping("/my/favorite")
    public ResponseEntity<?> indexFavoriteByUser(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                 @RequestParam(required = false, defaultValue = "") String searchField,
                                                 @RequestParam(required = false, defaultValue = "") String searchTerm,
                                                 @RequestParam(required = false, defaultValue = "0") Integer tab) {
        log.info("CustomUserDetails: {}", userDetails);
        log.info("Pageable: {}", pageable);
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);

        Page<CommentIndexResponse> responsePage = service.indexFavoriteByUser(userDetails.getUser(), pageable, searchField, searchTerm, tab);
        return ResponseController.success(responsePage);
    }

    // 좋아요 증감
    @GetMapping("/{commentId}/handle-likes")
    public ResponseEntity<?> handleLikes(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("commentId: {}", commentId);

            User user = userDetails.getUser();
            LikesResponse responseDto = service.handleLikes(user, commentId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 댓글 채택
    @PostMapping("/{commentId}/adopt")
    public ResponseEntity<?> adoptComment(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            log.info("commentId: {}", commentId);

            User user = userDetails.getUser();

            service.adopt(user, commentId);
            return ResponseEntity.ok().build();
        } catch (IllegalAccessException e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 수정
    @PatchMapping("/{commentId}")
    public ResponseEntity<?> update(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId, @RequestBody CommentUpdateRequest dto, BindingResult bindingResult) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("commentId: {}", commentId);
            log.info("CommentUpdateRequest: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다");

            User user = userDetails.getUser();
            CommentUpdateResponse responseDto = service.update(user, commentId, dto);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("commentId: {}", commentId);

            User user = userDetails.getUser();
            CommentDeleteResponse responseDto = service.delete(user, commentId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
                return ResponseController.fail(e.getMessage());
        }
    }
}

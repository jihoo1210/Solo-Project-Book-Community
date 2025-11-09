package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.likes.LikesResponse;
import com.example.backend.dto.posts.create.PostsCreateRequest;
import com.example.backend.dto.posts.delete.PostsDeleteResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.posts.show.PostsShowResponse;
import com.example.backend.dto.posts.update.PostsUpdateRequest;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.PostsService;
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
@RequestMapping("/posts")
public class PostsController {

    private final PostsService service;

    // 게시글 목록 조회 (검색 및 페이징 적용)
    @GetMapping
    public ResponseEntity<?> index(@AuthenticationPrincipal CustomUserDetails userDetails,
                                   @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                   @RequestParam(required = false, defaultValue = "") String searchField,
                                   @RequestParam(required = false, defaultValue = "") String searchTerm,
                                   @RequestParam(required = false, defaultValue = "0") Integer tab) {
        log.info("CustomUserDetails: {}", userDetails);
        log.info("Pageable: {}", pageable);
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);

        // Service에서 Page 객체를 받아 ResponseController로 감싸서 반환
        Page<PostsIndexResponse> responsePage = service.index(userDetails.getUser(), pageable, searchField, searchTerm, tab);
        return ResponseController.success(responsePage);
    }

    // 내 게시글만 조회
    @GetMapping("/my")
    public ResponseEntity<?> indexByUser(@AuthenticationPrincipal CustomUserDetails userDetails,
                                   @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                   @RequestParam(required = false, defaultValue = "") String searchField,
                                   @RequestParam(required = false, defaultValue = "") String searchTerm,
                                   @RequestParam(required = false, defaultValue = "0") Integer tab) {
        log.info("CustomUserDetails: {}", userDetails);
        log.info("Pageable: {}", pageable);
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);

        // Service에서 Page 객체를 받아 ResponseController로 감싸서 반환
        Page<PostsIndexResponse> responsePage = service.indexByUser(userDetails.getUser(), pageable, searchField, searchTerm, tab);
        return ResponseController.success(responsePage);
    }

    // 내가 좋아요한 게시글 조회
    @GetMapping("/my/favorite")
    public ResponseEntity<?> indexFavoriteByUser(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                 @RequestParam(required = false, defaultValue = "") String searchField,
                                                 @RequestParam(required = false, defaultValue = "") String searchTerm,
                                                 @RequestParam(required = false, defaultValue = "") Integer tab) {
        log.info("CustomUserDetails: {}", userDetails);
        log.info("Pageable: {}", pageable);
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);

        Page<PostsIndexResponse> responsePage = service.indexFavoriteByUser(userDetails.getUser(), pageable, searchField, searchTerm, tab);
        return ResponseController.success(responsePage);
    }

    // 특정 게시글 상세 조회 및 조회수 증가
    @GetMapping("/{postsId}")
    public ResponseEntity<?> show(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId) {
        try {
            log.info("posts id: {}", postsId);

            User user = userDetails.getUser();

            PostsShowResponse responseDto = service.show(user, postsId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 게시글 좋아요 수 증감
    @GetMapping("/{postsId}/handle-likes")
    public ResponseEntity<?> handleLikes(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("posts id: {}", postsId);

            LikesResponse responseDto = service.handleLikes(postsId, userDetails.getUser());
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 새로운 게시글 생성
    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal CustomUserDetails userDetails, @Valid @RequestBody PostsCreateRequest dto, BindingResult bindingResult) {
        try {
            log.info("PostsCreateRequest: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            String email = userDetails.getUsername();

            // userDetails의 user는 DB에서 가져온 객체이기 때문에 따로 변환할 필요가 없다
            service.create(dto, userDetails.getUser());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 특정 게시글 수정
    @PatchMapping("/{postsId}")
    public ResponseEntity<?> update(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId, @Valid @RequestBody PostsUpdateRequest dto, BindingResult bindingResult) {
        try {
            log.info("PostsUpdateRequest: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            service.update(postsId, dto, userDetails.getUser());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    // 특정 게시글 삭제
    @DeleteMapping("/{postsId}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId) {
        try {
            log.info("posts id: {}", postsId);
            PostsDeleteResponse responseDto = service.delete(postsId, userDetails.getUser());
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}

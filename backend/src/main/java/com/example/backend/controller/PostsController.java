package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.posts.create.PostsCreateRequest;
import com.example.backend.dto.posts.create.PostsCreateResponse;
import com.example.backend.dto.posts.delete.PostsDeleteResponse;
import com.example.backend.dto.posts.index.PostsIndexResponse;
import com.example.backend.dto.posts.show.PostsShowResponse;
import com.example.backend.dto.posts.update.PostsUpdateRequest;
import com.example.backend.dto.posts.update.PostsUpdateResponse;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.PostsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/posts")
public class PostsController {

    private final PostsService service;

    @GetMapping
    public ResponseEntity<?> index() {
        List<PostsIndexResponse> responseDtos = service.index();
        return ResponseController.success(responseDtos);
    }

    @GetMapping("/{postsId}")
    public ResponseEntity<?> show(@PathVariable Long postsId) {
        try {
            log.info("posts id: {}", postsId);
            PostsShowResponse responseDto = service.show(postsId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @GetMapping("/{postsId}/increase-likeCount")
    public ResponseEntity<?> increaseLikeCount(@PathVariable Long postsId) {
        try {
            log.info("posts id: {}", postsId);
            service.increaseLikeCount(postsId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal CustomUserDetails userDetails, @Valid @RequestBody PostsCreateRequest dto, BindingResult bindingResult) {
        try {
            log.info("PostsCreateRequest: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            PostsCreateResponse responseDto = service.create(dto, userDetails.getUser());
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    @PatchMapping("/{postsId}")
    public ResponseEntity<?> update(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long postsId, @Valid @RequestBody PostsUpdateRequest dto, BindingResult bindingResult) {
        try {
            log.info("PostsUpdateRequest: {}", dto);
            if(bindingResult.hasErrors()) throw new IllegalArgumentException("유효하지 않은 형식입니다.");
            PostsUpdateResponse responseDto = service.update(postsId, dto, userDetails.getUser());
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

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

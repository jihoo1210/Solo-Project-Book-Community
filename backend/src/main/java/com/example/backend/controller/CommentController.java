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

    /**
     * 댓글 생성 메서드
     * @param userDetails 회원 정보 - 댓글 작성자 추가용
     * @param postsId 추가할 게시글 ID
     * @param dto 댓글 정보를 담은 DTO
     * @param bindingResult 유효성 검사
     * @return 생성된 댓글 정보 - 댓글란에 즉각 표시용
     */
    @PostMapping("/{postsId}")
    public ResponseEntity<?> create(@AuthenticationPrincipal CustomUserDetails userDetails,
                                    @PathVariable Long postsId,
                                    @Valid @RequestBody CommentCreateRequest dto,
                                    BindingResult bindingResult) {
        try {
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

    /**
     * 게시글 타입이 모집일 경우 [신청] 요청을 받는 메서드
     * @param userDetails 회원 정보 - 신청자 추가용
     * @param postsId 게시글 ID - 게시글 조회 및 작성자 조회용
     * @param dto 신청 요청 내용을 담은 DTO
     * @param bindingResult 유효성 검사
     * @return null
     */
    @PostMapping("/{postsId}/apply-recruitment")
    public ResponseEntity<?> applyRecruitment(@AuthenticationPrincipal CustomUserDetails userDetails,
                                              @PathVariable Long postsId,
                                              @Valid @RequestBody CommentCreateRequest dto,
                                              BindingResult bindingResult) {
        try {
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

    /**
     * 내 댓글 조회하는 메서드
     * @param userDetails 회원 정보 - 현재 회원
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 탭
     * @return user가 현재 user인 댓글 페이지
     */
    @GetMapping("/my")
    public ResponseEntity<?> indexByUser(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                         @RequestParam(required = false, defaultValue = "") String searchField,
                                         @RequestParam(required = false, defaultValue = "") String searchTerm,
                                         @RequestParam(required = false, defaultValue = "0") Integer tab) {
        try {
            log.info("Pageable: {}", pageable);
            log.info("searchField: {}", searchField);
            log.info("searchTerm: {}", searchTerm);

            Page<CommentIndexResponse> responseDto = service.indexByUser(userDetails.getUser(), pageable, searchField, searchTerm, tab);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 내가 즐겨찾기한 댓글 페이지 리스트를 반환하는 메서드
     * @param userDetails 회원 정보 - 현재 회원 조회용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 탭
     * @return 필터링된 즐겨찾기된 댓글 페이지 리스트
     */
    @GetMapping("/my/favorite")
    public ResponseEntity<?> indexFavoriteByUser(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                 @RequestParam(required = false, defaultValue = "") String searchField,
                                                 @RequestParam(required = false, defaultValue = "") String searchTerm,
                                                 @RequestParam(required = false, defaultValue = "0") Integer tab) {
        log.info("Pageable: {}", pageable);
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);

        Page<CommentIndexResponse> responsePage = service.indexFavoriteByUser(userDetails.getUser(), pageable, searchField, searchTerm, tab);
        return ResponseController.success(responsePage);
    }

    /**
     * 좋아요 증감하는 메서드
     * @param userDetails 회원 정보 - 좋아요 이력 확인
     * @param commentId 좋아요 증감할 댓글 ID
     * @return 현재 회원이 좋아요를 눌렀는지 여부를 표시하는 boolean 값
     */
    @GetMapping("/{commentId}/handle-likes")
    public ResponseEntity<?> handleLikes(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            log.info("commentId: {}", commentId);

            User user = userDetails.getUser();
            LikesResponse responseDto = service.handleLikes(user, commentId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 게시글 타입이 [질문]일 때 댓글을 채택하는 메서드
     * @param userDetails 회원 정보 - 알림 보내기 용
     * @param commentId 채택할 댓글 ID
     * @return null
     */
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

    /**
     * 게시글 수정하는 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @param commentId 수정할 댓글 ID
     * @param dto 수정된 댓글 정보를 담은 DTO
     * @param bindingResult 유효성 검사
     * @return 수정된 댓글 내용
     */
    @PatchMapping("/{commentId}")
    public ResponseEntity<?> update(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId, @RequestBody CommentUpdateRequest dto, BindingResult bindingResult) {
        try {
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

    /**
     * 댓글 삭제 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @param commentId 삭제할 댓글 ID
     * @return 삭제된 댓글 ID
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long commentId) {
        try {
            log.info("commentId: {}", commentId);

            User user = userDetails.getUser();
            CommentDeleteResponse responseDto = service.delete(user, commentId);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
                return ResponseController.fail(e.getMessage());
        }
    }
}

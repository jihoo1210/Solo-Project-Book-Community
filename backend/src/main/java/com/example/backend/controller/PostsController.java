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

    /**
     * 게시글 조회 매서드
     * @param userDetails 회원 정보 - 좋아요 여부, 조회 여부 확인용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 필드
     * @return 필터링된 게시글 페이지
     */
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

        User user = userDetails != null ? userDetails.getUser() : null;

        // Service에서 Page 객체를 받아 ResponseController로 감싸서 반환
        Page<PostsIndexResponse> responsePage = service.index(user, pageable, searchField, searchTerm, tab);
        return ResponseController.success(responsePage);
    }

    /**
     * 내 게시글만 조회하는 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 탭
     * @return 필터링된 내 게시글 페이지 리스트
     */
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

    /**
     * 내가 즐겨찾기한 게시글 조회하는 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @param tab 현재 탭
     * @return 필터링된 즐겨찾기한 게시글 페이지 리스트
     */
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

    /**
     * 게시글 상세 보기 + 조회수 증가 + 현재 회원이 해당 게시글을 보았음을 저장
     * @param userDetails 회원 정보 - 즐겨찾기 여부, 게시글 보았음 저장용
     * @param postsId 조회할 게시글 ID
     * @return 조회할 게시글 세부정보
     */
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

    /**
     * 게시글 즐겨찾기 수 증감 메서드
     * @param userDetails 회원 정보 - 즐겨찾기 여부 확인용
     * @param postsId 즐겨찾기 증감할 게시글 ID
     * @return 현재 회원이 해당 게시글에 즐겨찾기를 한 여부
     */
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

    /**
     * 게시글 생성 메서드
     * @param userDetails 회원 정보 - 게시글 작성자 저장용
     * @param dto 생성할 게시글의 정보를 담은 DTO
     * @param bindingResult 유효성 검사
     * @return null
     */
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

    /**
     * 게시글 수정하는 메서드
     * @param userDetails 회원 정보 - 수정자 조회용
     * @param postsId 수정할 게시글 ID
     * @param dto 수정된 게시글 정보를 담은 DTO
     * @param bindingResult 유효성 검사
     * @return null
     */
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

    /**
     * 게시글 삭제 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @param postsId 삭제할 게시글 ID
     * @return 삭제된 게시글 ID
     */
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

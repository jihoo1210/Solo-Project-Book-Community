package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.user.ChangeUserInfoRequest;
import com.example.backend.dto.user.MyPageResponse;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.AlertService;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService service;
    private final AlertService alertService;

    /**
     * 내 정보(마이 페이지)를 반환하는 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @return 회원 세부 정보(회원명 + 이메일)
     */
    @GetMapping("/my")
    public ResponseEntity<?> myPage(@AuthenticationPrincipal CustomUserDetails userDetails) {
            log.info("CustomUserDetails: {}", userDetails);

            User user = userDetails.getUser();

            MyPageResponse responseDto = MyPageResponse.builder()
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .build();
            return ResponseController.success(responseDto);
    }

    /**
     * 회원 정보 수정 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     * @param dto 수정된 회원 정보를 담은 DTO
     * @return null
     */
    @PatchMapping("/my/change-userInfo")
    public ResponseEntity<?> changeUserInfo(@AuthenticationPrincipal CustomUserDetails userDetails, @Valid @RequestBody ChangeUserInfoRequest dto) {
        try {
            log.info("CustomUserDetails: {}", userDetails);
            log.info("ChangeUserInfoRequest: {}", dto);

            User user = userDetails.getUser();

            service.changeUserInfo(user, dto);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * DELETE /user/my/cancellation
     * 회원 탈퇴 메서드
     * @param userDetails 회원 정보 - 회원 조회용
     */
    @DeleteMapping("/my/cancellation")
    public ResponseEntity<?> cancellation(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            User user = userDetails.getUser();

            service.deleteUser(user.getId());

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}

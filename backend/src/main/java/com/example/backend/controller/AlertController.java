package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.alert.AlertIndexResponse;
import com.example.backend.dto.alert.CheckNewAlertResponse;
import com.example.backend.entity.User;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/alert")
public class AlertController {

    private final AlertService service;

    /**
     * 알림 정보 가져오는 메서드
     * @param userDetails 회원 정보 - 현재 회원 확인용
     * @param pageable 페이지 정보
     * @param searchField 검색 필드(제목, 내용 등)
     * @param searchTerm 검색 단어
     * @param tab 현재 탭(댓글, 신청 등)
     * @return 필터링된 알림 페이지
     */
    @GetMapping
    public ResponseEntity<?> index(@AuthenticationPrincipal CustomUserDetails userDetails, @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                   @RequestParam(required = false, defaultValue = "") String searchField,
                                   @RequestParam(required = false, defaultValue = "") String searchTerm,
                                   @RequestParam(required = false, defaultValue = "") Integer tab) {
        try {
            log.info("CustomUserDetails: {}", userDetails);

            User user = userDetails.getUser();

            Page<AlertIndexResponse> responseDto = service.index(user, pageable, searchField, searchTerm, tab);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 새 알림이 있는지 확인하는 메서드
     * @param userDetails 회원 정보 - 회원 확인용
     * @return 새 알림 정보가 있는지를 표시할 boolean 값
     */
    @GetMapping("/check-new-alert")
    public ResponseEntity<?> checkNewAlert(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            User user = userDetails.getUser();

            CheckNewAlertResponse responseDto = service.checkNewAlert(user);
            return ResponseController.success(responseDto);
        } catch (Exception e) {
            log.error("e", e);
            return ResponseController.fail(e.getMessage());
        }
    }
}

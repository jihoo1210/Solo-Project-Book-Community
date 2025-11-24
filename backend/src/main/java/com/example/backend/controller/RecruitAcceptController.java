package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.alert.recurit.AlertAcceptRequest;
import com.example.backend.dto.alert.recurit.AlertRejectRequest;
import com.example.backend.service.RecruitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/recruit")
public class RecruitAcceptController {

    private final RecruitService service;

    /**
     * 알림 [신청]을 승인하는 메서드
     * @param alertId 승인할 알림 ID
     * @param dto 승인 내용을 담은 DTO
     * @return null
     */
    @PostMapping("/{alertId}/accept")
    public ResponseEntity<?> accept(@PathVariable Long alertId, @RequestBody AlertAcceptRequest dto) {
        try {
            log.info("alertId: {}", alertId);
            log.info("AlertAcceptRequest: {}", dto);

            service.accept(alertId, dto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }

    /**
     * 알림 [신청]을 거절하는 메서드
     * @param alertId 알림 ID
     * @param dto 거절 내용을 담은 DTO
     * @param bindingResult 유효성 검사
     * @return null
     */
    @PostMapping("/{alertId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long alertId, @RequestBody AlertRejectRequest dto, BindingResult bindingResult) {
        try {
            log.info("alertId: {}", alertId);
            log.info("AlertRejectRequest: {}", dto);

            if(bindingResult.hasErrors()) throw new IllegalAccessException("거절의 경우 반드시 사유를 작성해야 합니다.");
            service.reject(alertId, dto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseController.fail(e.getMessage());
        }
    }
}

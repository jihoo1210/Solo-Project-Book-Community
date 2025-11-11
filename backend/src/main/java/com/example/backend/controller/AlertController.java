package com.example.backend.controller;

import com.example.backend.controller.utilities.ResponseController;
import com.example.backend.dto.alert.AlertIndexResponse;
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
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/alert")
public class AlertController {

    private final AlertService service;

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

//    @DeleteMapping("/close")
//    public ResponseEntity<?> close(@AuthenticationPrincipal CustomUserDetails userDetails) {
//        try {
//            User user = userDetails.getUser();
//
//            service.close(user);
//            return ResponseEntity.ok().build();
//        } catch (Exception e) {
//            return ResponseController.fail(e.getMessage());
//        }
//    }
}

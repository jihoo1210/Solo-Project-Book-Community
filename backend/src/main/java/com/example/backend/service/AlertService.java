package com.example.backend.service;

import com.example.backend.dto.alert.AlertIndexResponse;
import com.example.backend.entity.Alert;
import com.example.backend.entity.User;
import com.example.backend.repository.AlertRepository;
import com.example.backend.repository.AlertViewedRepository;
import com.example.backend.service.utilities.AlertSearchSpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final AlertViewedRepository alertViewedRepository;

    public Page<AlertIndexResponse> index(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<Alert> spec = AlertSearchSpec.search(user, searchField, searchTerm, tab);

        Page<Alert> alertPage = alertRepository.findAll(spec, pageable);

        // 모든 알림을 확인 하였음으로 설정
        alertViewedRepository.deleteAllByUser(user);

        return alertPage.map(item -> AlertIndexResponse.builder()
                .id(item.getId())
                .subject(item.getSubject().getSubject())
                .postsId(item.getPosts().getId())
                .postsTitle(item.getPosts().getTitle())
                .username(item.getSender().getUsername())
                .commentNumber(item.getPosts().getComments().size())
                .content(item.getContent())
                .createdDate(item.getCreatedDate())
                .build());
    }

    public boolean isExistsAlert(User user) {
        // 알림이 존재하고, 읽지 않은 알림이 있을 때
        return !alertViewedRepository.existsByUser(user) && alertRepository.existsByUser(user);
    }
}

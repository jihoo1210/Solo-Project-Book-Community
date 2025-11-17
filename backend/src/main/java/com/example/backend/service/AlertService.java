package com.example.backend.service;

import com.example.backend.dto.alert.AlertIndexResponse;
import com.example.backend.dto.alert.CheckNewAlertResponse;
import com.example.backend.entity.Alert;
import com.example.backend.entity.AlertViewed;
import com.example.backend.entity.User;
import com.example.backend.repository.AlertRepository;
import com.example.backend.repository.AlertViewedRepository;
import com.example.backend.service.utilities.AlertSearchSpec;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class AlertService {

    @PersistenceContext
    private EntityManager entityManager;
    private final AlertRepository alertRepository;
    private final AlertViewedRepository alertViewedRepository;

    @Transactional
    public Page<AlertIndexResponse> index(User user, Pageable pageable, String searchField, String searchTerm, Integer tab) {
        Specification<Alert> spec = AlertSearchSpec.search(user, searchField, searchTerm, tab);

        Page<Alert> alertPage = alertRepository.findAll(spec, pageable);

        Page<AlertIndexResponse> responses = alertPage.map(item -> AlertIndexResponse.builder()
                .id(item.getId())
                .subject(item.getSubject().getSubject())
                .postsId(item.getPosts().getId())
                .postsTitle(item.getPosts().getTitle())
                .username(item.getSender().getUsername())
                // 읽을 알림에 저장되어 있으면 true 아니면 false
                .savedInViews(alertViewedRepository.existsByAlert(item))
                .content(item.getContent())
                .createdDate(item.getCreatedDate())
                .build());

        // 안 읽은 알림들 읽음에 저장
        alertPage.stream().forEach(item -> {
            if (!alertViewedRepository.existsByAlert(item)) {
                alertViewedRepository.save(AlertViewed.builder().user(user).alert(item).build());
            }
        });

        return responses;
    }

    public boolean isExistsAlert(User user) {
        // 알림이 존재하고, 읽지 않은 알림이 있을 때
        return !alertViewedRepository.existsByUser(user) && alertRepository.existsByUser(user);
    }

    public CheckNewAlertResponse checkNewAlert(User user) {
        // 알림이 존재하고, 읽지 않은 알림이 있을 때
        boolean isExistsNewAlert = alertRepository.findAllByUser(user).stream().anyMatch(item -> !alertViewedRepository.existsByAlert(item));
        return CheckNewAlertResponse.builder().haveNew(isExistsNewAlert).build();
    }
}

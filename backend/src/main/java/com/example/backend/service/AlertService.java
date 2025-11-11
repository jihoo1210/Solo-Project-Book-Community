package com.example.backend.service;

import com.example.backend.dto.alert.AlertIndexResponse;
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

        // 읽을 알림 저장
        alertViewedRepository.saveAll(alertPage.map(item -> AlertViewed.builder()
                .alert(item)
                .user(item.getUser())
                .build()));

        return alertPage.map(item -> AlertIndexResponse.builder()
                .id(item.getId())
                .subject(item.getSubject().getSubject())
                .postsId(item.getPosts().getId())
                .postsTitle(item.getPosts().getTitle())
                .username(item.getSender().getUsername())
                // 읽을 알림에 저장되어 있으면 true 아니면 false
                // .willRead(alertViewedRepository.existsByAlert(item))
                .content(item.getContent())
                .createdDate(item.getCreatedDate())
                .build());
    }

    public boolean isExistsAlert(User user) {
        // 알림이 존재하고, 읽지 않은 알림이 있을 때
        return !alertViewedRepository.existsByUser(user) && alertRepository.existsByUser(user);
    }

//    @Modifying
//    @Transactional
//    public void close(User user) {
//        // 읽을 알림 전부 삭제
//        alertViewedRepository.deleteAllByUser(user);
//        entityManager.clear();
//    }
}

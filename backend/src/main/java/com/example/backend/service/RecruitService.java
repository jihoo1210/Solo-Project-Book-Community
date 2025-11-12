package com.example.backend.service;

import com.example.backend.dto.alert.recurit.AlertAcceptRequest;
import com.example.backend.dto.alert.recurit.AlertRejectRequest;
import com.example.backend.entity.Alert;
import com.example.backend.entity.Posts;
import com.example.backend.entity.User;
import com.example.backend.repository.AlertRepository;
import com.example.backend.repository.AlertViewedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static com.example.backend.entity.utilities.AlertSubject.APPROVAL;
import static com.example.backend.entity.utilities.AlertSubject.REJECTED;

@Slf4j
@RequiredArgsConstructor
@Service
public class RecruitService {

    private final AlertRepository alertRepository;
    private final AlertViewedRepository alertViewedRepository;

    @Transactional
    public void accept(Long alertId, AlertAcceptRequest dto) throws IllegalAccessException {
        Alert target = alertRepository.findById(alertId).orElseThrow(() -> new IllegalArgumentException("해당 알림이 존재하지 않습니다."));
        User me = target.getUser();
        User sender = target.getSender();
        Posts posts = target.getPosts();

        // 수락됨 알림
        Alert alert = Alert.builder()
                .subject(APPROVAL)
                // 받는 사람(sender = 이전에 보낸 사람)
                .user(sender)
                // 보내는 사람(user = 이전에 받은 사람)
                .sender(me)
                // 승인 내용
                .content(!StringUtils.hasText(dto.getContent()) ? "당신의 가입을 환영합니다." : dto.getContent())
                .posts(posts)
                .build();
        alertRepository.save(alert);

        // 모집된 인원 + 1
        if(posts.getCurrentUserNumber() == null) {
            posts.setCurrentUserNumber(1);
        } else if(posts.getMaxUserNumber() > posts.getCurrentUserNumber()) {
            posts.setCurrentUserNumber(posts.getCurrentUserNumber() + 1);
        } else  {
            throw new IllegalAccessException("현재 회원수가 설정된 최대 회원수입니다.");
        }
        log.info("posts: {}", posts);

        // 수락 했으니 알림 삭제
        deleteAlert(target);

        // 커뮤니티 로직 추가 예정
    }

    public void reject(Long alertId, AlertRejectRequest dto) {
        Alert target = alertRepository.findById(alertId).orElseThrow(() -> new IllegalArgumentException("해당 알림이 존재하지 않습니다."));
        User me = target.getUser();
        User sender = target.getSender();
        Posts posts = target.getPosts();

        // 거절됨 알림
        Alert alert = Alert.builder()
                .subject(REJECTED)
                // 받는 사람(sender = 이전에 보낸 사람)
                .user(sender)
                // 보내는 사람(user = 이전에 받은 사람)
                .sender(me)
                // 승인 내용
                .content(dto.getContent() == null ? "내용 없음" : dto.getContent())
                .posts(posts)
                .build();
        alertRepository.save(alert);

        // 거절 했으니 알림 삭제
        deleteAlert(target);
    }

    private void deleteAlert(Alert alert) {
        // 1. 삭제하려는 알림을 참조하고 있는 레코드 우선 삭제
        alertViewedRepository.deleteByAlert(alert);
        // 2. 삭제하려는 레코드 삭제
        alertRepository.delete(alert);
    }
}

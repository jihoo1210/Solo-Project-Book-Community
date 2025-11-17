package com.example.backend.service.utilities;

import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.User;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class ChatRoomSpec {

    // 검색 필드, 검색어, 탭(주제)을 기반으로 JPA Specification을 생성하여 동적 쿼리 조건 제공
    public static Specification<ChatRoom> search(User user, String searchField, String searchTerm, Integer tab) {
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);
        log.info("tab: {}", tab);

        // 검색어가 있으면 동적 조건 생성
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            String cleanSearchTerm = searchTerm.replaceAll("\\s", "").toLowerCase(); // 공백 제거
            String pattern = "%" + cleanSearchTerm.toLowerCase() + "%"; // Like 검색 패턴

            if (user != null) {
                // 관리자이거나
                Predicate creatorPredicate = builder.equal(root.get("creator"), user);

                // 초대된 사용자이거나
                Join<ChatRoom, User> chatRoomUserJoin = root.join("invitedUsers", JoinType.LEFT);
                log.info("chatRoomUserJoin: {}", chatRoomUserJoin);
                Predicate invitedPredicate = builder.equal(chatRoomUserJoin, user);

                predicates.add(builder.or(creatorPredicate, invitedPredicate));
            }

            // 검색 필드에 따른 조건 추가 (OR 조건으로 검색 가능)
            // 공백 제거
            if (StringUtils.hasText(cleanSearchTerm)) {
                if ("커뮤니티".equals(searchField)) {
                    Expression<String> nonSpacedLowerTitle = builder.function(
                            "REPLACE", String.class,
                            builder.lower(root.get("roomName")),
                            builder.literal(" "),
                            builder.literal("")
                    );
                    predicates.add(builder.like(nonSpacedLowerTitle, pattern));
                } else if ("관리자".equals(searchField)) {
                    Expression<String> nonSpacedLowerTitle = builder.function(
                            "REPLACE", String.class,
                            builder.lower(root.get("creator").get("username")),
                            builder.literal(" "),
                            builder.literal("")
                    );
                    predicates.add(builder.like(nonSpacedLowerTitle, pattern));
                } else if ("참가자".equals(searchField)) {

                    Join<ChatRoom, User> invitedUserJoin = root.join("invitedUsers", JoinType.LEFT);

                    Expression<String> nonSpacedLowerTitle = builder.function(
                            "REPLACE", String.class,
                            builder.lower(invitedUserJoin.get("username")),
                            builder.literal(" "),
                            builder.literal("")
                    );
                    predicates.add(builder.like(nonSpacedLowerTitle, pattern));
                }
            }

            if (tab != null && tab > 0) {
                Predicate condition = null;

                switch (tab) {
                    case 1: // 관리자
                        condition = builder.equal(root.get("creator"), user);
                        break;
                    case 2: // 참가자
                        Join<ChatRoom, User> invitedUserJoin = root.join("invitedUsers", JoinType.LEFT);
                        condition = builder.equal(invitedUserJoin, user);
                        break;
                    default:
                        return builder.and(predicates.toArray(new Predicate[0]));
                }

                if (condition != null) {
                    predicates.add(condition);
                }
            }

            // 모든 Predicate을 AND나 OR로 결합하여 최종 Predicate 반환
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

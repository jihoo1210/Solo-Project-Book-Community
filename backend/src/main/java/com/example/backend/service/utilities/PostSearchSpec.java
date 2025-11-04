package com.example.backend.service.utilities;

import com.example.backend.entity.Posts;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class PostSearchSpec {

    public static Specification<Posts> search(String searchField, String searchTerm) {
        // 검색어가 없으면 항상 true를 반환하여 전체 조회를 수행
        if (!StringUtils.hasText(searchTerm)) {
            return (root, query, builder) -> null; // WHERE 절 없음
        }

        // 검색어가 있으면 동적 조건 생성
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            String pattern = "%" + searchTerm.toLowerCase() + "%"; // Like 검색 패턴

            // 검색 필드에 따른 조건 추가 (OR 조건으로 검색 가능)
            if ("제목".equals(searchField)) {
                predicates.add(builder.like(builder.lower(root.get("title")), pattern));
            } else if ("내용".equals(searchField)) {
                predicates.add(builder.like(builder.lower(root.get("content")), pattern));
            } else if ("작성자".equals(searchField)) {
                // Post 엔티티와 User 엔티티가 연관되어 있다고 가정하고, root.get("user")를 통해 접근
                predicates.add(builder.like(builder.lower(root.get("user").get("username")), pattern));
            } else {
                // 기본값: 제목 + 내용 OR 검색 (필요에 따라 구현)
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("title")), pattern),
                        builder.like(builder.lower(root.get("content")), pattern)
                ));
            }

            // 모든 Predicate을 AND나 OR로 결합하여 최종 Predicate 반환
            return builder.and(predicates.toArray(new Predicate[0])); // 현재는 하나의 조건이므로 and/or는 크게 상관없음
        };
    }
}
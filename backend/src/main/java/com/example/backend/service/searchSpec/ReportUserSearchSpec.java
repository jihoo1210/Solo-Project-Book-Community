package com.example.backend.service.searchSpec;

import com.example.backend.entity.User;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class ReportUserSearchSpec {

    /**
     * 사용자 검색 조건 생성 메서드
     * @param searchField 검색 필드
     * @param searchTerm 검색 단어
     * @return 검색 조건
     */
    public static Specification<User> search(String searchField, String searchTerm) {

        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);

        return ((root, query, builder) -> {
        List<Predicate> predicates = new ArrayList<>();
        String cleanSearchTerm = searchTerm.replaceAll("\\s", "").toLowerCase();
        String pattern = "%" + cleanSearchTerm + "%";

        if(StringUtils.hasText(searchTerm)) {
            if("회원명".equals(searchField)) {
                Expression<String> nonSpaceLowerUsername = builder.function(
                        "REPLACE", String.class,
                        builder.lower(root.get("username")),
                        builder.literal(" "),
                        builder.literal("")
                );
                predicates.add(builder.like(nonSpaceLowerUsername, pattern));
            } else if("이메일".equals(searchField)) {
                Expression<String> nonSpaceLowerEmail = builder.function(
                        "REPLACE", String.class,
                        builder.lower(root.get("email")),
                        builder.literal(" "),
                        builder.literal("")
                );
                predicates.add(builder.like(nonSpaceLowerEmail, pattern));
            }
        }

            return builder.and(predicates.toArray(new Predicate[0]));
        });
    }
}

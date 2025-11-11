package com.example.backend.service.utilities;

import com.example.backend.entity.Alert;
import com.example.backend.entity.User;
import com.example.backend.entity.utilities.AlertSubject;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

import static com.example.backend.entity.utilities.AlertSubject.*;

@Slf4j
public class AlertSearchSpec {

    public static Specification<Alert> search(User user, String searchField, String searchTerm, Integer tab) {
        log.info("searchField: {}", searchField);
        log.info("searchTerm: {}", searchTerm);
        log.info("tab: {}", tab);

        return ((root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            String clearSearchTerm = searchTerm.replaceAll("\\s", "").toLowerCase();
            String pattern = "%" + clearSearchTerm.toLowerCase() + "%";

            predicates.add(builder.equal(root.get("user"), user));

            if(StringUtils.hasText(searchTerm)) {
                if ("제목".equals(searchField)) {
                    Expression<String> nonSpacedLowerTitle = builder.function(
                            "REPLACE", String.class,
                            builder.lower(root.get("posts").get("title")),
                            builder.literal(" "),
                            builder.literal("")
                    );
                    predicates.add(builder.like(nonSpacedLowerTitle, pattern));
                } else if ("내용".equals(searchField)) {
                    // 1. CLOB 타입인 content 필드를 빈 문자열과 연결(CONCAT)하여
                    //    Hibernate가 이 Expression을 STRING 타입으로 처리하도록 강제합니다.
                    Expression<String> stringContent = builder.concat(
                            root.get("content"),
                            builder.literal("") // ⬅️ 빈 문자열과 연결
                    );

                    // 2. 이제 STRING 타입으로 강제 변환된 stringContent에 lower()와 REPLACE() 함수를 안전하게 적용합니다.
                    Expression<String> nonSpacedLowerTitle = builder.function(
                            "REPLACE", String.class,
                            builder.lower(stringContent), // ⬅️ 변환된 Expression 사용
                            builder.literal(" "),
                            builder.literal("")
                    );
                    predicates.add(builder.like(nonSpacedLowerTitle, pattern));
                } else if ("작성자".equals(searchField)) {
                    Expression<String> nonSpacedLowerTitle = builder.function(
                            "REPLACE", String.class,
                            builder.lower(root.get("user").get("username")),
                            builder.literal(" "),
                            builder.literal("")
                    );
                    predicates.add(builder.like(nonSpacedLowerTitle, pattern));
                }
            }
                if (tab != null && tab > 0) {
                    AlertSubject subjectValue;
                    switch (tab) {
                        case 1: subjectValue = COMMENT; break;
                        case 2: subjectValue = ADOPTED; break;
                        case 3: subjectValue = APPROVAL; break;
                        case 4: subjectValue = REJECTED; break;
                        default: return builder.and(predicates.toArray(new Predicate[0])); // 유효하지 않은 탭은 무시
                    }

                    log.info("tab: {}, subjectValue: {}", tab, subjectValue);
                    log.info("entity subject: {}, subjectValue: {}", root.get("subject").toString(), subjectValue);
                    // Enum 값을 사용하여 Posts 엔티티의 subject 필드와 일치하는 조건 추가
                    predicates.add(builder.equal(root.get("subject"), subjectValue));
                }
                return builder.and(predicates.toArray(new Predicate[0]));
        });
    }
}

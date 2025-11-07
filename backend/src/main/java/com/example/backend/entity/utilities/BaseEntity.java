package com.example.backend.entity.utilities;

import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass // 자식 클래스가 상속받을 때 필드(컬럼)를 매핑하도록 설정
@EntityListeners(AuditingEntityListener.class) // Auditing 기능을 포함시킵니다.
public class BaseEntity {

    @CreatedDate // 엔티티가 생성되어 저장될 때 시간이 자동 저장됩니다.
    private LocalDateTime createdDate;

//    @LastModifiedDate // 엔티티의 값을 변경할 때 시간이 자동 저장됩니다.
//    private LocalDateTime modifiedDate;
}

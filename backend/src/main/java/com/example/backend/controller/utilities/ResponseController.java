/**
 * 모든 컨트롤러의 HTTP 응답을 표준화하는 유틸리티 클래스.
 * ResponseDto로 감싼 ResponseEntity를 쉽게 생성하는 정적 메서드를 제공합니다.
 */

package com.example.backend.controller.utilities;

import com.example.backend.dto.ResponseDto;
import org.springframework.http.ResponseEntity;

public class ResponseController {

    /**
     * 성공적인 응답 (HTTP 200 OK)을 생성합니다.
     * 제네릭 T 타입을 사용하여 어떤 데이터 객체든 'result' 필드에 담을 수 있습니다.
     * @param <T> 응답 본문(result)의 제네릭 타입
     * @param responseDto 응답 본문에 포함될 실제 데이터 객체
     * @return ResponseDto<T>로 감싸진 ResponseEntity<ResponseDto<T>> 객체
     */
    public static <T> ResponseEntity<ResponseDto<T>> success(T responseDto) {
        ResponseDto<T> response = ResponseDto.<T>builder().result(responseDto).build();
        return ResponseEntity.ok().body(response);
    }

    /**
     * 오류 응답 (HTTP 400 Bad Request)을 생성합니다.
     * 오류 메시지만 포함하고 결과(result) 필드는 null로 설정합니다.
     * @param errorMessage 응답 본문에 포함될 오류 메시지
     * @return ResponseDto<?>로 감싸진 ResponseEntity<ResponseDto<?>> 객체
     */
    public static ResponseEntity<ResponseDto<?>> fail(String errorMessage) {
        ResponseDto<?> response = ResponseDto.builder().message(errorMessage).build();
        return ResponseEntity.badRequest().body(response);
    }
}

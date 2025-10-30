package com.example.demo.controller;

import com.example.demo.dto.ResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ControllerUtils <T> {

    protected ResponseEntity<?> setResponse(T responseDto) {
        ResponseDto response = ResponseDto.<T>builder().result(responseDto).build();
        return ResponseEntity.ok().body(response);
    }

    protected ResponseEntity<?> setException(Exception ex) {
        log.error(ex.getMessage());
        ResponseDto response = ResponseDto.builder().error(ex.getMessage()).build();
        return ResponseEntity.badRequest().body(response);
    }
}

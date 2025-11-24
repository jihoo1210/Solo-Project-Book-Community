package com.example.backend.socket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@RequiredArgsConstructor
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final RoomChatHandler roomChatHandler;

    /**
     * 웹 소켓 접속 경로 설정 및 Handler 등록
     * @param registry
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 웹소켓이 실행될 주소
        registry.addHandler(roomChatHandler, "/community").setAllowedOrigins("http://localhost:3000"); // 후에 배포 도메인 등록 필요
    }
}

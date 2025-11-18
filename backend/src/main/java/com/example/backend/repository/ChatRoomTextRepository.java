package com.example.backend.repository;

import com.example.backend.entity.ChatRoom;
import com.example.backend.entity.ChatRoomText;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomTextRepository extends JpaRepository<ChatRoomText, Long> {
    List<ChatRoomText> findTop25ByRoom(ChatRoom chatRoom);
}

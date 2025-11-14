package com.example.backend.repository;

import com.example.backend.entity.ChatRoomText;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomTextRepository extends JpaRepository<ChatRoomText, Long> {
}

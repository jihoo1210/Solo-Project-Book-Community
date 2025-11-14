package com.example.backend.socket;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class RoomRepository {
    private final Map<String, ChatRoom> rooms = new HashMap<>();

    public ChatRoom createRoom(String roomId, Set<String> invitedUsers) {
        ChatRoom room = new ChatRoom(roomId, invitedUsers);
        rooms.put(roomId, room);
        return room;
    }

    public ChatRoom getRoom(String roomId) {
        return rooms.get(roomId);
    }
}

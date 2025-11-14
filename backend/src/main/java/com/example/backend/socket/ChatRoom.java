package com.example.backend.socket;

import lombok.Getter;

import java.util.HashSet;
import java.util.Set;

public class ChatRoom {
    @Getter
    private final String roomId;
    private Set<String> invitedUsers = new HashSet<>();
    private Set<String> connectedUsers = new HashSet<>();

    public ChatRoom(String roomId, Set<String> invitedUsers) {
        this.roomId = roomId;
        this.invitedUsers = invitedUsers;
    }

    public boolean isInvited(String userId) {
        return invitedUsers.contains(userId);
    }

    public void addConnectUser(String userId) {
        connectedUsers.add(userId);
    }

    public void removeConnectUser(String userId) {
        connectedUsers.remove(userId);
    }
}

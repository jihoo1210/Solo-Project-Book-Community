package com.example.backend.repository;

import com.example.backend.entity.AlertViewed;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertViewedRepository extends JpaRepository<AlertViewed, Long> {
    void deleteAllByUser(User user);
    boolean existsByUser(User user);
}

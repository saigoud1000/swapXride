package com.carswap.backend.repository;

import com.carswap.backend.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {
}

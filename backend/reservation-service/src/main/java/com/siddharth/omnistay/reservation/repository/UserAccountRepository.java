package com.siddharth.omnistay.reservation.repository;

import com.siddharth.omnistay.reservation.entity.UserAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccountEntity, String> {
    Optional<UserAccountEntity> findByUsernameIgnoreCase(String username);
    Optional<UserAccountEntity> findByEmailIgnoreCase(String email);
    Optional<UserAccountEntity> findByPhone(String phone);
}

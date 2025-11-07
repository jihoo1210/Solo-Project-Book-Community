/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스 클래스.
 * 주로 회원가입, 사용자 정보 조회/수정 등의 작업을 수행합니다.
 */
package com.example.backend.service;

import com.example.backend.dto.auth.CheckUsernameResponse;
import com.example.backend.dto.auth.signup.SignupRequest;
import com.example.backend.dto.auth.signup.SignupResponse;
import com.example.backend.dto.user.ChangeUserInfoRequest;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static com.example.backend.entity.utilities.Role.ROLE_USER;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    /**
     * 회원가입 요청을 처리하는 메소드.
     * 1. 이메일 중복 검사
     * 2. 비밀번호 암호화
     * 3. 데이터베이스에 사용자 정보 저장
     *
     * @param dto 회원가입에 필요한 정보(이메일, 사용자 이름, 비밀번호)를 담은 요청 DTO
     * @return 저장된 사용자의 정보를 담은 응답 DTO
     * @throws DataIntegrityViolationException 동일한 이메일로 이미 가입된 계정이 존재할 경우 발생
     */
    public SignupResponse signup(SignupRequest dto) throws DataIntegrityViolationException {
        log.info("SignupRequest: {}", dto);

        // 1. 이메일 중복 검사
        // 해당 이메일로 이미 등록된 사용자가 있는지 확인합니다.
        if(repository.existsByEmail(dto.getEmail())) {
            log.warn("Signup failed: Duplicate email found: {}", dto.getEmail());
            throw new DataIntegrityViolationException("이미 동일한 이메일로 가입된 계정이 존재합니다.");
        }

        // 2. User 엔티티 생성 및 비밀번호 암호화
        User target = User.builder()
                .email(dto.getEmail())
                .username(dto.getUsername())
                .password(encoder.encode(dto.getPassword()))
                .authority(ROLE_USER)
                .build();

        // 3. 데이터베이스에 사용자 정보 저장
        User saved = repository.save(target);

        // 4. 응답 DTO 반환
        // 저장된 사용자의 이름 등을 포함하는 응답 DTO를 생성하여 반환합니다.
        return SignupResponse.builder()
                .email(saved.getEmail())
                .build();
    }

    public CheckUsernameResponse isUsernameAvailable(String username) {
        if(repository.existsByUsername(username)) {
            return CheckUsernameResponse.builder()
                    .isAvailable(false)
                    .build();
        } else {
            return CheckUsernameResponse.builder()
                    .isAvailable(true)
                    .build();
        }
    }

    /**
     * 회원 정보 수정
     */
    @Transactional
    public void changeUserInfo(User user, ChangeUserInfoRequest dto) {
        if(StringUtils.hasText(dto.getUsername())) user.setUsername(dto.getUsername());
        if(StringUtils.hasText(dto.getPassword()))user.setPassword(encoder.encode(dto.getPassword()));
        log.info("new password: {}", user.getPassword());

        repository.save(user);
    }

    /**
     * 회원 탈퇴
     * @param user: 탈퇴할 회원
     */
    @Transactional
    public void deleteUser(User user) {
        repository.delete(user);
    }
}

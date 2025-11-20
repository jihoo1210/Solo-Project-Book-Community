/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스 클래스.
 * 주로 회원가입, 사용자 정보 조회/수정 등의 작업을 수행합니다.
 */
package com.example.backend.service;

import com.example.backend.dto.auth.UsernameResponse;
import com.example.backend.dto.auth.CheckEmailResponse;
import com.example.backend.dto.auth.CheckUsernameResponse;
import com.example.backend.dto.auth.signup.SignupRequest;
import com.example.backend.dto.auth.signup.SignupResponse;
import com.example.backend.dto.auth.verify.VerifyCodeRequest;
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

import static com.example.backend.entity.utilities.Role.ROLE_TEMP;
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

    /**
     * 이메일 중복 여부 검사 메서드
     * @param email 이메일
     * @return 이메일 중복 여부 boolean 값
     */
    public CheckEmailResponse isEmailAvailable(String email) {

        if(repository.existsByEmail(email)) {
            return CheckEmailResponse.builder()
                    .isAvailable(false)
                    .build();
        } else {
            return CheckEmailResponse.builder()
                    .isAvailable(true)
                    .build();
        }
    }

    /**
     * 회원명 증복 여부 검사 메서드
     * @param username 회원명
     * @return 회원명 중복 여부 boolean 값
     */
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
     * 회원 정보 수정 메서드
     * @param user 수정할 회원
     * @param dto 수정할 회원 정보
     */
    @Transactional
    public void changeUserInfo(User user, ChangeUserInfoRequest dto) {
        if(StringUtils.hasText(dto.getUsername())) user.setUsername(dto.getUsername());
        if(StringUtils.hasText(dto.getPassword())) user.setPassword(encoder.encode(dto.getPassword()));
        log.info("new password: {}", user.getPassword());

        repository.save(user);
    }

    /**
     * 회원 탈퇴
     * @param user: 탈퇴할 회원
     */
    @Transactional
    public void deleteUser(User user) {
        User target = repository.findById(user.getId()).orElseThrow(() -> new IllegalArgumentException("해당 회원이 존재하지 않습니다."));
        repository.delete(target);
    }

    /**
     * 이메일로 회원명 가져오기
     * @param email 이메일
     * @return 회원명
     */
    public UsernameResponse getUsernameByEmail(String email) {
        User target = repository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        log.info("User: {}", target);
        return UsernameResponse.builder().username(target.getUsername()).build();
    }

    /**
     * 회원 권한 TEMP로 설정
     * @param dto 회원 이메일
     */
    public void createTempUser(VerifyCodeRequest dto) {
        User user = repository.findByEmail(dto.getEmail()).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        user.setAuthority(ROLE_TEMP);
        log.info("temp user: {}", user);
    }
}

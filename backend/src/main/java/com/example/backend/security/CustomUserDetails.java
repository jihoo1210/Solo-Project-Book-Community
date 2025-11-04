/**
 * Spring Security의 UserDetails 인터페이스를 구현한 클래스.
 * 데이터베이스의 실제 사용자(User) 정보를 Spring Security의 인증/인가 시스템이
 * 사용할 수 있는 형태로 래핑(Wrapping)하여 제공합니다.
 */

package com.example.backend.security;

import com.example.backend.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static com.example.backend.entity.Role.ROLE_ADMIN;
import static com.example.backend.entity.Role.ROLE_USER;

@RequiredArgsConstructor
@Getter
public class CustomUserDetails implements UserDetails {

    // 데이터베이스에서 조회된 실제 사용자 엔티티 객체
    private final User user;

    /**
     * 사용자의 고유 식별자(ID)를 반환합니다.
     * Spring Security에서 Principal로 사용됩니다.
     * @return 사용자 엔티티의 이메일 주소
     */
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    /**
     * 사용자의 비밀번호를 반환합니다.
     * 인증(Authentication) 과정에서 제출된 비밀번호와 비교됩니다.
     * @return 사용자 엔티티의 암호화된 비밀번호
     */
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    /**
     * 사용자에게 부여된 권한 목록을 반환합니다.
     * 인가(Authorization) 과정에서 사용됩니다.
     * @return SimpleGrantedAuthority 객체 리스트 (사용자의 권한 목록)
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_TEMP"));
        if(user.getAuthority().equals(ROLE_USER)) { authorities.add(new SimpleGrantedAuthority("ROLE_USER")); }
        if(user.getAuthority().equals(ROLE_ADMIN)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        return authorities;
    }
}

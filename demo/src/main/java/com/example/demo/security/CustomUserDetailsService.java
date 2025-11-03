/**
 * Spring Security의 핵심 인터페이스인 UserDetailsService를 구현한 클래스.
 * 사용자의 로그인 ID(여기서는 이메일)를 기반으로 데이터베이스에서 사용자 정보를 조회하고,
 * 이를 Spring Security가 사용할 수 있는 UserDetails 객체로 변환하여 반환합니다.
 */

package com.example.demo.security;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repository;

    /**
     * 사용자의 로그인 ID(username)를 기반으로 UserDetails 객체를 로드합니다.
     * 이 메소드는 Spring Security의 인증(Authentication) 과정에서 자동으로 호출됩니다.
     * @param username 사용자가 로그인 시도 시 입력한 ID (여기서는 이메일)
     * @return 로드된 사용자 정보를 담고 있는 CustomUserDetails 객체
     * @throws UsernameNotFoundException 해당 사용자 이름(ID)을 찾을 수 없을 때 발생
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("Can not find user by email."));
        return new CustomUserDetails(user);
    }
}

package com.gatiman.security;

import com.gatiman.entity.User;
import com.gatiman.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .or(() -> {
                    if (email != null && email.endsWith("@gmail.com")) {
                        String alias = email.replace("@gmail.com", "@gatiman.com");
                        return userRepository.findByEmail(alias);
                    } else if (email != null && email.endsWith("@gatiman.com")) {
                        String alias = email.replace("@gatiman.com", "@gmail.com");
                        return userRepository.findByEmail(alias);
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new CustomUserDetails(user);
    }
}

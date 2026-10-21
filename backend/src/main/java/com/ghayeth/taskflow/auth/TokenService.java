package com.ghayeth.taskflow.auth;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/**
 * Issues signed HS256 access tokens. Lifetime is configurable
 * (taskflow.jwt.ttl-minutes); a production system would add refresh tokens.
 */
@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;

    @Value("${taskflow.jwt.ttl-minutes}")
    private long ttlMinutes;

    public TokenService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public TokenResponse issueToken(String username) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(ttlMinutes * 60);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("taskflow")
                .subject(username)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("scope", "ROLE_USER")
                .build();

        // The key is symmetric (HS256), so the algorithm must be stated explicitly:
        // otherwise Spring looks for an RSA key by default.
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenResponse(token, username, expiresAt);
    }
}

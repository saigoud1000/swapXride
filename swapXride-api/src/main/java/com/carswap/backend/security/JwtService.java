package com.carswap.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.math.BigInteger;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.spec.*;
import java.util.Base64;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("email", String.class);
    }

    public String extractUserId(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean isUsernameValid = username.equals(userDetails.getUsername());
        boolean isExpired = isTokenExpired(token);
        System.out.println("Validating token for user: " + username);
        System.out.println("Username match: " + isUsernameValid);
        System.out.println("Is token expired: " + isExpired);
        return isUsernameValid && !isExpired;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    @Value("${jwt.use-local-secret:false}")
    private boolean useLocalSecret;

    private Key getSignInKey() {
        if (useLocalSecret) {
            return io.jsonwebtoken.security.Keys.hmacShaKeyFor(io.jsonwebtoken.io.Decoders.BASE64.decode(secretKey));
        }
        try {
            // Coordinate data from Supabase JWKS for kid:
            // ee9799bd-d1e1-42fb-a032-024a1d6e26b4
            String xBase64 = "RM0j0x5dUEB-ts4edcIf3KJGk831HaGMOtNJxhsDijQ";
            String yBase64 = "Teuy7sB2aK8XenpdWubKjoi_r-Ft2YTUWUWEnA9BPCs";

            byte[] xBytes = Base64.getUrlDecoder().decode(xBase64);
            byte[] yBytes = Base64.getUrlDecoder().decode(yBase64);

            BigInteger x = new BigInteger(1, xBytes);
            BigInteger y = new BigInteger(1, yBytes);

            ECPoint ecPoint = new ECPoint(x, y);

            // Get P-256 (SECP256R1) parameters
            AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
            params.init(new ECGenParameterSpec("secp256r1"));
            ECParameterSpec ecParameters = params.getParameterSpec(ECParameterSpec.class);

            ECPublicKeySpec publicKeySpec = new ECPublicKeySpec(ecPoint, ecParameters);
            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            return keyFactory.generatePublic(publicKeySpec);
        } catch (Exception e) {
            System.err.println("Failed to reconstruct ES256 Public Key: " + e.getMessage());
            // Fallback to legacy behavior if needed, but ES256 is now required
            throw new RuntimeException("Could not initialize JWT verification key", e);
        }
    }
}

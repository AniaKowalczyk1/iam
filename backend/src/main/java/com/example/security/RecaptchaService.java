package com.example.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret}")
    private String secretKey;

    public void verify(String token) {

        if (token == null || token.isBlank()) {
            throw new RuntimeException("Missing CAPTCHA token");
        }

        RestTemplate restTemplate = new RestTemplate();

        String url = "https://www.google.com/recaptcha/api/siteverify";

        MultiValueMap<String, String> request = new LinkedMultiValueMap<>();
        request.add("secret", secretKey);
        request.add("response", token);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                url,
                new HttpEntity<>(request, new HttpHeaders()),
                Map.class
        );

        Map body = response.getBody();

        Boolean success = (Boolean) body.get("success");

        if (success == null || !success) {
            throw new RuntimeException("CAPTCHA verification failed");
        }
    }
}
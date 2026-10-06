package com.cip.chatbot.service;

import com.cip.chatbot.dto.ChatDtos;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Per-user chat rate limiting backed by Redis (same increment+expire pattern as
 * api-gateway's RateLimitFilter, adapted to blocking StringRedisTemplate since this
 * is a regular Spring MVC service, not WebFlux).
 */
@Service
public class RateLimiter {

    private final StringRedisTemplate redisTemplate;

    private static final int LIMIT_PER_MINUTE = 15;
    private static final int LIMIT_PER_HOUR = 100;
    private static final int LIMIT_PER_DAY = 300;

    public RateLimiter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /** Returns true if the request is allowed (and increments the counters). */
    public boolean tryConsume(Long userId) {
        long minuteCount = increment("chat_rate:" + userId + ":minute", Duration.ofMinutes(1));
        long hourCount = increment("chat_rate:" + userId + ":hour", Duration.ofHours(1));
        long dayCount = increment("chat_rate:" + userId + ":day", Duration.ofDays(1));

        return minuteCount <= LIMIT_PER_MINUTE
                && hourCount <= LIMIT_PER_HOUR
                && dayCount <= LIMIT_PER_DAY;
    }

    public ChatDtos.RateLimitInfo getInfo(Long userId) {
        return ChatDtos.RateLimitInfo.builder()
                .remainingPerMinute(Math.max(0, LIMIT_PER_MINUTE - currentCount("chat_rate:" + userId + ":minute")))
                .remainingPerHour(Math.max(0, LIMIT_PER_HOUR - currentCount("chat_rate:" + userId + ":hour")))
                .remainingPerDay(Math.max(0, LIMIT_PER_DAY - currentCount("chat_rate:" + userId + ":day")))
                .limitPerMinute(LIMIT_PER_MINUTE)
                .limitPerHour(LIMIT_PER_HOUR)
                .limitPerDay(LIMIT_PER_DAY)
                .build();
    }

    private long increment(String key, Duration ttl) {
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redisTemplate.expire(key, ttl);
            }
            return count != null ? count : 0L;
        } catch (Exception e) {
            // Fail open if Redis is unavailable
            return 0L;
        }
    }

    private int currentCount(String key) {
        try {
            String value = redisTemplate.opsForValue().get(key);
            return value != null ? Integer.parseInt(value) : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}

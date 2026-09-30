package com.cip.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        // GenericJackson2JsonRedisSerializer's no-arg constructor builds its own plain ObjectMapper
        // with no modules registered — LocalDateTime fields (e.g. Score.calculatedAt) throw on
        // cache write unless JavaTimeModule is registered explicitly here.
        ObjectMapper redisObjectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper)))
                .disableCachingNullValues();

        // Custom TTLs per cache name
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("score",              defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("student-profile",    defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigs.put("all-jobs",           defaultConfig.entryTtl(Duration.ofMinutes(60)));
        cacheConfigs.put("recommended-jobs",   defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigs.put("roadmap",            defaultConfig.entryTtl(Duration.ofHours(2)));
        cacheConfigs.put("analytics",          defaultConfig.entryTtl(Duration.ofHours(1)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}

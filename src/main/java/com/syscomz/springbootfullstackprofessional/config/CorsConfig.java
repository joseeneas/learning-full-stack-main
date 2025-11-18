package com.syscomz.springbootfullstackprofessional.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Cross-Origin Resource Sharing (CORS) settings.
 * <p>
 * This class configures CORS mappings for the Spring Boot application, allowing
 * cross-origin requests from specified origins to access API endpoints.
 * </p>
 * 
 * <p>
 * The allowed origins are configurable through the application property
 * {@code app.cors.origins}, with a default value of {@code http://localhost:3000}.
 * Multiple origins can be specified as a comma-separated list.
 * </p>
 * 
 * <p>
 * CORS configuration:
 * <ul>
 *   <li>Mapped paths: /api/**</li>
 *   <li>Allowed HTTP methods: GET, POST, PUT, DELETE, OPTIONS</li>
 *   <li>Allowed headers: All (*)</li>
 *   <li>Credentials: Not allowed (false)</li>
 * </ul>
 * </p>
 * 
 * @see WebMvcConfigurer
 * @see CorsRegistry
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    public CorsConfig(@Value("${app.cors.origins:http://localhost:3000}") String origins) {
        this.allowedOrigins = Arrays.stream(origins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Override
    @SuppressWarnings("null")
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        String[] originsArray = allowedOrigins.toArray(new String[0]);

        registry.addMapping("/api/**")
            .allowedOrigins(originsArray)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}

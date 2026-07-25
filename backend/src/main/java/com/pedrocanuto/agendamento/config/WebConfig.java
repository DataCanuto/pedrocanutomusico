package com.pedrocanuto.agendamento.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS é registrado como {@link CorsFilter} (Servlet Filter puro), não via
 * {@code WebMvcConfigurer.addCorsMappings}. O suporte a CORS do Spring MVC só entra em ação
 * dentro do DispatcherServlet, na camada de handler mapping - mas {@link AdminApiKeyFilter}
 * roda ANTES do DispatcherServlet e, ao rejeitar uma requisição (401/403/429), escreve a
 * resposta direto e retorna sem nunca chegar lá. Resultado: a resposta de erro saía sem
 * Access-Control-Allow-Origin, e o navegador barrava com "CORS policy" em vez de deixar o
 * frontend ler o 401 de verdade - toda rota /api/admin/** parecia sempre quebrada quando a
 * chave estava errada, mesmo com CORS "configurado". Ordem HIGHEST_PRECEDENCE garante que este
 * filtro roda antes de AdminApiKeyFilter e adiciona o cabeçalho em toda resposta, inclusive nas
 * de erro.
 */
@Configuration
public class WebConfig {

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        FilterRegistrationBean<CorsFilter> registration = new FilterRegistrationBean<>(new CorsFilter(source));
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}

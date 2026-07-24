package com.pedrocanuto.agendamento.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Substituto deliberadamente simples para autenticação de verdade nas rotas /api/admin/**
 * (gerenciamento de preços, painel de agendamentos/clientes). PROJECT.md lista "login"
 * como funcionalidade futura (JWT/OAuth - ver CLAUDE.md), mas deixar essas rotas 100% abertas
 * violaria a regra de nunca confiar em dado do frontend / sempre validar. Troca por JWT é só
 * substituir este filtro por um de verdade, sem mexer nos controllers.
 */
@Component
public class AdminApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Admin-Key";

    private final String adminApiKey;

    public AdminApiKeyFilter(@Value("${app.admin.api-key}") String adminApiKey) {
        this.adminApiKey = adminApiKey;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().contains("/api/admin/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String chaveRecebida = request.getHeader(HEADER);
        if (adminApiKey == null || adminApiKey.isBlank() || !adminApiKey.equals(chaveRecebida)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":401,\"erro\":\"Não autorizado\",\"message\":\"Header X-Admin-Key ausente ou inválido\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}

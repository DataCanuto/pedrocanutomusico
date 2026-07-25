package com.pedrocanuto.agendamento.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Substituto deliberadamente simples para autenticação de verdade nas rotas /api/admin/**
 * (gerenciamento de preços, painel de agendamentos/clientes). PROJECT.md lista "login"
 * como funcionalidade futura (JWT/OAuth - ver CLAUDE.md), mas deixar essas rotas 100% abertas
 * violaria a regra de nunca confiar em dado do frontend / sempre validar. Troca por JWT é só
 * substituir este filtro por um de verdade, sem mexer nos controllers.
 *
 * <p>Duas proteções adicionais além da chave em si: {@code app.admin.exigir-https} rejeita
 * requisições não-HTTPS quando ligado (ver application-prod.properties - fica desligado em dev
 * para não quebrar localhost), e um rate limit simples em memória por IP contra tentativas de
 * força bruta na chave. Ambos são medidas paliativas até a troca por JWT/OAuth de verdade.
 */
@Component
public class AdminApiKeyFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Admin-Key";
    private static final int MAX_TENTATIVAS_FALHAS = 10;
    private static final Duration JANELA_RATE_LIMIT = Duration.ofMinutes(5);
    /** HttpServletResponse não define uma constante para 429 (fora do Servlet 4 spec). */
    private static final int SC_TOO_MANY_REQUESTS = 429;

    private final String adminApiKey;
    private final boolean exigirHttps;
    private final Map<String, List<Instant>> tentativasFalhasPorIp = new ConcurrentHashMap<>();

    public AdminApiKeyFilter(@Value("${app.admin.api-key}") String adminApiKey,
                              @Value("${app.admin.exigir-https:false}") boolean exigirHttps) {
        this.adminApiKey = adminApiKey;
        this.exigirHttps = exigirHttps;
    }

    /**
     * Preflight CORS (OPTIONS) nunca carrega o header X-Admin-Key - navegadores não reenviam
     * headers customizados nesse request (ver spec CORS). Se este filtro (que roda antes do
     * DispatcherServlet, logo antes da resposta de CORS do Spring) barrasse o preflight com 401,
     * o navegador nunca chegaria a ver o header Access-Control-Allow-Origin e bloquearia TODA
     * chamada às rotas /api/admin/** por erro de CORS, mesmo com a chave correta na requisição
     * real. A requisição real (GET/POST/...) que vem em seguida continua validada normalmente.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        return !request.getRequestURI().contains("/api/admin/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (exigirHttps && !requisicaoEhSegura(request)) {
            responderErro(response, HttpServletResponse.SC_FORBIDDEN, "Acesso negado", "HTTPS é obrigatório para acessar rotas administrativas");
            return;
        }

        String ip = request.getRemoteAddr();
        if (excedeuTentativas(ip)) {
            responderErro(response, SC_TOO_MANY_REQUESTS, "Muitas requisições",
                    "Muitas tentativas com chave inválida - aguarde alguns minutos e tente novamente");
            return;
        }

        String chaveRecebida = request.getHeader(HEADER);
        if (adminApiKey == null || adminApiKey.isBlank() || !adminApiKey.equals(chaveRecebida)) {
            registrarTentativaFalha(ip);
            responderErro(response, HttpServletResponse.SC_UNAUTHORIZED, "Não autorizado", "Header X-Admin-Key ausente ou inválido");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean requisicaoEhSegura(HttpServletRequest request) {
        if (request.isSecure()) {
            return true;
        }
        return "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }

    private boolean excedeuTentativas(String ip) {
        List<Instant> tentativas = tentativasFalhasPorIp.get(ip);
        if (tentativas == null) {
            return false;
        }
        limparTentativasForaDaJanela(tentativas);
        return tentativas.size() >= MAX_TENTATIVAS_FALHAS;
    }

    private void registrarTentativaFalha(String ip) {
        tentativasFalhasPorIp.computeIfAbsent(ip, chave -> new CopyOnWriteArrayList<>()).add(Instant.now());
    }

    private void limparTentativasForaDaJanela(List<Instant> tentativas) {
        Instant limite = Instant.now().minus(JANELA_RATE_LIMIT);
        tentativas.removeIf(instante -> instante.isBefore(limite));
    }

    private void responderErro(HttpServletResponse response, int status, String erro, String mensagem) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write("{\"status\":%d,\"erro\":\"%s\",\"message\":\"%s\"}".formatted(status, erro, mensagem));
    }
}

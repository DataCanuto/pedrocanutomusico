package com.pedrocanuto.agendamento.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AdminApiKeyFilterTest {

    private static final String CHAVE = "chave-secreta-de-teste";

    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain chain;
    private StringWriter corpoResposta;

    @BeforeEach
    void setUp() throws Exception {
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        chain = mock(FilterChain.class);
        corpoResposta = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(corpoResposta));
        when(request.getRequestURI()).thenReturn("/api/admin/clientes");
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");
    }

    @Test
    void deixaPassarComChaveCorreta() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.getHeader("X-Admin-Key")).thenReturn(CHAVE);

        filtro.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void rejeitaComChaveIncorreta() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.getHeader("X-Admin-Key")).thenReturn("errada");

        filtro.doFilterInternal(request, response, chain);

        verify(response).setStatus(401);
        verify(chain, never()).doFilter(any(), any());
        assertThat(corpoResposta.toString()).contains("Não autorizado");
    }

    @Test
    void bloqueiaComStatus429AposExcederLimiteDeTentativasFalhas() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.getHeader("X-Admin-Key")).thenReturn("errada");

        for (int i = 0; i < 10; i++) {
            filtro.doFilterInternal(request, response, chain);
        }
        filtro.doFilterInternal(request, response, chain);

        ArgumentCaptor<Integer> statusCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(response, org.mockito.Mockito.atLeast(11)).setStatus(statusCaptor.capture());
        assertThat(statusCaptor.getValue()).isEqualTo(429);
        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void naoBloqueiaIpDiferenteMesmoAposOutroIpExcederLimite() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.getHeader("X-Admin-Key")).thenReturn("errada");
        for (int i = 0; i < 10; i++) {
            filtro.doFilterInternal(request, response, chain);
        }

        when(request.getRemoteAddr()).thenReturn("10.0.0.2");
        when(request.getHeader("X-Admin-Key")).thenReturn(CHAVE);
        filtro.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void rejeitaRequisicaoNaoHttpsQuandoExigido() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, true);
        when(request.isSecure()).thenReturn(false);
        when(request.getHeader("X-Forwarded-Proto")).thenReturn(null);

        filtro.doFilterInternal(request, response, chain);

        verify(response).setStatus(403);
        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void aceitaRequisicaoHttpsViaHeaderXForwardedProto() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, true);
        when(request.isSecure()).thenReturn(false);
        when(request.getHeader("X-Forwarded-Proto")).thenReturn("https");
        when(request.getHeader("X-Admin-Key")).thenReturn(CHAVE);

        filtro.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void naoFiltraPreflightOptionsMesmoEmRotaAdmin() {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.getMethod()).thenReturn("OPTIONS");

        assertThat(filtro.shouldNotFilter(request)).isTrue();
    }

    @Test
    void filtraRequisicaoRealNaoOptionsEmRotaAdmin() {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.getMethod()).thenReturn("POST");

        assertThat(filtro.shouldNotFilter(request)).isFalse();
    }

    @Test
    void naoExigeHttpsQuandoDesligado() throws Exception {
        AdminApiKeyFilter filtro = new AdminApiKeyFilter(CHAVE, false);
        when(request.isSecure()).thenReturn(false);
        when(request.getHeader("X-Admin-Key")).thenReturn(CHAVE);

        filtro.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }
}

package com.pedrocanuto.agendamento.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

class AdminApiKeyStartupValidatorTest {

    @Test
    void naoValidaChaveQuandoPerfilProdNaoEstaAtivo() {
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(new String[] {});

        AdminApiKeyStartupValidator validator = new AdminApiKeyStartupValidator("changeme-dev-key", environment);

        assertThatCode(validator::validar).doesNotThrowAnyException();
    }

    @Test
    void rejeitaChavePadraoComPerfilProdAtivo() {
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(new String[] {"prod"});

        AdminApiKeyStartupValidator validator = new AdminApiKeyStartupValidator("changeme-dev-key", environment);

        assertThatThrownBy(validator::validar).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejeitaChaveEmBrancoComPerfilProdAtivo() {
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(new String[] {"prod"});

        AdminApiKeyStartupValidator validator = new AdminApiKeyStartupValidator(" ", environment);

        assertThatThrownBy(validator::validar).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void aceitaChaveForteComPerfilProdAtivo() {
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(new String[] {"prod"});

        AdminApiKeyStartupValidator validator = new AdminApiKeyStartupValidator("uma-chave-bem-forte-e-unica", environment);

        assertThatCode(validator::validar).doesNotThrowAnyException();
    }
}

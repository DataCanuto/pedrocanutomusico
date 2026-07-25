package com.pedrocanuto.agendamento.config;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Recusa subir a aplicação com a chave de admin padrão de desenvolvimento quando o perfil "prod"
 * está ativo - a proteção de /api/admin/** (ver AdminApiKeyFilter) só vale alguma coisa se a
 * chave não for a mesma publicada no repositório. Não afeta o perfil default/dev, onde a chave
 * de exemplo é conveniente.
 */
@Component
public class AdminApiKeyStartupValidator {

    private static final String CHAVE_PADRAO_DEV = "changeme-dev-key";

    private final String adminApiKey;
    private final Environment environment;

    public AdminApiKeyStartupValidator(@Value("${app.admin.api-key}") String adminApiKey, Environment environment) {
        this.adminApiKey = adminApiKey;
        this.environment = environment;
    }

    @PostConstruct
    void validar() {
        if (!Arrays.asList(environment.getActiveProfiles()).contains("prod")) {
            return;
        }
        if (adminApiKey == null || adminApiKey.isBlank() || adminApiKey.equals(CHAVE_PADRAO_DEV)) {
            throw new IllegalStateException(
                    "ADMIN_API_KEY não pode ficar em branco nem usar a chave padrão de desenvolvimento (\"" + CHAVE_PADRAO_DEV
                            + "\") com o perfil \"prod\" ativo - defina uma variável de ambiente com um valor forte antes do deploy.");
        }
    }
}

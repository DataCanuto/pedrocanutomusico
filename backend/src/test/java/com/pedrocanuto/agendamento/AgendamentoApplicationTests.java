package com.pedrocanuto.agendamento;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Sobe o contexto Spring completo: aplica as migrations Flyway no H2 de teste e valida (via
 * hibernate.ddl-auto=validate) que toda entidade JPA bate exatamente com o schema criado por
 * elas - os testes com Mockito não pegam esse tipo de divergência, só um contexto real pega.
 */
@SpringBootTest
class AgendamentoApplicationTests {

    @Test
    void contextLoads() {
    }

}

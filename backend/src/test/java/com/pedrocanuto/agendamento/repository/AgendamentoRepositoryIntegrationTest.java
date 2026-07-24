package com.pedrocanuto.agendamento.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * Exercita a cadeia Cliente -> Endereco -> Aluno -> PrecoServico -> Matricula -> Agendamento
 * contra o schema real (via Flyway+H2), não contra mocks - principalmente para confirmar que
 * o cálculo de aulasRestantes (contratadas menos não-canceladas) funciona do jeito que
 * MatriculaService espera, já que esse é o mecanismo que substitui um contador mutável.
 */
@SpringBootTest
@Transactional
class AgendamentoRepositoryIntegrationTest {

    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private AlunoRepository alunoRepository;
    @Autowired
    private PrecoServicoRepository precoServicoRepository;
    @Autowired
    private MatriculaRepository matriculaRepository;
    @Autowired
    private AgendamentoRepository agendamentoRepository;

    @Test
    void persisteCadeiaCompletaComEnderecoEEncontraClientePorTelefone() {
        Cliente cliente = new Cliente();
        cliente.setNome("Maria Souza");
        cliente.setTelefone("71999588950");
        Endereco endereco = new Endereco();
        endereco.setCep("40000000");
        endereco.setRua("Rua das Flores");
        endereco.setNumero("123");
        endereco.setBairro("Barra");
        endereco.setCidade("Salvador");
        endereco.setEstado("BA");
        endereco.setCliente(cliente);
        cliente.getEnderecos().add(endereco);
        clienteRepository.save(cliente);

        Cliente encontrado = clienteRepository.findByTelefone("71999588950").orElseThrow();
        assertThat(encontrado.getEnderecos()).hasSize(1);
        assertThat(encontrado.getEnderecos().get(0).getCidade()).isEqualTo("Salvador");
    }

    @Test
    void aulasRestantesExcluiApenasAgendamentosCancelados() {
        Matricula matricula = criarMatriculaDePacote4();

        Agendamento primeiraAula = novoAgendamentoParaMatricula(matricula, LocalDate.now().plusDays(1));
        primeiraAula.setStatus(EStatusAgendamento.AGENDADO);
        agendamentoRepository.save(primeiraAula);

        Agendamento segundaAula = novoAgendamentoParaMatricula(matricula, LocalDate.now().plusDays(8));
        segundaAula.setStatus(EStatusAgendamento.CANCELADO);
        agendamentoRepository.save(segundaAula);

        long naoCanceladas = agendamentoRepository.countByMatriculaIdAndStatusNot(matricula.getId(), EStatusAgendamento.CANCELADO);
        long aulasRestantes = matricula.getAulasContratadas() - naoCanceladas;

        assertThat(naoCanceladas).isEqualTo(1);
        assertThat(aulasRestantes).isEqualTo(3);
    }

    private Matricula criarMatriculaDePacote4() {
        Cliente cliente = new Cliente();
        cliente.setNome("Carlos Lima");
        cliente.setTelefone("71988887777");
        clienteRepository.save(cliente);

        Aluno aluno = new Aluno();
        aluno.setNome("Carlos Lima");
        aluno.setDataNascimento(LocalDate.now().minusYears(30));
        aluno.setResponsavel(cliente);
        aluno.setEhProprioResponsavel(true);
        alunoRepository.save(aluno);

        PrecoServico preco = precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_4).orElseThrow();

        Matricula matricula = new Matricula();
        matricula.setCliente(cliente);
        matricula.setAluno(aluno);
        matricula.setPrecoServico(preco);
        matricula.setTipoContratacao(ETipoContratacao.PACOTE_4);
        matricula.setValorTotal(preco.getValor());
        matricula.setAulasContratadas(4);
        matricula.setStatus(EStatusMatricula.ATIVA);
        return matriculaRepository.save(matricula);
    }

    private Agendamento novoAgendamentoParaMatricula(Matricula matricula, LocalDate data) {
        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(matricula.getCliente());
        agendamento.setAluno(matricula.getAluno());
        agendamento.setMatricula(matricula);
        agendamento.setPrecoServico(matricula.getPrecoServico());
        agendamento.setCategoria(ECategoriaServico.MUSICALIZACAO_INFANTIL);
        agendamento.setValorCobrado(matricula.getValorTotal());
        agendamento.setDuracaoMinutos(50);
        agendamento.setData(data);
        agendamento.setHora(LocalTime.of(10, 0));
        return agendamento;
    }
}

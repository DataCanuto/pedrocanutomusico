package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.dto.request.AlunoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoSelecaoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoCriadoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaComAlunosResponseDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TurmaServiceTest {

    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private TurmaMapper turmaMapper;
    @Mock
    private ClienteService clienteService;
    @Mock
    private AgendamentoService agendamentoService;

    private TurmaService turmaService;

    @BeforeEach
    void setUp() {
        turmaService = new TurmaService(turmaRepository, agendamentoRepository, turmaMapper, clienteService,
                agendamentoService, new AgendamentoValidator());
    }

    @Test
    void criarRejeitaCategoriaEvento() {
        TurmaRequestDTO dto = new TurmaRequestDTO(ECategoriaServico.EVENTO, null, DayOfWeek.TUESDAY, LocalTime.of(10, 0), enderecoDTO());

        assertThatThrownBy(() -> turmaService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("EVENTO");
    }

    @Test
    void criarGeraCodigoENaoReutilizaColisao() {
        when(turmaRepository.existsByCodigo(any())).thenReturn(true, false);
        when(turmaMapper.toEntity(any())).thenReturn(new Turma());
        when(turmaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        TurmaRequestDTO dto = new TurmaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, null, DayOfWeek.TUESDAY, LocalTime.of(10, 0), enderecoDTO());
        turmaService.criar(dto);

        ArgumentCaptor<Turma> captor = ArgumentCaptor.forClass(Turma.class);
        verify(turmaRepository).save(captor.capture());
        assertThat(captor.getValue().getCodigo()).hasSize(6);
    }

    @Test
    void criarExigeInstrumentoParaCategoriaAulaInstrumento() {
        TurmaRequestDTO dto = new TurmaRequestDTO(ECategoriaServico.AULA_INSTRUMENTO, null, DayOfWeek.TUESDAY, LocalTime.of(10, 0), enderecoDTO());

        assertThatThrownBy(() -> turmaService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("instrumento");
    }

    @Test
    void criarRejeitaInstrumentoForaDeAulaInstrumento() {
        TurmaRequestDTO dto = new TurmaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, EInstrumento.VIOLAO,
                DayOfWeek.TUESDAY, LocalTime.of(10, 0), enderecoDTO());

        assertThatThrownBy(() -> turmaService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("instrumento");
    }

    @Test
    void inscreverEmTurmaEncerradaLancaExcecao() {
        Turma turma = new Turma();
        turma.setStatus(EStatusTurma.ENCERRADA);
        when(turmaRepository.findByCodigo("ABC123")).thenReturn(Optional.of(turma));

        InscricaoTurmaRequestDTO dto = inscricaoDTO();

        assertThatThrownBy(() -> turmaService.inscrever("abc123", dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("inscrições");
    }

    @Test
    void inscreverDelegaParaAgendamentoServiceComDadosDaTurma() {
        Turma turma = new Turma();
        turma.setStatus(EStatusTurma.ATIVA);
        turma.setCategoria(ECategoriaServico.MUSICALIZACAO_INFANTIL);
        turma.setDiaSemana(DayOfWeek.TUESDAY);
        turma.setHora(LocalTime.of(15, 0));
        turma.setLocal("Estúdio Pedro Canuto");
        when(turmaRepository.findByCodigo("XYZ999")).thenReturn(Optional.of(turma));

        Cliente cliente = new Cliente();
        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        AgendamentoCriadoResponseDTO resposta = new AgendamentoCriadoResponseDTO(1L, List.of());
        when(agendamentoService.criarInscricaoTurma(any(), any(), any(), any(), any())).thenReturn(resposta);

        InscricaoTurmaRequestDTO dto = inscricaoDTO();
        assertThat(turmaService.inscrever("xyz999", dto)).isSameAs(resposta);

        verify(agendamentoService).criarInscricaoTurma(
                eq(cliente), eq(dto.aluno()), eq(turma), eq(ETipoContratacao.PACOTE_4), eq(dto.observacoes()));
    }

    @Test
    void listarComAlunosAgrupaPorTurmaDedupPorAlunoEOrdenaPorDiaEHora() {
        Turma turmaQuarta = new Turma();
        turmaQuarta.setId(2L);
        turmaQuarta.setCategoria(ECategoriaServico.AULA_INSTRUMENTO);
        turmaQuarta.setInstrumento(EInstrumento.VIOLAO);
        turmaQuarta.setDiaSemana(DayOfWeek.WEDNESDAY);
        turmaQuarta.setHora(LocalTime.of(9, 0));
        turmaQuarta.setStatus(EStatusTurma.ATIVA);

        Turma turmaSegunda = new Turma();
        turmaSegunda.setId(1L);
        turmaSegunda.setCategoria(ECategoriaServico.MUSICALIZACAO_INFANTIL);
        turmaSegunda.setDiaSemana(DayOfWeek.MONDAY);
        turmaSegunda.setHora(LocalTime.of(16, 0));
        turmaSegunda.setStatus(EStatusTurma.ATIVA);

        // findAll() devolve fora de ordem de propósito, para provar que a ordenação por dia/hora é feita em Java (ver Javadoc de listarComAlunos)
        when(turmaRepository.findAll()).thenReturn(List.of(turmaQuarta, turmaSegunda));

        Cliente responsavel = new Cliente();
        responsavel.setNome("Maria Souza");
        responsavel.setTelefone("71999588950");
        Endereco endereco = new Endereco();
        endereco.setRua("Av. Oceânica");
        endereco.setNumero("500");
        endereco.setBairro("Pituba");
        endereco.setCidade("Salvador");
        endereco.setEstado("BA");
        responsavel.getEnderecos().add(endereco);

        Aluno sofia = new Aluno();
        sofia.setId(10L);
        sofia.setNome("Sofia Souza");
        sofia.setDataNascimento(LocalDate.now().minusYears(6));
        sofia.setResponsavel(responsavel);

        // Duas aulas do mesmo pacote/turma para a mesma aluna - precisa deduplicar por aluno.id.
        Agendamento aula1 = new Agendamento();
        aula1.setTurma(turmaSegunda);
        aula1.setAluno(sofia);
        Agendamento aula2 = new Agendamento();
        aula2.setTurma(turmaSegunda);
        aula2.setAluno(sofia);
        when(agendamentoRepository.listarComTurmaEAluno()).thenReturn(List.of(aula1, aula2));

        List<TurmaComAlunosResponseDTO> resultado = turmaService.listarComAlunos();

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).diaSemana()).isEqualTo(DayOfWeek.MONDAY);
        assertThat(resultado.get(1).diaSemana()).isEqualTo(DayOfWeek.WEDNESDAY);

        assertThat(resultado.get(0).alunos()).hasSize(1);
        assertThat(resultado.get(0).alunos().get(0).nomeAluno()).isEqualTo("Sofia Souza");
        assertThat(resultado.get(0).alunos().get(0).telefone()).isEqualTo("71999588950");
        assertThat(resultado.get(0).alunos().get(0).endereco()).isEqualTo("Av. Oceânica, 500 - Pituba, Salvador/BA");

        assertThat(resultado.get(1).alunos()).isEmpty();
    }

    private EnderecoRequestDTO enderecoDTO() {
        return new EnderecoRequestDTO("41700-000", "Av. Oceânica", "500", "Pituba", "Salvador", "BA", "Estúdio");
    }

    private InscricaoTurmaRequestDTO inscricaoDTO() {
        ClienteRequestDTO cliente = new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null,
                List.of(enderecoDTO()));
        AlunoSelecaoRequestDTO aluno = new AlunoSelecaoRequestDTO(false,
                new AlunoRequestDTO("Sofia Souza", LocalDate.now().minusYears(6), null, null));
        return new InscricaoTurmaRequestDTO(cliente, aluno, ETipoContratacao.PACOTE_4, null);
    }
}

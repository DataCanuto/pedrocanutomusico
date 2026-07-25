package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Cliente;
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
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
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
    private TurmaMapper turmaMapper;
    @Mock
    private ClienteService clienteService;
    @Mock
    private AgendamentoService agendamentoService;

    private TurmaService turmaService;

    @BeforeEach
    void setUp() {
        turmaService = new TurmaService(turmaRepository, turmaMapper, clienteService, agendamentoService,
                new AgendamentoValidator());
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

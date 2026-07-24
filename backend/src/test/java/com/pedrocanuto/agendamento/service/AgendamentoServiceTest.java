package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import com.pedrocanuto.agendamento.dto.request.AgendamentoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AgendarProximaAulaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoSelecaoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AnamneseMusicoterapiaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.AgendamentoMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private ClienteService clienteService;
    @Mock
    private AlunoService alunoService;
    @Mock
    private PrecoServicoService precoServicoService;
    @Mock
    private MatriculaService matriculaService;
    @Mock
    private AnamneseService anamneseService;
    @Mock
    private AgendamentoMapper agendamentoMapper;

    private AgendamentoService agendamentoService;

    @BeforeEach
    void setUp() {
        agendamentoService = new AgendamentoService(agendamentoRepository, clienteService, alunoService,
                precoServicoService, matriculaService, anamneseService, new AgendamentoValidator(), agendamentoMapper);
        // toResponseDTO fica sem stub de propósito: nenhum teste aqui verifica o DTO de saída,
        // só o que é passado para o repository - um mock devolve null por padrão, o que basta.
    }

    @Test
    void criarAulaUsaDuracaoEValorDoCatalogoESaldoDaMatricula() {
        Cliente cliente = new Cliente();
        cliente.setId(1L);
        Aluno aluno = new Aluno();
        aluno.setId(2L);
        aluno.setDataNascimento(LocalDate.now().minusYears(3));
        PrecoServico preco = precoMusicalizacaoIndividualAvulso();
        Matricula matricula = matriculaDe(preco, ETipoContratacao.AVULSO);

        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(aluno);
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO))
                .thenReturn(preco);
        when(matriculaService.criar(any(), any(), any(), any(), any())).thenReturn(matricula);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);
        when(agendamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        agendamentoService.criar(aulaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, ETipoContratacao.AVULSO));

        ArgumentCaptor<Agendamento> captor = ArgumentCaptor.forClass(Agendamento.class);
        verify(agendamentoRepository).save(captor.capture());
        assertThat(captor.getValue().getDuracaoMinutos()).isEqualTo(30);
        assertThat(captor.getValue().getValorCobrado()).isEqualByComparingTo("150.00");
        assertThat(captor.getValue().getMatricula()).isSameAs(matricula);
        verify(anamneseService, never()).criarSeAusente(any(), any());
    }

    @Test
    void criarMusicoterapiaComAnamneseAcionaAnamneseServiceCriarSeAusente() {
        Cliente cliente = new Cliente();
        Aluno aluno = new Aluno();
        aluno.setId(9L);
        aluno.setDataNascimento(LocalDate.now().minusYears(6));
        PrecoServico preco = precoMusicoterapiaIndividualAvulso();
        Matricula matricula = matriculaDe(preco, ETipoContratacao.AVULSO);

        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(aluno);
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(
                ECategoriaServico.MUSICOTERAPIA, EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO))
                .thenReturn(preco);
        when(matriculaService.criar(any(), any(), any(), any(), any())).thenReturn(matricula);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);
        when(agendamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AnamneseMusicoterapiaRequestDTO anamnese = anamneseDTO();
        agendamentoService.criar(musicoterapiaRequestDTO(anamnese));

        verify(anamneseService).criarSeAusente(aluno, anamnese);
    }

    @Test
    void criarMusicoterapiaSemAnamneseAindaAssimChamaCriarSeAusenteComNulo() {
        Cliente cliente = new Cliente();
        Aluno aluno = new Aluno();
        aluno.setId(10L);
        aluno.setDataNascimento(LocalDate.now().minusYears(6));
        PrecoServico preco = precoMusicoterapiaIndividualAvulso();
        Matricula matricula = matriculaDe(preco, ETipoContratacao.AVULSO);

        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(aluno);
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(
                ECategoriaServico.MUSICOTERAPIA, EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO))
                .thenReturn(preco);
        when(matriculaService.criar(any(), any(), any(), any(), any())).thenReturn(matricula);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);
        when(agendamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        agendamentoService.criar(musicoterapiaRequestDTO(null));

        // AnamneseService.criarSeAusente decide sozinho o que fazer com dto nulo (idempotência é
        // responsabilidade dele, não do AgendamentoService).
        verify(anamneseService).criarSeAusente(aluno, null);
    }

    @Test
    void criarAulaComPacoteDivideValorTotalPelaQuantidadeDeAulas() {
        Cliente cliente = new Cliente();
        Aluno aluno = new Aluno();
        aluno.setDataNascimento(LocalDate.now().minusYears(8));
        PrecoServico preco = precoMusicalizacaoIndividualAvulso();
        Matricula matricula = matriculaDe(preco, ETipoContratacao.PACOTE_3);
        matricula.setValorTotal(new BigDecimal("430.00"));

        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(aluno);
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(any(), any(), any())).thenReturn(preco);
        when(matriculaService.criar(any(), any(), any(), any(), any())).thenReturn(matricula);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);
        when(agendamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        agendamentoService.criar(aulaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, ETipoContratacao.PACOTE_3));

        ArgumentCaptor<Agendamento> captor = ArgumentCaptor.forClass(Agendamento.class);
        verify(agendamentoRepository).save(captor.capture());
        // 430.00 / 3 aulas = 143.33 (arredondado)
        assertThat(captor.getValue().getValorCobrado()).isEqualByComparingTo("143.33");
    }

    @Test
    void criarComHorarioJaOcupadoLancaExcecaoENaoSalva() {
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(() -> agendamentoService.criar(aulaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, ETipoContratacao.AVULSO)))
                .isInstanceOf(RegraDeNegocioException.class);

        verify(agendamentoRepository, never()).save(any());
        verify(clienteService, never()).buscarOuCriar(any());
    }

    @Test
    void criarComHorarioForaDaGradeDe15MinutosLancaExcecao() {
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(clienteDTO(),
                new AlunoSelecaoRequestDTO(false, new AlunoRequestDTO("Sofia Souza", LocalDate.now().minusYears(3), null, null)),
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, null,
                null, null, null, null, null, null,
                LocalDate.now().plusDays(3), LocalTime.of(10, 10), null);

        assertThatThrownBy(() -> agendamentoService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("15 minutos");
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void criarEventoComPacoteDePrecoFixoJaCobraNaCriacao() {
        Cliente cliente = new Cliente();
        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);
        when(agendamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PrecoServico pacote = pacoteDeEvento("Roda de Música com Banda das Crianças", new BigDecimal("600.00"), 60);
        when(precoServicoService.buscarPacoteDeEvento(1L)).thenReturn(pacote);

        agendamentoService.criar(eventoRequestDTO(1L, null));

        ArgumentCaptor<Agendamento> captor = ArgumentCaptor.forClass(Agendamento.class);
        verify(agendamentoRepository).save(captor.capture());
        assertThat(captor.getValue().getMatricula()).isNull();
        assertThat(captor.getValue().getValorCobrado()).isEqualByComparingTo("600.00");
        assertThat(captor.getValue().getDuracaoMinutos()).isEqualTo(60);
        verify(matriculaService, never()).criar(any(), any(), any(), any(), any());
    }

    @Test
    void criarEventoComPacoteSobConsultaDeixaValorCobradoNulo() {
        Cliente cliente = new Cliente();
        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);
        when(agendamentoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PrecoServico pacoteSobConsulta = pacoteDeEvento("Festa Temática", null, null);
        when(precoServicoService.buscarPacoteDeEvento(2L)).thenReturn(pacoteSobConsulta);

        agendamentoService.criar(eventoRequestDTO(2L, 180));

        ArgumentCaptor<Agendamento> captor = ArgumentCaptor.forClass(Agendamento.class);
        verify(agendamentoRepository).save(captor.capture());
        assertThat(captor.getValue().getValorCobrado()).isNull();
        assertThat(captor.getValue().getDuracaoMinutos()).isEqualTo(180);
    }

    @Test
    void criarEventoComPacoteSobConsultaSemDuracaoInformadaLancaExcecao() {
        Cliente cliente = new Cliente();
        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        when(agendamentoRepository.existsByDataAndHoraAndStatusNot(any(), any(), any())).thenReturn(false);

        PrecoServico pacoteSobConsulta = pacoteDeEvento("Festa Temática", null, null);
        when(precoServicoService.buscarPacoteDeEvento(2L)).thenReturn(pacoteSobConsulta);

        assertThatThrownBy(() -> agendamentoService.criar(eventoRequestDTO(2L, null)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("duração");
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void agendarProximaAulaSemSaldoRestanteLancaExcecao() {
        Matricula matricula = new Matricula();
        matricula.setId(10L);
        matricula.setStatus(EStatusMatricula.ATIVA);
        when(matriculaService.buscarComLockPorId(10L)).thenReturn(matricula);
        when(matriculaService.calcularAulasRestantes(matricula)).thenReturn(0L);

        AgendarProximaAulaRequestDTO dto = new AgendarProximaAulaRequestDTO(LocalDate.now().plusDays(2), LocalTime.of(9, 0), null);

        assertThatThrownBy(() -> agendamentoService.agendarProximaAula(10L, dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("aulas restantes");
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void agendarProximaAulaContraMatriculaCanceladaLancaExcecao() {
        Matricula matricula = new Matricula();
        matricula.setId(11L);
        matricula.setStatus(EStatusMatricula.CANCELADA);
        when(matriculaService.buscarComLockPorId(11L)).thenReturn(matricula);

        AgendarProximaAulaRequestDTO dto = new AgendarProximaAulaRequestDTO(LocalDate.now().plusDays(2), LocalTime.of(9, 0), null);

        assertThatThrownBy(() -> agendamentoService.agendarProximaAula(11L, dto))
                .isInstanceOf(RegraDeNegocioException.class);
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void transicaoDeStatusIlegalLancaExcecao() {
        Agendamento agendamento = new Agendamento();
        agendamento.setId(5L);
        agendamento.setStatus(EStatusAgendamento.FINALIZADO);
        when(agendamentoRepository.findById(5L)).thenReturn(java.util.Optional.of(agendamento));

        assertThatThrownBy(() -> agendamentoService.confirmar(5L))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void checkInRegistraDataHoraAutomaticamente() {
        Agendamento agendamento = new Agendamento();
        agendamento.setId(6L);
        agendamento.setStatus(EStatusAgendamento.CONFIRMADO);
        when(agendamentoRepository.findById(6L)).thenReturn(java.util.Optional.of(agendamento));

        agendamentoService.checkIn(6L);

        assertThat(agendamento.getDataHoraCheckIn()).isNotNull();
    }

    private PrecoServico precoMusicalizacaoIndividualAvulso() {
        PrecoServico preco = new PrecoServico();
        preco.setCategoria(ECategoriaServico.MUSICALIZACAO_INFANTIL);
        preco.setModalidade(EModalidadeServico.INDIVIDUAL);
        preco.setTipoContratacao(ETipoContratacao.AVULSO);
        preco.setValor(new BigDecimal("150.00"));
        preco.setDuracaoPadraoMinutos(30);
        return preco;
    }

    private PrecoServico precoMusicoterapiaIndividualAvulso() {
        PrecoServico preco = new PrecoServico();
        preco.setCategoria(ECategoriaServico.MUSICOTERAPIA);
        preco.setModalidade(EModalidadeServico.INDIVIDUAL);
        preco.setTipoContratacao(ETipoContratacao.AVULSO);
        preco.setValor(new BigDecimal("180.00"));
        preco.setDuracaoPadraoMinutos(50);
        return preco;
    }

    private Matricula matriculaDe(PrecoServico preco, ETipoContratacao tipoContratacao) {
        Matricula matricula = new Matricula();
        matricula.setPrecoServico(preco);
        matricula.setTipoContratacao(tipoContratacao);
        matricula.setValorTotal(preco.getValor());
        return matricula;
    }

    private PrecoServico pacoteDeEvento(String nome, BigDecimal valor, Integer duracaoPadraoMinutos) {
        PrecoServico preco = new PrecoServico();
        preco.setCategoria(ECategoriaServico.EVENTO);
        preco.setNome(nome);
        preco.setValor(valor);
        preco.setDuracaoPadraoMinutos(duracaoPadraoMinutos);
        return preco;
    }

    private AgendamentoRequestDTO aulaRequestDTO(ECategoriaServico categoria, ETipoContratacao tipoContratacao) {
        AlunoSelecaoRequestDTO aluno = new AlunoSelecaoRequestDTO(false,
                new AlunoRequestDTO("Sofia Souza", LocalDate.now().minusYears(3), null, null));
        return new AgendamentoRequestDTO(clienteDTO(), aluno, categoria, EModalidadeServico.INDIVIDUAL,
                tipoContratacao, null, null, null, null, null, null, null,
                LocalDate.now().plusDays(3), LocalTime.of(10, 0), null);
    }

    private AgendamentoRequestDTO musicoterapiaRequestDTO(AnamneseMusicoterapiaRequestDTO anamnese) {
        AlunoSelecaoRequestDTO aluno = new AlunoSelecaoRequestDTO(false,
                new AlunoRequestDTO("Sofia Souza", LocalDate.now().minusYears(6), null, null));
        return new AgendamentoRequestDTO(clienteDTO(), aluno, ECategoriaServico.MUSICOTERAPIA, EModalidadeServico.INDIVIDUAL,
                ETipoContratacao.AVULSO, null, null, null, null, null, null, anamnese,
                LocalDate.now().plusDays(3), LocalTime.of(10, 0), null);
    }

    private AnamneseMusicoterapiaRequestDTO anamneseDTO() {
        return new AnamneseMusicoterapiaRequestDTO(
                6, null, null, null, "Encaminhamento escolar", null, null, null, null, null, null, null, null, null);
    }

    private AgendamentoRequestDTO eventoRequestDTO(Long eventoPrecoServicoId, Integer duracaoMinutosEvento) {
        EnderecoRequestDTO endereco = new EnderecoRequestDTO("41700-000", "Av. Oceânica", "500", "Pituba", "Salvador", "BA", "Salão X");
        return new AgendamentoRequestDTO(clienteDTO(), null, ECategoriaServico.EVENTO, null, null, null,
                ETipoEvento.ANIVERSARIO, eventoPrecoServicoId, endereco, duracaoMinutosEvento,
                List.of("Parabéns pra Você"), null, LocalDate.now().plusDays(7), LocalTime.of(16, 0), "Festa");
    }

    private ClienteRequestDTO clienteDTO() {
        return new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null,
                List.of(new EnderecoRequestDTO("41700-000", "Av. Oceânica", "500", "Pituba", "Salvador", "BA", null)));
    }
}

package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.dto.request.AlunoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoSelecaoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.InscricaoTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaComAlunosResponseDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private MatriculaRepository matriculaRepository;
    @Mock
    private TurmaMapper turmaMapper;
    @Mock
    private ClienteService clienteService;
    @Mock
    private AlunoService alunoService;
    @Mock
    private PrecoServicoService precoServicoService;
    @Mock
    private MatriculaService matriculaService;
    @Mock
    private AgendamentoService agendamentoService;

    private TurmaService turmaService;

    @BeforeEach
    void setUp() {
        turmaService = new TurmaService(turmaRepository, matriculaRepository, turmaMapper, clienteService, alunoService,
                precoServicoService, matriculaService, agendamentoService, new AgendamentoValidator());
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

    /**
     * TurmaService não tem @{code data} própria (turma é recorrente por dia da semana) - por isso
     * delega a checagem de conflito para {@link AgendamentoService#validarDisponibilidadeDeNovaTurma},
     * que resolve a próxima ocorrência desse dia da semana internamente.
     */
    @Test
    void criarValidaDisponibilidadeContraProximaOcorrenciaDoDiaDaSemana() {
        when(turmaRepository.existsByCodigo(any())).thenReturn(false);
        when(turmaMapper.toEntity(any())).thenReturn(new Turma());
        when(turmaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        TurmaRequestDTO dto = new TurmaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, null, DayOfWeek.TUESDAY, LocalTime.of(10, 0), enderecoDTO());
        turmaService.criar(dto);

        verify(agendamentoService).validarDisponibilidadeDeNovaTurma(DayOfWeek.TUESDAY, LocalTime.of(10, 0), ECategoriaServico.MUSICALIZACAO_INFANTIL);
    }

    @Test
    void criarPropagaExcecaoQuandoHorarioColideComCompromissoExistente() {
        doThrow(new RegraDeNegocioException("Horário indisponível - já existe um compromisso agendado que não deixa os 15 minutos de intervalo necessários antes/depois"))
                .when(agendamentoService).validarDisponibilidadeDeNovaTurma(any(), any(), any());

        TurmaRequestDTO dto = new TurmaRequestDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, null, DayOfWeek.TUESDAY, LocalTime.of(10, 0), enderecoDTO());

        assertThatThrownBy(() -> turmaService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("intervalo");

        verify(turmaRepository, never()).save(any());
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

    /**
     * Matricular um aluno numa Turma só registra o vínculo aluno<->turma (Matricula#turma) - não
     * gera Agendamento datado (ver TurmaService#inscrever). tipoContratacao continua decidindo o
     * pacote/valor de referência via PrecoServico GRUPO.
     */
    @Test
    void inscreverDelegaParaMatriculaServiceComDadosDaTurma() {
        Turma turma = turmaComEndereco();
        when(turmaRepository.findByCodigo("XYZ999")).thenReturn(Optional.of(turma));

        Cliente cliente = new Cliente();
        when(clienteService.buscarOuCriar(any())).thenReturn(cliente);
        Aluno aluno = new Aluno();
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(aluno);
        PrecoServico precoServico = new PrecoServico();
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.GRUPO, ETipoContratacao.PACOTE_4))
                .thenReturn(precoServico);
        Matricula matricula = new Matricula();
        when(matriculaService.criar(cliente, aluno, precoServico, ETipoContratacao.PACOTE_4, turma.getInstrumento(), turma))
                .thenReturn(matricula);
        InscricaoTurmaResponseDTO resposta = new InscricaoTurmaResponseDTO(1L, "XYZ999", ECategoriaServico.MUSICALIZACAO_INFANTIL,
                null, DayOfWeek.TUESDAY, LocalTime.of(15, 0), turma.getLocal(), ETipoContratacao.PACOTE_4, null);
        when(turmaMapper.toInscricaoResponseDTO(matricula, turma)).thenReturn(resposta);

        InscricaoTurmaRequestDTO dto = inscricaoDTO();
        assertThat(turmaService.inscrever("xyz999", dto)).isSameAs(resposta);
    }

    @Test
    void inscreverSemEnderecoUsaEnderecoDaTurma() {
        Turma turma = turmaComEndereco();
        when(turmaRepository.findByCodigo("XYZ999")).thenReturn(Optional.of(turma));
        when(clienteService.buscarOuCriar(any())).thenReturn(new Cliente());
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(new Aluno());
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(any(), any(), any())).thenReturn(new PrecoServico());
        when(matriculaService.criar(any(), any(), any(), any(), any(), any())).thenReturn(new Matricula());

        ClienteRequestDTO clienteSemEndereco =
                new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null, List.of());
        InscricaoTurmaRequestDTO dto = new InscricaoTurmaRequestDTO(clienteSemEndereco,
                new AlunoSelecaoRequestDTO(false, new AlunoRequestDTO("Sofia Souza", LocalDate.now().minusYears(6), null, null)),
                ETipoContratacao.PACOTE_4, null);

        turmaService.inscrever("xyz999", dto);

        ArgumentCaptor<ClienteRequestDTO> captor = ArgumentCaptor.forClass(ClienteRequestDTO.class);
        verify(clienteService).buscarOuCriar(captor.capture());
        assertThat(captor.getValue().enderecos()).containsExactly(
                new EnderecoRequestDTO("41700-000", "Av. Oceânica", "500", "Pituba", "Salvador", "BA", "Estúdio"));
        // Só o endereço é preenchido - o resto do cliente passa intacto.
        assertThat(captor.getValue().nome()).isEqualTo("Maria Souza");
        assertThat(captor.getValue().telefone()).isEqualTo("71999588950");
    }

    @Test
    void inscreverComEnderecoInformadoNaoSobrescreveComODaTurma() {
        Turma turma = turmaComEndereco();
        when(turmaRepository.findByCodigo("XYZ999")).thenReturn(Optional.of(turma));
        when(clienteService.buscarOuCriar(any())).thenReturn(new Cliente());
        when(alunoService.buscarOuCriarParaResponsavel(any(), any())).thenReturn(new Aluno());
        when(precoServicoService.buscarPorCategoriaModalidadeEPacote(any(), any(), any())).thenReturn(new PrecoServico());
        when(matriculaService.criar(any(), any(), any(), any(), any(), any())).thenReturn(new Matricula());

        InscricaoTurmaRequestDTO dto = inscricaoDTO();

        turmaService.inscrever("xyz999", dto);

        verify(clienteService).buscarOuCriar(dto.cliente());
    }

    @Test
    void inscreverSemEnderecoETurmaSemEnderecoEstruturadoLancaExcecao() {
        Turma turma = new Turma();
        turma.setStatus(EStatusTurma.ATIVA);
        when(turmaRepository.findByCodigo("XYZ999")).thenReturn(Optional.of(turma));

        ClienteRequestDTO clienteSemEndereco =
                new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null, List.of());
        InscricaoTurmaRequestDTO dto = new InscricaoTurmaRequestDTO(clienteSemEndereco,
                new AlunoSelecaoRequestDTO(false, new AlunoRequestDTO("Sofia Souza", LocalDate.now().minusYears(6), null, null)),
                ETipoContratacao.PACOTE_4, null);

        assertThatThrownBy(() -> turmaService.inscrever("xyz999", dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("endereço");
    }

    @Test
    void inativarMatriculaDeTurmaDelegaParaMatriculaService() {
        Matricula matricula = new Matricula();
        matricula.setTurma(turmaComEndereco());
        when(matriculaService.buscarPorId(7L)).thenReturn(matricula);
        MatriculaResponseDTO resposta = new MatriculaResponseDTO(7L, null, null, null, null, null, null, null, null, null, 0, 0,
                EStatusMatricula.CANCELADA, LocalDateTime.now());
        when(matriculaService.inativar(7L)).thenReturn(resposta);

        assertThat(turmaService.inativarMatricula(7L)).isSameAs(resposta);
    }

    @Test
    void inativarMatriculaQueNaoPertenceATurmaLancaExcecao() {
        Matricula matricula = new Matricula();
        matricula.setTurma(null);
        when(matriculaService.buscarPorId(8L)).thenReturn(matricula);

        assertThatThrownBy(() -> turmaService.inativarMatricula(8L))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("turma");
        verify(matriculaService, never()).inativar(any());
    }

    @Test
    void confirmarRecorrenciaCriaNovaMatriculaClonandoDadosDaAtual() {
        Turma turma = turmaComEndereco();
        Cliente cliente = new Cliente();
        Aluno aluno = new Aluno();
        PrecoServico precoServico = new PrecoServico();

        Matricula atual = new Matricula();
        atual.setTurma(turma);
        atual.setStatus(EStatusMatricula.ATIVA);
        atual.setCliente(cliente);
        atual.setAluno(aluno);
        atual.setPrecoServico(precoServico);
        atual.setTipoContratacao(ETipoContratacao.PACOTE_4);
        atual.setInstrumento(EInstrumento.VIOLAO);
        when(matriculaService.buscarPorId(50L)).thenReturn(atual);

        Matricula nova = new Matricula();
        when(matriculaService.criar(cliente, aluno, precoServico, ETipoContratacao.PACOTE_4, EInstrumento.VIOLAO, turma))
                .thenReturn(nova);
        MatriculaResponseDTO resposta = new MatriculaResponseDTO(51L, null, null, null, null, null, null, null, null, null, 0, 0,
                EStatusMatricula.ATIVA, LocalDateTime.now());
        when(matriculaService.toResponseDTO(nova)).thenReturn(resposta);

        assertThat(turmaService.confirmarRecorrencia(50L)).isSameAs(resposta);
        verify(matriculaService, never()).inativar(any());
    }

    @Test
    void confirmarRecorrenciaRejeitaMatriculaQueNaoPertenceATurma() {
        Matricula matricula = new Matricula();
        matricula.setTurma(null);
        when(matriculaService.buscarPorId(9L)).thenReturn(matricula);

        assertThatThrownBy(() -> turmaService.confirmarRecorrencia(9L))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("turma");
        verify(matriculaService, never()).criar(any(), any(), any(), any(), any(), any());
    }

    @Test
    void confirmarRecorrenciaRejeitaMatriculaInativa() {
        Matricula matricula = new Matricula();
        matricula.setTurma(turmaComEndereco());
        matricula.setStatus(EStatusMatricula.CANCELADA);
        when(matriculaService.buscarPorId(10L)).thenReturn(matricula);

        assertThatThrownBy(() -> turmaService.confirmarRecorrencia(10L))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("ativa");
        verify(matriculaService, never()).criar(any(), any(), any(), any(), any(), any());
    }

    @Test
    void confirmarRecorrenciaRejeitaTurmaInativa() {
        Turma turma = turmaComEndereco();
        turma.setStatus(EStatusTurma.ENCERRADA);
        Matricula matricula = new Matricula();
        matricula.setTurma(turma);
        matricula.setStatus(EStatusMatricula.ATIVA);
        when(matriculaService.buscarPorId(11L)).thenReturn(matricula);

        assertThatThrownBy(() -> turmaService.confirmarRecorrencia(11L))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("ativa");
        verify(matriculaService, never()).criar(any(), any(), any(), any(), any(), any());
    }

    @Test
    void confirmarRecorrenciaDaTurmaRenovaTodosOsAlunosAtivos() {
        Turma turma = turmaComEndereco();
        turma.setId(5L);
        when(turmaRepository.findById(5L)).thenReturn(Optional.of(turma));

        Matricula matricula1 = new Matricula();
        matricula1.setCliente(new Cliente());
        matricula1.setAluno(new Aluno());
        matricula1.setPrecoServico(new PrecoServico());
        matricula1.setTipoContratacao(ETipoContratacao.PACOTE_4);
        matricula1.setTurma(turma);
        Matricula matricula2 = new Matricula();
        matricula2.setCliente(new Cliente());
        matricula2.setAluno(new Aluno());
        matricula2.setPrecoServico(new PrecoServico());
        matricula2.setTipoContratacao(ETipoContratacao.PACOTE_4);
        matricula2.setTurma(turma);
        when(matriculaRepository.listarPorTurmaEStatus(5L, EStatusMatricula.ATIVA)).thenReturn(List.of(matricula1, matricula2));

        when(matriculaService.criar(any(), any(), any(), any(), any(), any())).thenReturn(new Matricula(), new Matricula());
        when(matriculaService.toResponseDTO(any())).thenReturn(
                new MatriculaResponseDTO(1L, null, null, null, null, null, null, null, null, null, 0, 0, EStatusMatricula.ATIVA, LocalDateTime.now()),
                new MatriculaResponseDTO(2L, null, null, null, null, null, null, null, null, null, 0, 0, EStatusMatricula.ATIVA, LocalDateTime.now()));

        List<MatriculaResponseDTO> resultado = turmaService.confirmarRecorrenciaDaTurma(5L);

        assertThat(resultado).hasSize(2);
        verify(matriculaService, org.mockito.Mockito.times(2)).criar(any(), any(), any(), any(), any(), any());
    }

    @Test
    void confirmarRecorrenciaDaTurmaSemAlunoAtivoRetornaListaVazia() {
        Turma turma = turmaComEndereco();
        turma.setId(6L);
        when(turmaRepository.findById(6L)).thenReturn(Optional.of(turma));
        when(matriculaRepository.listarPorTurmaEStatus(6L, EStatusMatricula.ATIVA)).thenReturn(List.of());

        assertThat(turmaService.confirmarRecorrenciaDaTurma(6L)).isEmpty();
        verify(matriculaService, never()).criar(any(), any(), any(), any(), any(), any());
    }

    @Test
    void confirmarRecorrenciaDaTurmaRejeitaTurmaInativa() {
        Turma turma = turmaComEndereco();
        turma.setId(7L);
        turma.setStatus(EStatusTurma.CANCELADA);
        when(turmaRepository.findById(7L)).thenReturn(Optional.of(turma));

        assertThatThrownBy(() -> turmaService.confirmarRecorrenciaDaTurma(7L))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("ativa");
        verify(matriculaRepository, never()).listarPorTurmaEStatus(any(), any());
    }

    @Test
    void confirmarRecorrenciaDaTurmaComTurmaInexistenteLancaExcecao() {
        when(turmaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> turmaService.confirmarRecorrenciaDaTurma(99L))
                .isInstanceOf(com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException.class);
    }

    private Turma turmaComEndereco() {
        Turma turma = new Turma();
        turma.setStatus(EStatusTurma.ATIVA);
        turma.setCategoria(ECategoriaServico.MUSICALIZACAO_INFANTIL);
        turma.setDiaSemana(DayOfWeek.TUESDAY);
        turma.setHora(LocalTime.of(15, 0));
        turma.setLocal("Estúdio Pedro Canuto");
        turma.setEnderecoCep("41700-000");
        turma.setEnderecoRua("Av. Oceânica");
        turma.setEnderecoNumero("500");
        turma.setEnderecoBairro("Pituba");
        turma.setEnderecoCidade("Salvador");
        turma.setEnderecoEstado("BA");
        turma.setEnderecoComplemento("Estúdio");
        return turma;
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

        Matricula matricula = new Matricula();
        matricula.setId(100L);
        matricula.setTurma(turmaSegunda);
        matricula.setAluno(sofia);
        matricula.setStatus(EStatusMatricula.ATIVA);
        matricula.setDataContratacao(LocalDateTime.now());
        when(matriculaRepository.listarComTurmaEAluno()).thenReturn(List.of(matricula));
        when(turmaMapper.paraEnderecoDTO(any())).thenReturn(null);
        when(turmaMapper.paraAlunoDaTurma(matricula)).thenCallRealMethod();

        List<TurmaComAlunosResponseDTO> resultado = turmaService.listarComAlunos();

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).diaSemana()).isEqualTo(DayOfWeek.MONDAY);
        assertThat(resultado.get(1).diaSemana()).isEqualTo(DayOfWeek.WEDNESDAY);

        assertThat(resultado.get(0).alunos()).hasSize(1);
        assertThat(resultado.get(0).alunos().get(0).nomeAluno()).isEqualTo("Sofia Souza");
        assertThat(resultado.get(0).alunos().get(0).telefone()).isEqualTo("71999588950");
        assertThat(resultado.get(0).alunos().get(0).endereco()).isEqualTo("Av. Oceânica, 500 - Pituba, Salvador/BA");
        assertThat(resultado.get(0).alunos().get(0).status()).isEqualTo(EStatusMatricula.ATIVA);

        assertThat(resultado.get(1).alunos()).isEmpty();
    }

    /**
     * Quando o aluno saiu da turma (matrícula CANCELADA) e depois voltou (nova matrícula ATIVA),
     * só a mais recente por dataContratacao deve aparecer no roster - não as duas.
     */
    @Test
    void listarComAlunosDedupPorMatriculaMaisRecenteQuandoAlunoReingressou() {
        Turma turma = new Turma();
        turma.setId(1L);
        turma.setDiaSemana(DayOfWeek.MONDAY);
        turma.setHora(LocalTime.of(16, 0));
        turma.setStatus(EStatusTurma.ATIVA);
        when(turmaRepository.findAll()).thenReturn(List.of(turma));

        Cliente responsavel = new Cliente();
        responsavel.setTelefone("71999588950");
        Aluno aluno = new Aluno();
        aluno.setId(10L);
        aluno.setNome("Sofia Souza");
        aluno.setDataNascimento(LocalDate.now().minusYears(6));
        aluno.setResponsavel(responsavel);

        Matricula antiga = new Matricula();
        antiga.setId(100L);
        antiga.setTurma(turma);
        antiga.setAluno(aluno);
        antiga.setStatus(EStatusMatricula.CANCELADA);
        antiga.setDataContratacao(LocalDateTime.now().minusMonths(2));

        Matricula recente = new Matricula();
        recente.setId(101L);
        recente.setTurma(turma);
        recente.setAluno(aluno);
        recente.setStatus(EStatusMatricula.ATIVA);
        recente.setDataContratacao(LocalDateTime.now());

        when(matriculaRepository.listarComTurmaEAluno()).thenReturn(List.of(antiga, recente));
        when(turmaMapper.paraEnderecoDTO(any())).thenReturn(null);
        when(turmaMapper.paraAlunoDaTurma(any())).thenCallRealMethod();

        List<TurmaComAlunosResponseDTO> resultado = turmaService.listarComAlunos();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).alunos()).hasSize(1);
        assertThat(resultado.get(0).alunos().get(0).matriculaId()).isEqualTo(101L);
        assertThat(resultado.get(0).alunos().get(0).status()).isEqualTo(EStatusMatricula.ATIVA);
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

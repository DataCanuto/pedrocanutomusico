package com.pedrocanuto.agendamento.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.dto.request.AgendamentoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AgendarProximaAulaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoSelecaoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.HorarioRecorrenteRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoCriadoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.HorarioOcupadoResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.AgendamentoMapper;
import com.pedrocanuto.agendamento.mapper.EnderecoFormatter;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;

/**
 * Orquestra a criação e o ciclo de vida de um Agendamento. As transições de status são métodos
 * nomeados (confirmar/checkIn/iniciar/finalizar/cancelar/marcarFalta) em vez de um PATCH
 * genérico, porque cada uma tem uma regra de estado-anterior-legal diferente
 * (ver {@link EStatusAgendamento#podeTransicionarPara}).
 */
@Service
@Transactional
public class AgendamentoService {

    /**
     * Intervalo mínimo obrigatório entre o fim de um compromisso (aula/evento) e o início do
     * próximo, para o professor ter tempo de transição - ver {@link #validarDisponibilidade}.
     */
    private static final int MINUTOS_INTERVALO_ENTRE_COMPROMISSOS = 15;

    private final AgendamentoRepository agendamentoRepository;
    private final TurmaRepository turmaRepository;
    private final ClienteService clienteService;
    private final AlunoService alunoService;
    private final PrecoServicoService precoServicoService;
    private final MatriculaService matriculaService;
    private final AnamneseService anamneseService;
    private final AgendamentoValidator validator;
    private final AgendamentoMapper agendamentoMapper;

    public AgendamentoService(AgendamentoRepository agendamentoRepository, TurmaRepository turmaRepository,
                               ClienteService clienteService, AlunoService alunoService, PrecoServicoService precoServicoService,
                               MatriculaService matriculaService, AnamneseService anamneseService,
                               AgendamentoValidator validator, AgendamentoMapper agendamentoMapper) {
        this.agendamentoRepository = agendamentoRepository;
        this.turmaRepository = turmaRepository;
        this.clienteService = clienteService;
        this.alunoService = alunoService;
        this.precoServicoService = precoServicoService;
        this.matriculaService = matriculaService;
        this.anamneseService = anamneseService;
        this.validator = validator;
        this.agendamentoMapper = agendamentoMapper;
    }

    public AgendamentoCriadoResponseDTO criar(AgendamentoRequestDTO dto) {
        validator.validarCamposPorCategoria(dto);

        if (dto.categoria().isEvento()) {
            PrecoServico pacote = precoServicoService.buscarPacoteDeEvento(dto.eventoPrecoServicoId());
            int duracaoMinutos = resolverDuracaoDoEvento(pacote, dto.duracaoMinutosEvento());
            validarDisponibilidade(dto.data(), dto.hora(), duracaoMinutos);

            Cliente cliente = clienteService.buscarOuCriar(dto.cliente());
            // Só EVENTO+ANIVERSARIO pode informar aluno (ver AgendamentoValidator) - usado aqui como o
            // aniversariante, sem Matricula (evento não é recorrente, não tem pacote de aula).
            Aluno aniversariante = dto.aluno() != null ? alunoService.buscarOuCriarParaResponsavel(cliente, dto.aluno()) : null;
            Agendamento agendamento = new Agendamento();
            agendamento.setCliente(cliente);
            agendamento.setAluno(aniversariante);
            agendamento.setCategoria(dto.categoria());
            agendamento.setData(dto.data());
            agendamento.setHora(dto.hora());
            agendamento.setObservacoes(dto.observacoes());
            agendamento.setTipoEvento(dto.tipoEvento());
            agendamento.setLocal(EnderecoFormatter.resumo(dto.enderecoEvento()));
            agendamento.setPrecoServico(pacote);
            // valorCobrado fica nulo quando o pacote escolhido é "sob consulta" - o professor define
            // depois via definirOrcamento(). Pacotes com preço fixo já saem cobrados na hora.
            agendamento.setValorCobrado(pacote.getValor());
            agendamento.setDuracaoMinutos(duracaoMinutos);
            if (dto.musicasObrigatorias() != null) {
                agendamento.getMusicasObrigatorias().addAll(dto.musicasObrigatorias());
            }
            AgendamentoResponseDTO resposta = agendamentoMapper.toResponseDTO(agendamentoRepository.save(agendamento));
            return new AgendamentoCriadoResponseDTO(null, Collections.singletonList(resposta));
        }

        PrecoServico precoServico = precoServicoService.buscarPorCategoriaModalidadeEPacote(dto.categoria(), dto.modalidade(), dto.tipoContratacao());

        if (dto.tipoContratacao() != ETipoContratacao.AVULSO) {
            List<GeradorDeDatasRecorrentes.AgendaSlot> slots =
                    GeradorDeDatasRecorrentes.gerar(dto.recorrencias(), dto.tipoContratacao().getQuantidadeAulas(), LocalDate.now());
            slots.forEach(slot -> validarDisponibilidade(slot.data(), slot.hora(), precoServico.getDuracaoPadraoMinutos()));
            Cliente cliente = clienteService.buscarOuCriar(dto.cliente());
            return criarPacoteRecorrente(cliente, dto, precoServico, slots);
        }

        validarDisponibilidade(dto.data(), dto.hora(), precoServico.getDuracaoPadraoMinutos());
        Cliente cliente = clienteService.buscarOuCriar(dto.cliente());
        Agendamento agendamento = criarAgendamentoDeAula(cliente, dto.aluno(), precoServico,
                dto.tipoContratacao(), dto.instrumento(), dto.data(), dto.hora(), null, null, dto.observacoes());
        if (dto.categoria() == ECategoriaServico.MUSICOTERAPIA) {
            anamneseService.criarSeAusente(agendamento.getAluno(), dto.anamnese());
        }
        return new AgendamentoCriadoResponseDTO(agendamento.getMatricula().getId(),
                Collections.singletonList(agendamentoMapper.toResponseDTO(agendamento)));
    }

    /**
     * PACOTE_4/PACOTE_12: {@code slots} já foi gerado e validado (disponibilidade de TODAS as
     * datas conferida, respeitando duração + intervalo) antes deste método ser chamado -
     * reaproveita a criação da matrícula/aluno de {@link #criarAgendamentoDeAula} para a primeira
     * aula, e gera as demais contra a mesma matrícula via {@link #criarAgendamentoIndividual}.
     */
    private AgendamentoCriadoResponseDTO criarPacoteRecorrente(Cliente cliente, AgendamentoRequestDTO dto, PrecoServico precoServico,
                                                                List<GeradorDeDatasRecorrentes.AgendaSlot> slots) {
        GeradorDeDatasRecorrentes.AgendaSlot primeiroSlot = slots.get(0);
        Agendamento primeiro = criarAgendamentoDeAula(cliente, dto.aluno(), precoServico,
                dto.tipoContratacao(), dto.instrumento(), primeiroSlot.data(), primeiroSlot.hora(), null, null, dto.observacoes());

        List<Agendamento> agendamentos = new ArrayList<>(slots.size());
        agendamentos.add(primeiro);
        for (GeradorDeDatasRecorrentes.AgendaSlot slot : slots.subList(1, slots.size())) {
            agendamentos.add(criarAgendamentoIndividual(cliente, primeiro.getAluno(), primeiro.getMatricula(), precoServico,
                    dto.instrumento(), slot.data(), slot.hora(), null, null, valorPorAula(primeiro.getMatricula()), dto.observacoes()));
        }

        if (dto.categoria() == ECategoriaServico.MUSICOTERAPIA) {
            anamneseService.criarSeAusente(primeiro.getAluno(), dto.anamnese());
        }

        List<AgendamentoResponseDTO> respostas = new ArrayList<>(agendamentos.size());
        for (Agendamento agendamento : agendamentos) {
            respostas.add(agendamentoMapper.toResponseDTO(agendamento));
        }
        return new AgendamentoCriadoResponseDTO(primeiro.getMatricula().getId(), respostas);
    }

    /**
     * Inscrição de uma família numa Turma (ver TurmaService): gera todas as datas do pacote a
     * partir do dia da semana/horário fixados na Turma (não escolhidos pela família, ao contrário
     * do pacote individual em {@link #criar}) usando a mesma {@link GeradorDeDatasRecorrentes},
     * e cria um Agendamento por aula contra uma única Matricula. Turma é aula em GRUPO - várias
     * famílias podem ocupar o mesmo slot, então (diferente de {@link #criar}) não há checagem de
     * disponibilidade aqui.
     */
    AgendamentoCriadoResponseDTO criarInscricaoTurma(Cliente cliente, AlunoSelecaoRequestDTO alunoSelecao, Turma turma,
                                                      ETipoContratacao tipoContratacao, String observacoes) {
        PrecoServico precoServico =
                precoServicoService.buscarPorCategoriaModalidadeEPacote(turma.getCategoria(), EModalidadeServico.GRUPO, tipoContratacao);
        List<HorarioRecorrenteRequestDTO> recorrencia = List.of(new HorarioRecorrenteRequestDTO(turma.getDiaSemana(), turma.getHora()));
        List<GeradorDeDatasRecorrentes.AgendaSlot> slots =
                GeradorDeDatasRecorrentes.gerar(recorrencia, tipoContratacao.getQuantidadeAulas(), LocalDate.now());

        GeradorDeDatasRecorrentes.AgendaSlot primeiroSlot = slots.get(0);
        Agendamento primeiro = criarAgendamentoDeAula(cliente, alunoSelecao, precoServico,
                tipoContratacao, turma.getInstrumento(), primeiroSlot.data(), primeiroSlot.hora(), turma.getLocal(), turma, observacoes);

        List<Agendamento> agendamentos = new ArrayList<>(slots.size());
        agendamentos.add(primeiro);
        for (GeradorDeDatasRecorrentes.AgendaSlot slot : slots.subList(1, slots.size())) {
            agendamentos.add(criarAgendamentoIndividual(cliente, primeiro.getAluno(), primeiro.getMatricula(), precoServico,
                    turma.getInstrumento(), slot.data(), slot.hora(), turma.getLocal(), turma, valorPorAula(primeiro.getMatricula()), observacoes));
        }

        List<AgendamentoResponseDTO> respostas = new ArrayList<>(agendamentos.size());
        for (Agendamento agendamento : agendamentos) {
            respostas.add(agendamentoMapper.toResponseDTO(agendamento));
        }
        return new AgendamentoCriadoResponseDTO(primeiro.getMatricula().getId(), respostas);
    }

    private int resolverDuracaoDoEvento(PrecoServico pacote, Integer duracaoInformadaPeloCliente) {
        if (pacote.getDuracaoPadraoMinutos() != null) {
            return pacote.getDuracaoPadraoMinutos();
        }
        if (duracaoInformadaPeloCliente == null || duracaoInformadaPeloCliente <= 0) {
            throw new RegraDeNegocioException(
                    "O pacote \"%s\" não tem duração padrão - informe duracaoMinutosEvento".formatted(pacote.getNome()));
        }
        return duracaoInformadaPeloCliente;
    }

    /**
     * Núcleo compartilhado entre a criação direta de agendamento de aula e a inscrição em Turma
     * (ver TurmaService) - a única diferença entre os dois fluxos é de onde vêm data/hora/local/
     * turma (do request direto, ou fixados pela Turma). precoServico já vem resolvido pelo
     * chamador (que precisa da duração para {@link #validarDisponibilidade} antes de chegar
     * aqui), evitando resolvê-lo de novo.
     */
    Agendamento criarAgendamentoDeAula(Cliente cliente, AlunoSelecaoRequestDTO alunoSelecao, PrecoServico precoServico,
                                        ETipoContratacao tipoContratacao, EInstrumento instrumento,
                                        LocalDate data, LocalTime hora, String local, Turma turma, String observacoes) {
        Aluno aluno = alunoService.buscarOuCriarParaResponsavel(cliente, alunoSelecao);
        Matricula matricula = matriculaService.criar(cliente, aluno, precoServico, tipoContratacao, instrumento);
        return criarAgendamentoIndividual(cliente, aluno, matricula, precoServico, instrumento, data, hora, local, turma,
                valorPorAula(matricula), observacoes);
    }

    /**
     * Monta e salva um único Agendamento contra uma Matricula já existente - núcleo reaproveitado
     * por {@link #criarAgendamentoDeAula} (que cria a matrícula antes), pelo fluxo de pacote
     * recorrente ({@link #criarPacoteRecorrente}), por {@link #agendarProximaAula} e por
     * {@link #confirmarRecorrencia}. valorCobrado é decidido pelo chamador (normalmente
     * {@link #valorPorAula(Matricula)}, mas {@link #confirmarRecorrencia} propaga o valor da
     * última sessão em vez do preço atual do catálogo) - este método só persiste.
     */
    private Agendamento criarAgendamentoIndividual(Cliente cliente, Aluno aluno, Matricula matricula, PrecoServico precoServico,
                                                    EInstrumento instrumento, LocalDate data, LocalTime hora, String local,
                                                    Turma turma, BigDecimal valorCobrado, String observacoes) {
        Agendamento agendamento = new Agendamento();
        agendamento.setCliente(cliente);
        agendamento.setCategoria(precoServico.getCategoria());
        agendamento.setAluno(aluno);
        agendamento.setMatricula(matricula);
        agendamento.setPrecoServico(precoServico);
        agendamento.setTurma(turma);
        agendamento.setInstrumento(instrumento);
        agendamento.setLocal(local);
        agendamento.setValorCobrado(valorCobrado);
        agendamento.setDuracaoMinutos(precoServico.getDuracaoPadraoMinutos());
        agendamento.setData(data);
        agendamento.setHora(hora);
        agendamento.setObservacoes(observacoes);

        return agendamentoRepository.save(agendamento);
    }

    /** Fatiamento simples do valor do pacote pela quantidade de aulas, para atribuir receita por aula/mês. Pequenas diferenças de arredondamento no último centavo são aceitáveis nesta escala. */
    private BigDecimal valorPorAula(Matricula matricula) {
        return matricula.getValorTotal().divide(
                BigDecimal.valueOf(matricula.getTipoContratacao().getQuantidadeAulas()), 2, RoundingMode.HALF_UP);
    }

    /** Agenda mais uma aula contra o saldo de uma Matricula já fechada (não fecha um novo pacote). */
    public AgendamentoResponseDTO agendarProximaAula(Long matriculaId, AgendarProximaAulaRequestDTO dto) {
        Matricula matricula = matriculaService.buscarComLockPorId(matriculaId);
        if (matricula.getStatus() != EStatusMatricula.ATIVA) {
            throw new RegraDeNegocioException("Matrícula não está ativa");
        }
        if (matriculaService.calcularAulasRestantes(matricula) <= 0) {
            throw new RegraDeNegocioException("Pacote sem aulas restantes - feche um novo pacote para continuar agendando");
        }
        validator.validarHorario(dto.hora());
        validarDisponibilidade(dto.data(), dto.hora(), matricula.getPrecoServico().getDuracaoPadraoMinutos());

        Agendamento agendamento = criarAgendamentoIndividual(matricula.getCliente(), matricula.getAluno(), matricula,
                matricula.getPrecoServico(), matricula.getInstrumento(), dto.data(), dto.hora(), null, null,
                valorPorAula(matricula), dto.observacoes());

        return agendamentoMapper.toResponseDTO(agendamento);
    }

    /**
     * Confirma a recorrência de um pacote de aula/sessão (Musicalização/Musicoterapia/Instrumento -
     * não se aplica a EVENTO, que não é recorrente) para o mês seguinte: infere dia da semana,
     * horário e valor a partir do último Agendamento não cancelado da Matricula informada, e
     * garante as próximas {@link ETipoContratacao#PACOTE_4} aulas nesse mesmo padrão. Fecha uma
     * NOVA Matricula para elas (em vez de estender a antiga) porque aulasContratadas nunca muda
     * depois de criado - ver {@link MatriculaService#calcularAulasRestantes} - o que preserva o
     * histórico de cada ciclo contratado. valorCobrado de cada aula nova é o snapshot da última
     * sessão (não o preço atual do catálogo), para não repreçar silenciosamente um aluno já
     * matriculado se a tabela de preços mudar entre um mês e outro.
     */
    public AgendamentoCriadoResponseDTO confirmarRecorrencia(Long matriculaId) {
        Matricula matriculaAtual = matriculaService.buscarPorId(matriculaId);
        if (matriculaAtual.getStatus() != EStatusMatricula.ATIVA) {
            throw new RegraDeNegocioException("Matrícula não está ativa");
        }

        Agendamento ultimo = agendamentoRepository
                .findFirstByMatriculaIdAndStatusNotOrderByDataDescHoraDesc(matriculaId, EStatusAgendamento.CANCELADO)
                .orElseThrow(() -> new RegraDeNegocioException(
                        "Matrícula não tem nenhuma aula não cancelada para basear a renovação"));

        PrecoServico precoServico = precoServicoService.buscarPorCategoriaModalidadeEPacote(
                matriculaAtual.getPrecoServico().getCategoria(), matriculaAtual.getPrecoServico().getModalidade(), ETipoContratacao.PACOTE_4);

        List<HorarioRecorrenteRequestDTO> recorrencia =
                List.of(new HorarioRecorrenteRequestDTO(ultimo.getData().getDayOfWeek(), ultimo.getHora()));
        List<GeradorDeDatasRecorrentes.AgendaSlot> slots = GeradorDeDatasRecorrentes.gerar(
                recorrencia, ETipoContratacao.PACOTE_4.getQuantidadeAulas(), ultimo.getData().plusDays(1));
        slots.forEach(slot -> validarDisponibilidade(slot.data(), slot.hora(), precoServico.getDuracaoPadraoMinutos()));

        Matricula novaMatricula = matriculaService.criar(matriculaAtual.getCliente(), matriculaAtual.getAluno(),
                precoServico, ETipoContratacao.PACOTE_4, matriculaAtual.getInstrumento());

        String observacoes = "Renovação automática da recorrência da matrícula #%d".formatted(matriculaId);
        List<AgendamentoResponseDTO> respostas = new ArrayList<>(slots.size());
        for (GeradorDeDatasRecorrentes.AgendaSlot slot : slots) {
            Agendamento agendamento = criarAgendamentoIndividual(matriculaAtual.getCliente(), matriculaAtual.getAluno(),
                    novaMatricula, precoServico, matriculaAtual.getInstrumento(), slot.data(), slot.hora(),
                    ultimo.getLocal(), ultimo.getTurma(), ultimo.getValorCobrado(), observacoes);
            respostas.add(agendamentoMapper.toResponseDTO(agendamento));
        }
        return new AgendamentoCriadoResponseDTO(novaMatricula.getId(), respostas);
    }

    public AgendamentoResponseDTO definirOrcamento(Long id, BigDecimal valor) {
        Agendamento agendamento = buscarEntidadePorId(id);
        if (agendamento.getCategoria() != ECategoriaServico.EVENTO) {
            throw new RegraDeNegocioException("Orçamento manual só se aplica a agendamentos de categoria EVENTO");
        }
        if (valor == null || valor.signum() <= 0) {
            throw new RegraDeNegocioException("Valor do orçamento deve ser positivo");
        }
        agendamento.setValorCobrado(valor);
        return agendamentoMapper.toResponseDTO(agendamento);
    }

    public AgendamentoResponseDTO confirmar(Long id) {
        return agendamentoMapper.toResponseDTO(transicionar(id, EStatusAgendamento.CONFIRMADO));
    }

    public AgendamentoResponseDTO checkIn(Long id) {
        Agendamento agendamento = transicionar(id, EStatusAgendamento.CHECK_IN);
        agendamento.setDataHoraCheckIn(LocalDateTime.now());
        return agendamentoMapper.toResponseDTO(agendamento);
    }

    public AgendamentoResponseDTO iniciar(Long id) {
        return agendamentoMapper.toResponseDTO(transicionar(id, EStatusAgendamento.EM_ANDAMENTO));
    }

    public AgendamentoResponseDTO finalizar(Long id) {
        Agendamento agendamento = transicionar(id, EStatusAgendamento.FINALIZADO);
        agendamento.setDataHoraFinalizacao(LocalDateTime.now());
        return agendamentoMapper.toResponseDTO(agendamento);
    }

    public AgendamentoResponseDTO cancelar(Long id) {
        return agendamentoMapper.toResponseDTO(transicionar(id, EStatusAgendamento.CANCELADO));
    }

    public AgendamentoResponseDTO marcarFalta(Long id) {
        return agendamentoMapper.toResponseDTO(transicionar(id, EStatusAgendamento.FALTOU));
    }

    private Agendamento transicionar(Long id, EStatusAgendamento novoStatus) {
        Agendamento agendamento = buscarEntidadePorId(id);
        if (!agendamento.getStatus().podeTransicionarPara(novoStatus)) {
            throw new RegraDeNegocioException(
                    "Não é possível mudar o status de %s para %s".formatted(agendamento.getStatus(), novoStatus));
        }
        agendamento.setStatus(novoStatus);
        return agendamento;
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscarPorId(Long id) {
        return agendamentoMapper.toResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscarPorCodigoPublico(String codigoPublico) {
        Agendamento agendamento = agendamentoRepository.findByCodigoPublico(codigoPublico)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento não encontrado para o código informado"));
        return agendamentoMapper.toResponseDTO(agendamento);
    }

    @Transactional(readOnly = true)
    public Agendamento buscarEntidadePorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Agendamento", id));
    }

    /**
     * Pré-visualização pública (sem dado pessoal) dos horários já ocupados num dia, para o
     * formulário de agendamento desabilitar de cara os slots que colidiriam com a janela de
     * {@link #MINUTOS_INTERVALO_ENTRE_COMPROMISSOS} minutos antes/depois de um compromisso
     * existente - mesma fonte de dados (e mesma exclusão de CANCELADO) de
     * {@link #validarDisponibilidade}, que continua sendo a validação que vale de verdade. Inclui
     * também as Turmas ativas cujo dia da semana bate com {@code data} (ver
     * {@link #turmasNoDiaDaSemana}).
     */
    @Transactional(readOnly = true)
    public List<HorarioOcupadoResponseDTO> listarHorariosOcupados(LocalDate data) {
        List<HorarioOcupadoResponseDTO> ocupados = new ArrayList<>(agendamentoRepository
                .findByDataAndStatusNot(data, EStatusAgendamento.CANCELADO).stream()
                .map(agendamentoMapper::toHorarioOcupadoDTO)
                .toList());
        turmasNoDiaDaSemana(data).forEach(turma ->
                ocupados.add(new HorarioOcupadoResponseDTO(turma.getHora(), precoServicoService.buscarDuracaoDeGrupo(turma.getCategoria()))));
        return ocupados;
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listar(LocalDate data, ECategoriaServico categoria) {
        List<Agendamento> agendamentos;
        if (data != null && categoria != null) {
            agendamentos = agendamentoRepository.findByDataAndCategoria(data, categoria);
        } else if (data != null) {
            agendamentos = agendamentoRepository.findByData(data);
        } else if (categoria != null) {
            agendamentos = agendamentoRepository.findByCategoria(categoria);
        } else {
            agendamentos = agendamentoRepository.findAll();
        }
        return agendamentos.stream().map(agendamentoMapper::toResponseDTO).toList();
    }

    /**
     * A agenda do professor é derivada dos Agendamentos ativos (não-cancelados) do dia mais as
     * Turmas ativas cujo dia da semana bate com {@code data} - uma Turma ocupa seu horário toda
     * semana assim que é criada (status ATIVA), independentemente de já ter aluno matriculado
     * (matrícula gera Agendamentos datados, mas só dentro da janela de 31 dias de cada família -
     * sem essa checagem por dia da semana, uma Turma recém-criada e ainda vazia não bloquearia
     * nada). Em ambos os casos, um novo compromisso só pode começar depois que o anterior termina
     * + os {@link #MINUTOS_INTERVALO_ENTRE_COMPROMISSOS} minutos de intervalo (e, simetricamente,
     * só pode terminar + intervalo antes que o próximo já marcado comece) - ex.: aula de 30 min às
     * 15h bloqueia 15h-15:44; aula de 50 min às 15h bloqueia 15h-16:04.
     */
    /**
     * Usado só na criação de Turma ({@code TurmaService#criar}), que não tem uma {@code data} -
     * só um dia da semana recorrente. Reaproveita a mesma validação de disponibilidade, checando
     * a próxima ocorrência desse dia da semana a partir de hoje. Não cobre ocorrências futuras
     * mais distantes (ex.: um Agendamento AVULSO já marcado daqui a 3 semanas nesse mesmo dia da
     * semana) - mesma limitação de "só a próxima ocorrência" já assumida em
     * {@link GeradorDeDatasRecorrentes}/preview do frontend.
     */
    public void validarDisponibilidadeDeNovaTurma(DayOfWeek diaSemana, LocalTime hora, ECategoriaServico categoria) {
        LocalDate proximaOcorrencia = LocalDate.now().with(TemporalAdjusters.nextOrSame(diaSemana));
        validarDisponibilidade(proximaOcorrencia, hora, precoServicoService.buscarDuracaoDeGrupo(categoria));
    }

    private void validarDisponibilidade(LocalDate data, LocalTime hora, int duracaoMinutos) {
        int inicioNovo = minutosDoDia(hora);

        boolean conflitaComAgendamento = agendamentoRepository.findByDataAndStatusNot(data, EStatusAgendamento.CANCELADO).stream()
                .anyMatch(existente -> conflita(inicioNovo, duracaoMinutos, minutosDoDia(existente.getHora()), existente.getDuracaoMinutos()));

        boolean conflitaComTurma = turmasNoDiaDaSemana(data).stream()
                .anyMatch(turma -> conflita(inicioNovo, duracaoMinutos, minutosDoDia(turma.getHora()),
                        precoServicoService.buscarDuracaoDeGrupo(turma.getCategoria())));

        if (conflitaComAgendamento || conflitaComTurma) {
            throw new RegraDeNegocioException(
                    "Horário indisponível - já existe um compromisso agendado que não deixa os %d minutos de intervalo necessários antes/depois"
                            .formatted(MINUTOS_INTERVALO_ENTRE_COMPROMISSOS));
        }
    }

    private List<Turma> turmasNoDiaDaSemana(LocalDate data) {
        return turmaRepository.findByDiaSemanaAndStatus(data.getDayOfWeek(), EStatusTurma.ATIVA);
    }

    /** Comparação em minutos inteiros desde a meia-noite (em vez de LocalTime.plusMinutes) para não estourar a virada do dia com durações longas. */
    private static boolean conflita(int inicioA, int duracaoA, int inicioB, int duracaoB) {
        int fimAComIntervalo = inicioA + duracaoA + MINUTOS_INTERVALO_ENTRE_COMPROMISSOS;
        int fimBComIntervalo = inicioB + duracaoB + MINUTOS_INTERVALO_ENTRE_COMPROMISSOS;
        return inicioA < fimBComIntervalo && inicioB < fimAComIntervalo;
    }

    private static int minutosDoDia(LocalTime hora) {
        return hora.getHour() * 60 + hora.getMinute();
    }
}

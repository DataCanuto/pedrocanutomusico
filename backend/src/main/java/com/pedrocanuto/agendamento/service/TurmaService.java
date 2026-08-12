package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.InscricaoTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaComAlunosResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.EnderecoFormatter;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.security.SecureRandom;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Turma: horário recorrente de aula em grupo com um código curto que as famílias usam para
 * matricular seus alunos. Matricular um aluno numa Turma só registra o vínculo aluno<->turma
 * (via {@link Matricula#getTurma()}) - não gera {@code Agendamento} datado por aula (a aula da
 * turma em si é representada como compromisso único na agenda por {@code TurmaOcorrencia}, ver
 * {@code TurmaOcorrenciaService}/{@code AgendaAdminService}).
 */
@Service
@Transactional
public class TurmaService {

    private static final String ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I/L, ambíguos ao ditar por telefone
    private static final int TAMANHO_CODIGO = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final TurmaRepository turmaRepository;
    private final MatriculaRepository matriculaRepository;
    private final TurmaMapper turmaMapper;
    private final ClienteService clienteService;
    private final AlunoService alunoService;
    private final PrecoServicoService precoServicoService;
    private final MatriculaService matriculaService;
    private final AgendamentoService agendamentoService;
    private final AgendamentoValidator validator;

    public TurmaService(TurmaRepository turmaRepository, MatriculaRepository matriculaRepository, TurmaMapper turmaMapper,
                         ClienteService clienteService, AlunoService alunoService, PrecoServicoService precoServicoService,
                         MatriculaService matriculaService, AgendamentoService agendamentoService, AgendamentoValidator validator) {
        this.turmaRepository = turmaRepository;
        this.matriculaRepository = matriculaRepository;
        this.turmaMapper = turmaMapper;
        this.clienteService = clienteService;
        this.alunoService = alunoService;
        this.precoServicoService = precoServicoService;
        this.matriculaService = matriculaService;
        this.agendamentoService = agendamentoService;
        this.validator = validator;
    }

    public TurmaResponseDTO criar(TurmaRequestDTO dto) {
        if (!dto.categoria().isAulaTipo()) {
            throw new RegraDeNegocioException("Turma só se aplica a categorias de aula (não EVENTO)");
        }
        boolean isInstrumento = dto.categoria() == ECategoriaServico.AULA_INSTRUMENTO;
        if (isInstrumento && dto.instrumento() == null) {
            throw new RegraDeNegocioException("instrumento é obrigatório para categoria AULA_INSTRUMENTO");
        }
        if (!isInstrumento && dto.instrumento() != null) {
            throw new RegraDeNegocioException("instrumento só se aplica à categoria AULA_INSTRUMENTO");
        }
        validator.validarHorarioDeAula(dto.diaSemana(), dto.hora());
        agendamentoService.validarDisponibilidadeDeNovaTurma(dto.diaSemana(), dto.hora(), dto.categoria());

        Turma turma = turmaMapper.toEntity(dto);
        turma.setCodigo(gerarCodigoUnico());
        turma.setLocal(EnderecoFormatter.resumo(dto.endereco()));
        return turmaMapper.toResponseDTO(turmaRepository.save(turma));
    }

    @Transactional(readOnly = true)
    public TurmaResponseDTO buscarPorCodigo(String codigo) {
        return turmaMapper.toResponseDTO(buscarEntidadePorCodigo(codigo));
    }

    /**
     * Completa/corrige o endereço estruturado de uma turma já existente - necessário para turmas
     * criadas antes da migration V5 (endereço estruturado), que ficaram só com {@link Turma#getLocal()}
     * preenchido e travam a matrícula em {@link #comEnderecoDaTurmaSeAusente} (ver
     * RegraDeNegocioException ali). Também serve para o professor corrigir um endereço já
     * estruturado que tenha sido cadastrado errado.
     */
    public TurmaResponseDTO atualizarEndereco(Long id, EnderecoRequestDTO dto) {
        Turma turma = buscarEntidadePorId(id);
        turma.setEnderecoCep(dto.cep());
        turma.setEnderecoRua(dto.rua());
        turma.setEnderecoNumero(dto.numero());
        turma.setEnderecoBairro(dto.bairro());
        turma.setEnderecoCidade(dto.cidade());
        turma.setEnderecoEstado(dto.estado());
        turma.setEnderecoComplemento(dto.complemento());
        turma.setLocal(EnderecoFormatter.resumo(dto));
        return turmaMapper.toResponseDTO(turmaRepository.save(turma));
    }

    /**
     * Painel "ver turmas" (Q_verTurmas): cada turma com os alunos matriculados nela - vindos de
     * {@link Matricula#getTurma()}, mostrando ativo E inativo (aluno que saiu, sem sumir do
     * histórico). Quando o mesmo aluno tem mais de uma matrícula na mesma turma (reingresso após
     * sair), só a mais recente (por dataContratacao) é exibida. Ordenado por dia da semana
     * (segunda a domingo) e depois hora - feito em Java, não em SQL: diaSemana é
     * {@code @Enumerated(STRING)}, então um ORDER BY no banco ordenaria alfabeticamente
     * (FRIDAY antes de MONDAY), não pela semana real.
     */
    @Transactional(readOnly = true)
    public List<TurmaComAlunosResponseDTO> listarComAlunos() {
        Map<Long, List<Matricula>> matriculasPorTurma = agruparMatriculaMaisRecentePorAlunoPorTurma();
        return turmaRepository.findAll().stream()
                .sorted(Comparator.comparing(Turma::getDiaSemana).thenComparing(Turma::getHora))
                .map(turma -> paraTurmaComAlunos(turma, matriculasPorTurma.getOrDefault(turma.getId(), List.of())))
                .toList();
    }

    private Map<Long, List<Matricula>> agruparMatriculaMaisRecentePorAlunoPorTurma() {
        Map<Long, Map<Long, Matricula>> matriculaMaisRecentePorAlunoPorTurma = new LinkedHashMap<>();
        for (Matricula matricula : matriculaRepository.listarComTurmaEAluno()) {
            Long turmaId = matricula.getTurma().getId();
            Long alunoId = matricula.getAluno().getId();
            Map<Long, Matricula> porAluno = matriculaMaisRecentePorAlunoPorTurma.computeIfAbsent(turmaId, id -> new LinkedHashMap<>());
            Matricula existente = porAluno.get(alunoId);
            if (existente == null || matricula.getDataContratacao().isAfter(existente.getDataContratacao())) {
                porAluno.put(alunoId, matricula);
            }
        }
        Map<Long, List<Matricula>> resultado = new LinkedHashMap<>();
        matriculaMaisRecentePorAlunoPorTurma.forEach((turmaId, porAluno) -> resultado.put(turmaId, List.copyOf(porAluno.values())));
        return resultado;
    }

    private TurmaComAlunosResponseDTO paraTurmaComAlunos(Turma turma, List<Matricula> matriculas) {
        return new TurmaComAlunosResponseDTO(
                turma.getId(),
                turma.getCodigo(),
                turma.getCategoria(),
                turma.getInstrumento(),
                turma.getDiaSemana(),
                turma.getHora(),
                turma.getLocal(),
                turmaMapper.paraEnderecoDTO(turma),
                turma.getStatus(),
                matriculas.stream().map(turmaMapper::paraAlunoDaTurma).toList()
        );
    }

    /**
     * Registra o vínculo aluno<->turma (Matricula#turma) - não gera Agendamento datado por aula
     * (diferente do pacote individual em AgendamentoService#criar). tipoContratacao continua
     * decidindo o pacote/valor cobrado (referência de preço), mas não quantas datas gerar.
     */
    public InscricaoTurmaResponseDTO inscrever(String codigo, InscricaoTurmaRequestDTO dto) {
        Turma turma = buscarEntidadePorCodigo(codigo);
        if (turma.getStatus() != EStatusTurma.ATIVA) {
            throw new RegraDeNegocioException("Esta turma não está mais aceitando inscrições");
        }

        Cliente cliente = clienteService.buscarOuCriar(comEnderecoDaTurmaSeAusente(dto.cliente(), turma));
        Aluno aluno = alunoService.buscarOuCriarParaResponsavel(cliente, dto.aluno());
        PrecoServico precoServico =
                precoServicoService.buscarPorCategoriaModalidadeEPacote(turma.getCategoria(), EModalidadeServico.GRUPO, dto.tipoContratacao());
        Matricula matricula = matriculaService.criar(cliente, aluno, precoServico, dto.tipoContratacao(), turma.getInstrumento(), turma);
        return turmaMapper.toInscricaoResponseDTO(matricula, turma);
    }

    /** "Aluno saiu da turma": inativa a matrícula sem apagar histórico - a turma continua existindo para os demais. */
    public MatriculaResponseDTO inativarMatricula(Long matriculaId) {
        Matricula matricula = matriculaService.buscarPorId(matriculaId);
        if (matricula.getTurma() == null) {
            throw new RegraDeNegocioException("Esta matrícula não pertence a uma turma");
        }
        return matriculaService.inativar(matriculaId);
    }

    /**
     * Renova o ciclo de UMA matrícula de turma: cria uma NOVA Matricula com os mesmos
     * cliente/aluno/precoServico/tipoContratacao/instrumento/turma da atual (dataContratacao =
     * agora), sem tocar na antiga - mesmo padrão de {@link AgendamentoService#confirmarRecorrencia},
     * mas sem gerar Agendamento datado (matrícula de turma nunca gera - ver {@link #inscrever}):
     * a turma já tem dia/hora fixos, não há "aulas restantes" nem última aula de onde inferir isso.
     */
    public MatriculaResponseDTO confirmarRecorrencia(Long matriculaId) {
        Matricula matriculaAtual = matriculaService.buscarPorId(matriculaId);
        if (matriculaAtual.getTurma() == null) {
            throw new RegraDeNegocioException("Esta matrícula não pertence a uma turma");
        }
        if (matriculaAtual.getStatus() != EStatusMatricula.ATIVA) {
            throw new RegraDeNegocioException("Matrícula não está ativa");
        }
        if (matriculaAtual.getTurma().getStatus() != EStatusTurma.ATIVA) {
            throw new RegraDeNegocioException("Esta turma não está mais ativa");
        }
        return matriculaService.toResponseDTO(renovar(matriculaAtual));
    }

    /**
     * "A turma é como se fosse um aluno individual" na agenda do admin: renova de uma vez o ciclo
     * de todos os alunos hoje ATIVOS na turma, reaproveitando {@link #confirmarRecorrencia} por
     * aluno. Turma sem nenhum aluno ativo não é erro - devolve lista vazia.
     */
    public List<MatriculaResponseDTO> confirmarRecorrenciaDaTurma(Long turmaId) {
        Turma turma = buscarEntidadePorId(turmaId);
        if (turma.getStatus() != EStatusTurma.ATIVA) {
            throw new RegraDeNegocioException("Esta turma não está mais ativa");
        }
        return matriculaRepository.listarPorTurmaEStatus(turmaId, EStatusMatricula.ATIVA).stream()
                .map(this::renovar)
                .map(matriculaService::toResponseDTO)
                .toList();
    }

    private Matricula renovar(Matricula matriculaAtual) {
        return matriculaService.criar(matriculaAtual.getCliente(), matriculaAtual.getAluno(),
                matriculaAtual.getPrecoServico(), matriculaAtual.getTipoContratacao(),
                matriculaAtual.getInstrumento(), matriculaAtual.getTurma());
    }

    private Turma buscarEntidadePorId(Long id) {
        return turmaRepository.findById(id).orElseThrow(() -> RecursoNaoEncontradoException.paraId("Turma", id));
    }

    /**
     * A aula em grupo acontece sempre no endereço fixo da turma, não na casa do cliente - por
     * isso o formulário de matrícula não pede (nem exige) endereço próprio (ver ClienteFields no
     * frontend). Quando o cliente realmente não envia um, usamos o da turma para satisfazer a
     * regra de "todo Cliente tem pelo menos um endereço" (ver ClienteService#validarEndereco).
     * Se o cliente enviar um endereço mesmo assim (ex.: já tem cadastro com endereço próprio),
     * respeitamos o que veio - só preenchemos a lacuna, nunca sobrescrevemos.
     */
    private ClienteRequestDTO comEnderecoDaTurmaSeAusente(ClienteRequestDTO cliente, Turma turma) {
        if (cliente.enderecos() != null && !cliente.enderecos().isEmpty()) {
            return cliente;
        }
        if (turma.getEnderecoCep() == null) {
            throw new RegraDeNegocioException("Esta turma não tem endereço cadastrado - fale com o professor antes de continuar");
        }
        EnderecoRequestDTO enderecoDaTurma = new EnderecoRequestDTO(turma.getEnderecoCep(), turma.getEnderecoRua(),
                turma.getEnderecoNumero(), turma.getEnderecoBairro(), turma.getEnderecoCidade(), turma.getEnderecoEstado(),
                turma.getEnderecoComplemento());
        return new ClienteRequestDTO(cliente.nome(), cliente.telefone(), cliente.email(), cliente.cpf(), cliente.cnpj(),
                cliente.dataNascimento(), cliente.sexo(), List.of(enderecoDaTurma));
    }

    private Turma buscarEntidadePorCodigo(String codigo) {
        return turmaRepository.findByCodigo(codigo.toUpperCase())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Turma não encontrada para o código informado"));
    }

    private String gerarCodigoUnico() {
        String codigo;
        do {
            codigo = gerarCodigoAleatorio();
        } while (turmaRepository.existsByCodigo(codigo));
        return codigo;
    }

    private String gerarCodigoAleatorio() {
        StringBuilder sb = new StringBuilder(TAMANHO_CODIGO);
        for (int i = 0; i < TAMANHO_CODIGO; i++) {
            sb.append(ALFABETO_CODIGO.charAt(RANDOM.nextInt(ALFABETO_CODIGO.length())));
        }
        return sb.toString();
    }
}

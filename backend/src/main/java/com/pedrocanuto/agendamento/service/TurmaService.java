package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoCriadoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.AlunoDaTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaComAlunosResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.EnderecoFormatter;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
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
 * matricular seus alunos. Cada família recebe sua própria Matricula e uma sequência de
 * Agendamentos (um por aula do pacote escolhido, gerados a partir do dia da semana/horário
 * fixados na Turma) - reaproveita {@link AgendamentoService#criarInscricaoTurma}.
 */
@Service
@Transactional
public class TurmaService {

    private static final String ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I/L, ambíguos ao ditar por telefone
    private static final int TAMANHO_CODIGO = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final TurmaRepository turmaRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final TurmaMapper turmaMapper;
    private final ClienteService clienteService;
    private final AgendamentoService agendamentoService;
    private final AgendamentoValidator validator;

    public TurmaService(TurmaRepository turmaRepository, AgendamentoRepository agendamentoRepository,
                         TurmaMapper turmaMapper, ClienteService clienteService,
                         AgendamentoService agendamentoService, AgendamentoValidator validator) {
        this.turmaRepository = turmaRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.turmaMapper = turmaMapper;
        this.clienteService = clienteService;
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
        validator.validarHorario(dto.hora());
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
        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Turma", id));
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
     * Painel "ver turmas" (Q_verTurmas): cada turma com os alunos matriculados nela. Turma não
     * tem ligação direta com Cliente/Aluno - o vínculo existe só via Agendamento#turma, e como
     * cada pacote gera uma aula por semana (vários Agendamentos por matrícula), o mesmo aluno
     * aparece várias vezes ali e precisa ser deduplicado por aluno.id. Ordenado por dia da semana
     * (segunda a domingo) e depois hora - feito em Java, não em SQL: diaSemana é
     * {@code @Enumerated(STRING)}, então um ORDER BY no banco ordenaria alfabeticamente
     * (FRIDAY antes de MONDAY), não pela semana real.
     */
    @Transactional(readOnly = true)
    public List<TurmaComAlunosResponseDTO> listarComAlunos() {
        Map<Long, List<Aluno>> alunosPorTurma = agruparAlunosUnicosPorTurma();
        return turmaRepository.findAll().stream()
                .sorted(Comparator.comparing(Turma::getDiaSemana).thenComparing(Turma::getHora))
                .map(turma -> paraTurmaComAlunos(turma, alunosPorTurma.getOrDefault(turma.getId(), List.of())))
                .toList();
    }

    private Map<Long, List<Aluno>> agruparAlunosUnicosPorTurma() {
        Map<Long, Map<Long, Aluno>> alunosUnicosPorTurma = new LinkedHashMap<>();
        for (Agendamento agendamento : agendamentoRepository.listarComTurmaEAluno()) {
            Long turmaId = agendamento.getTurma().getId();
            Aluno aluno = agendamento.getAluno();
            alunosUnicosPorTurma.computeIfAbsent(turmaId, id -> new LinkedHashMap<>()).putIfAbsent(aluno.getId(), aluno);
        }
        Map<Long, List<Aluno>> resultado = new LinkedHashMap<>();
        alunosUnicosPorTurma.forEach((turmaId, alunos) -> resultado.put(turmaId, List.copyOf(alunos.values())));
        return resultado;
    }

    private TurmaComAlunosResponseDTO paraTurmaComAlunos(Turma turma, List<Aluno> alunos) {
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
                alunos.stream().map(this::paraAlunoDaTurma).toList()
        );
    }

    private AlunoDaTurmaResponseDTO paraAlunoDaTurma(Aluno aluno) {
        Cliente responsavel = aluno.getResponsavel();
        return new AlunoDaTurmaResponseDTO(
                aluno.getId(),
                aluno.getNome(),
                aluno.getIdade(),
                EnderecoFormatter.resumoPrimeiroEndereco(responsavel.getEnderecos()),
                responsavel.getTelefone()
        );
    }

    public AgendamentoCriadoResponseDTO inscrever(String codigo, InscricaoTurmaRequestDTO dto) {
        Turma turma = buscarEntidadePorCodigo(codigo);
        if (turma.getStatus() != EStatusTurma.ATIVA) {
            throw new RegraDeNegocioException("Esta turma não está mais aceitando inscrições");
        }

        Cliente cliente = clienteService.buscarOuCriar(comEnderecoDaTurmaSeAusente(dto.cliente(), turma));
        return agendamentoService.criarInscricaoTurma(cliente, dto.aluno(), turma, dto.tipoContratacao(), dto.observacoes());
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

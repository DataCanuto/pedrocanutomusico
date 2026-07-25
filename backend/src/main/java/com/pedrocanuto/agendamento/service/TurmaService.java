package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.dto.request.InscricaoTurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AgendamentoCriadoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.EnderecoFormatter;
import com.pedrocanuto.agendamento.mapper.TurmaMapper;
import com.pedrocanuto.agendamento.repository.TurmaRepository;
import com.pedrocanuto.agendamento.service.validation.AgendamentoValidator;
import java.security.SecureRandom;
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
    private final TurmaMapper turmaMapper;
    private final ClienteService clienteService;
    private final AgendamentoService agendamentoService;
    private final AgendamentoValidator validator;

    public TurmaService(TurmaRepository turmaRepository, TurmaMapper turmaMapper, ClienteService clienteService,
                         AgendamentoService agendamentoService, AgendamentoValidator validator) {
        this.turmaRepository = turmaRepository;
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

        Turma turma = turmaMapper.toEntity(dto);
        turma.setCodigo(gerarCodigoUnico());
        turma.setLocal(EnderecoFormatter.resumo(dto.endereco()));
        return turmaMapper.toResponseDTO(turmaRepository.save(turma));
    }

    @Transactional(readOnly = true)
    public TurmaResponseDTO buscarPorCodigo(String codigo) {
        return turmaMapper.toResponseDTO(buscarEntidadePorCodigo(codigo));
    }

    public AgendamentoCriadoResponseDTO inscrever(String codigo, InscricaoTurmaRequestDTO dto) {
        Turma turma = buscarEntidadePorCodigo(codigo);
        if (turma.getStatus() != EStatusTurma.ATIVA) {
            throw new RegraDeNegocioException("Esta turma não está mais aceitando inscrições");
        }

        Cliente cliente = clienteService.buscarOuCriar(dto.cliente());
        return agendamentoService.criarInscricaoTurma(cliente, dto.aluno(), turma, dto.tipoContratacao(), dto.observacoes());
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

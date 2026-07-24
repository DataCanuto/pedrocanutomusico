package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.dto.request.AlunoSelecaoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AlunoListItemResponseDTO;
import com.pedrocanuto.agendamento.dto.response.AlunoResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.mapper.AlunoMapper;
import com.pedrocanuto.agendamento.mapper.EnderecoFormatter;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.AlunoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final AlunoMapper alunoMapper;

    public AlunoService(AlunoRepository alunoRepository, AgendamentoRepository agendamentoRepository, AlunoMapper alunoMapper) {
        this.alunoRepository = alunoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.alunoMapper = alunoMapper;
    }

    @Transactional(readOnly = true)
    public List<AlunoResponseDTO> listarPorResponsavel(Long clienteId) {
        return alunoRepository.findByResponsavelId(clienteId).stream().map(alunoMapper::toResponseDTO).toList();
    }

    /** Listagem global para o painel do professor - junta dados do responsável e contadores de aula. */
    @Transactional(readOnly = true)
    public List<AlunoListItemResponseDTO> listarTodos() {
        return alunoRepository.findAll().stream().map(this::paraListItem).toList();
    }

    private AlunoListItemResponseDTO paraListItem(Aluno aluno) {
        Cliente responsavel = aluno.getResponsavel();
        return new AlunoListItemResponseDTO(
                aluno.getId(),
                aluno.getNome(),
                aluno.getIdade(),
                responsavel.getId(),
                responsavel.getNome(),
                responsavel.getTelefone(),
                EnderecoFormatter.resumoPrimeiroEndereco(responsavel.getEnderecos()),
                agendamentoRepository.countByAlunoIdAndStatus(aluno.getId(), EStatusAgendamento.AGENDADO),
                agendamentoRepository.countByAlunoIdAndStatus(aluno.getId(), EStatusAgendamento.CONFIRMADO),
                agendamentoRepository.countByAlunoIdAndStatus(aluno.getId(), EStatusAgendamento.FINALIZADO)
        );
    }

    @Transactional(readOnly = true)
    public Aluno buscarEntidadePorId(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Aluno", id));
    }

    /**
     * Implementa a decisão de modelagem Q1: quando paraMim=true, encontra/atualiza o Aluno
     * "titular" (ehProprioResponsavel=true) do cliente em vez de criar um novo a cada reserva -
     * mas os dados enviados na requisição atual sempre sobrescrevem o registro (input explícito
     * do usuário, diferente de um sync automático em segundo plano vindo do Cliente).
     * Quando não é para o próprio cliente, reaproveita um Aluno já cadastrado com o mesmo
     * nome+data de nascimento sob o mesmo responsável, ou cria um novo (ex.: "Sofia e Lara").
     */
    public Aluno buscarOuCriarParaResponsavel(Cliente responsavel, AlunoSelecaoRequestDTO selecao) {
        if (Boolean.TRUE.equals(selecao.paraMim())) {
            return buscarOuCriarTitular(responsavel, selecao);
        }
        return buscarOuCriarDependente(responsavel, selecao);
    }

    private Aluno buscarOuCriarTitular(Cliente responsavel, AlunoSelecaoRequestDTO selecao) {
        Aluno titular = alunoRepository.findByResponsavelIdAndEhProprioResponsavelTrue(responsavel.getId())
                .orElseGet(Aluno::new);
        titular.setResponsavel(responsavel);
        titular.setEhProprioResponsavel(true);
        titular.setNome(selecao.dadosAluno().nome());
        titular.setDataNascimento(selecao.dadosAluno().dataNascimento());
        titular.setSexo(selecao.dadosAluno().sexo());
        titular.setObservacoes(selecao.dadosAluno().observacoes());
        return alunoRepository.save(titular);
    }

    private Aluno buscarOuCriarDependente(Cliente responsavel, AlunoSelecaoRequestDTO selecao) {
        return alunoRepository.findByResponsavelIdAndNomeIgnoreCaseAndDataNascimento(
                        responsavel.getId(), selecao.dadosAluno().nome(), selecao.dadosAluno().dataNascimento())
                .orElseGet(() -> {
                    Aluno novo = alunoMapper.toEntity(selecao.dadosAluno());
                    novo.setResponsavel(responsavel);
                    novo.setEhProprioResponsavel(false);
                    return alunoRepository.save(novo);
                });
    }
}

package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteListItemResponseDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.mapper.ClienteMapper;
import com.pedrocanuto.agendamento.mapper.EnderecoMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.ClienteRepository;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final MatriculaRepository matriculaRepository;
    private final ClienteMapper clienteMapper;
    private final EnderecoMapper enderecoMapper;

    public ClienteService(ClienteRepository clienteRepository, AgendamentoRepository agendamentoRepository,
                           MatriculaRepository matriculaRepository, ClienteMapper clienteMapper,
                           EnderecoMapper enderecoMapper) {
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.matriculaRepository = matriculaRepository;
        this.clienteMapper = clienteMapper;
        this.enderecoMapper = enderecoMapper;
    }

    @Transactional(readOnly = true)
    public List<ClienteListItemResponseDTO> listarResumido() {
        return clienteRepository.listarTodosComEnderecos().stream().map(this::paraListItemComCategoria).toList();
    }

    /** Categoria do serviço mais recente do cliente (Q_categoria) - null quando ele ainda não tem nenhum agendamento. */
    private ClienteListItemResponseDTO paraListItemComCategoria(Cliente cliente) {
        ECategoriaServico categoriaServico = agendamentoRepository
                .findFirstByClienteIdOrderByDataHoraAgendamentoDesc(cliente.getId())
                .map(Agendamento::getCategoria)
                .orElse(null);
        return clienteMapper.toListItemResponseDTO(cliente, categoriaServico);
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarDetalhePorId(Long id) {
        return clienteMapper.toResponseDTO(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public Cliente buscarEntidadePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Cliente", id));
    }

    public ClienteResponseDTO criar(ClienteRequestDTO dto) {
        return clienteMapper.toResponseDTO(salvarNovoCliente(dto));
    }

    /**
     * Usado pelo fluxo público de agendamento: reaproveita o cliente existente pelo telefone
     * (chave natural, já que não há login) em vez de duplicar o cadastro a cada reserva.
     */
    public Cliente buscarOuCriar(ClienteRequestDTO dto) {
        String telefoneNormalizado = normalizarTelefone(dto.telefone());
        return clienteRepository.findByTelefone(telefoneNormalizado)
                .orElseGet(() -> salvarNovoCliente(dto));
    }

    private Cliente salvarNovoCliente(ClienteRequestDTO dto) {
        Cliente cliente = clienteMapper.toEntity(dto);
        cliente.setTelefone(normalizarTelefone(dto.telefone()));
        if (dto.enderecos() != null) {
            for (var enderecoDTO : dto.enderecos()) {
                Endereco endereco = enderecoMapper.toEntity(enderecoDTO);
                endereco.setCliente(cliente);
                cliente.getEnderecos().add(endereco);
            }
        }
        return clienteRepository.save(cliente);
    }

    public ClienteResponseDTO atualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = buscarEntidadePorId(id);
        cliente.setNome(dto.nome());
        cliente.setTelefone(normalizarTelefone(dto.telefone()));
        cliente.setEmail(dto.email());
        cliente.setCpf(dto.cpf());
        cliente.setCnpj(dto.cnpj());
        cliente.setDataNascimento(dto.dataNascimento());
        cliente.setSexo(dto.sexo());

        cliente.getEnderecos().clear();
        if (dto.enderecos() != null) {
            for (var enderecoDTO : dto.enderecos()) {
                Endereco endereco = enderecoMapper.toEntity(enderecoDTO);
                endereco.setCliente(cliente);
                cliente.getEnderecos().add(endereco);
            }
        }
        return clienteMapper.toResponseDTO(cliente);
    }

    /**
     * Exclusão definitiva e em cascata, a pedido explícito do professor (não existe soft-delete
     * hoje): remove primeiro os Agendamentos do cliente (referenciam matricula_id, sem cascade
     * de banco) e as Matriculas (mesmo motivo), na ordem certa para não violar FK - só então o
     * Cliente, cujo cascade de Endereco/Aluno (e Anamnese a partir de Aluno) já é automático via
     * JPA/banco (ver Cliente#enderecos, Cliente#alunos, migrations V1/V3).
     */
    public void deletar(Long id) {
        Cliente cliente = buscarEntidadePorId(id);
        agendamentoRepository.deleteAll(agendamentoRepository.findByClienteId(id));
        matriculaRepository.deleteAll(matriculaRepository.findByClienteId(id));
        clienteRepository.delete(cliente);
    }

    private String normalizarTelefone(String telefone) {
        return telefone.replaceAll("\\D", "");
    }
}

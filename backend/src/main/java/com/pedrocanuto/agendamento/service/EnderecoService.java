package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.dto.response.EnderecoListItemResponseDTO;
import com.pedrocanuto.agendamento.repository.EnderecoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    public EnderecoService(EnderecoRepository enderecoRepository) {
        this.enderecoRepository = enderecoRepository;
    }

    /** Listagem global para o painel do professor. Endereços não são deduplicados entre clientes de propósito (ver Endereco). */
    public List<EnderecoListItemResponseDTO> listarTodos() {
        return enderecoRepository.findAll().stream().map(this::paraListItem).toList();
    }

    private EnderecoListItemResponseDTO paraListItem(Endereco endereco) {
        return new EnderecoListItemResponseDTO(
                endereco.getId(),
                endereco.getRua(),
                endereco.getBairro(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getCep(),
                endereco.getCliente().getId(),
                endereco.getCliente().getNome()
        );
    }
}

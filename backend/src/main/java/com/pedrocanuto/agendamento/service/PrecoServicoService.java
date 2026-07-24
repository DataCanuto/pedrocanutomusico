package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.dto.request.PrecoServicoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.PrecoServicoResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.PrecoServicoMapper;
import com.pedrocanuto.agendamento.repository.PrecoServicoRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Única fonte de preço do sistema. O cliente nunca envia valor.
 *
 * <p>Para categorias de aula, cada combinação categoria+modalidade+tipoContratacao é definida
 * pelo backend (seed em V2__seed_precos_conhecidos.sql, a partir de prices.txt) - o professor só
 * pode AJUSTAR o valor/duração de uma combinação já existente, não criar combinações novas
 * livremente pela página de admin (é uma tabela de regras de negócio, não um cadastro livre).
 * Para EVENTO o catálogo continua livre (o professor cadastra quantos pacotes quiser).
 */
@Service
@Transactional
public class PrecoServicoService {

    private final PrecoServicoRepository precoServicoRepository;
    private final PrecoServicoMapper precoServicoMapper;

    public PrecoServicoService(PrecoServicoRepository precoServicoRepository, PrecoServicoMapper precoServicoMapper) {
        this.precoServicoRepository = precoServicoRepository;
        this.precoServicoMapper = precoServicoMapper;
    }

    @Transactional(readOnly = true)
    public List<PrecoServicoResponseDTO> listar() {
        return precoServicoRepository.findAllByOrderByCategoriaAscModalidadeAsc().stream()
                .map(precoServicoMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PrecoServico buscarPorCategoriaModalidadeEPacote(ECategoriaServico categoria, EModalidadeServico modalidade,
                                                              ETipoContratacao tipoContratacao) {
        return precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(categoria, modalidade, tipoContratacao)
                .orElseThrow(() -> new RegraDeNegocioException(
                        "Não existe pacote %s cadastrado para %s / %s.".formatted(tipoContratacao, categoria, modalidade)));
    }

    /** Usado pelo fluxo de agendamento de EVENTO: o cliente escolhe um pacote específico do catálogo, não uma modalidade fixa. */
    @Transactional(readOnly = true)
    public PrecoServico buscarPacoteDeEvento(Long precoServicoId) {
        PrecoServico preco = precoServicoRepository.findById(precoServicoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Pacote de evento", precoServicoId));
        if (preco.getCategoria() != ECategoriaServico.EVENTO) {
            throw new RegraDeNegocioException("O preço informado não é um pacote de EVENTO");
        }
        return preco;
    }

    public PrecoServicoResponseDTO criar(PrecoServicoRequestDTO dto) {
        validarConsistencia(dto);
        boolean isEvento = dto.categoria() == ECategoriaServico.EVENTO;
        if (!isEvento) {
            throw new RegraDeNegocioException(
                    "Preços de aula são definidos pelo backend (regra de negócio) - ajuste o valor de um pacote já existente em vez de criar um novo.");
        }
        PrecoServico entity = precoServicoMapper.toEntity(dto);
        entity.setAtualizadoEm(LocalDateTime.now());
        return precoServicoMapper.toResponseDTO(precoServicoRepository.save(entity));
    }

    public PrecoServicoResponseDTO atualizar(Long id, PrecoServicoRequestDTO dto) {
        validarConsistencia(dto);
        PrecoServico entity = precoServicoRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.paraId("Preço de serviço", id));

        boolean mudouChave = entity.getCategoria() != dto.categoria()
                || entity.getModalidade() != dto.modalidade()
                || entity.getTipoContratacao() != dto.tipoContratacao();
        if (dto.categoria() != ECategoriaServico.EVENTO && mudouChave
                && precoServicoRepository.existsByCategoriaAndModalidadeAndTipoContratacao(
                        dto.categoria(), dto.modalidade(), dto.tipoContratacao())) {
            throw new RegraDeNegocioException(
                    "Já existe preço cadastrado para %s / %s / %s.".formatted(dto.categoria(), dto.modalidade(), dto.tipoContratacao()));
        }

        precoServicoMapper.atualizarEntity(dto, entity);
        entity.setAtualizadoEm(LocalDateTime.now());
        return precoServicoMapper.toResponseDTO(entity);
    }

    private void validarConsistencia(PrecoServicoRequestDTO dto) {
        boolean isEvento = dto.categoria() == ECategoriaServico.EVENTO;
        if (isEvento) {
            if (dto.modalidade() != null || dto.tipoContratacao() != null) {
                throw new RegraDeNegocioException("Categoria EVENTO não deve ter modalidade nem tipoContratacao");
            }
            if (!StringUtils.hasText(dto.nome())) {
                throw new RegraDeNegocioException("Nome do pacote é obrigatório para categoria EVENTO");
            }
        } else {
            if (dto.modalidade() == null) {
                throw new RegraDeNegocioException("Modalidade é obrigatória para categorias que não são EVENTO");
            }
            if (dto.tipoContratacao() == null) {
                throw new RegraDeNegocioException("tipoContratacao é obrigatório para categorias que não são EVENTO");
            }
            if (dto.duracaoPadraoMinutos() == null) {
                throw new RegraDeNegocioException("duracaoPadraoMinutos é obrigatório para categorias que não são EVENTO");
            }
        }
    }
}

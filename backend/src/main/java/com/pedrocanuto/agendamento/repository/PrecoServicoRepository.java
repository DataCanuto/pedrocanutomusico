package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrecoServicoRepository extends JpaRepository<PrecoServico, Long> {

    Optional<PrecoServico> findByCategoriaAndModalidadeAndTipoContratacao(
            ECategoriaServico categoria, EModalidadeServico modalidade, ETipoContratacao tipoContratacao);

    List<PrecoServico> findAllByOrderByCategoriaAscModalidadeAsc();

    boolean existsByCategoriaAndModalidadeAndTipoContratacao(
            ECategoriaServico categoria, EModalidadeServico modalidade, ETipoContratacao tipoContratacao);
}

package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TurmaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "codigo", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "criadaEm", ignore = true)
    @Mapping(target = "local", ignore = true)
    @Mapping(source = "endereco.cep", target = "enderecoCep")
    @Mapping(source = "endereco.rua", target = "enderecoRua")
    @Mapping(source = "endereco.numero", target = "enderecoNumero")
    @Mapping(source = "endereco.bairro", target = "enderecoBairro")
    @Mapping(source = "endereco.cidade", target = "enderecoCidade")
    @Mapping(source = "endereco.estado", target = "enderecoEstado")
    @Mapping(source = "endereco.complemento", target = "enderecoComplemento")
    Turma toEntity(TurmaRequestDTO dto);

    @Mapping(target = "endereco", expression = "java(paraEnderecoDTO(entity))")
    TurmaResponseDTO toResponseDTO(Turma entity);

    /** Nulo para turmas criadas antes da coluna de endereço estruturado existir (dado perdido - ver Turma#enderecoCep). */
    default EnderecoRequestDTO paraEnderecoDTO(Turma entity) {
        if (entity.getEnderecoCep() == null) {
            return null;
        }
        return new EnderecoRequestDTO(entity.getEnderecoCep(), entity.getEnderecoRua(), entity.getEnderecoNumero(),
                entity.getEnderecoBairro(), entity.getEnderecoCidade(), entity.getEnderecoEstado(), entity.getEnderecoComplemento());
    }
}

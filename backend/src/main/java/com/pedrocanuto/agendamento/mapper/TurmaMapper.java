package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AlunoDaTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.InscricaoTurmaResponseDTO;
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

    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "turmaCodigo", source = "turma.codigo")
    @Mapping(target = "categoria", source = "turma.categoria")
    @Mapping(target = "instrumento", source = "turma.instrumento")
    @Mapping(target = "diaSemana", source = "turma.diaSemana")
    @Mapping(target = "hora", source = "turma.hora")
    @Mapping(target = "local", source = "turma.local")
    @Mapping(target = "tipoContratacao", source = "matricula.tipoContratacao")
    @Mapping(target = "valorTotal", source = "matricula.valorTotal")
    InscricaoTurmaResponseDTO toInscricaoResponseDTO(Matricula matricula, Turma turma);

    /** Nulo para turmas criadas antes da coluna de endereço estruturado existir (dado perdido - ver Turma#enderecoCep). */
    default EnderecoRequestDTO paraEnderecoDTO(Turma entity) {
        if (entity.getEnderecoCep() == null) {
            return null;
        }
        return new EnderecoRequestDTO(entity.getEnderecoCep(), entity.getEnderecoRua(), entity.getEnderecoNumero(),
                entity.getEnderecoBairro(), entity.getEnderecoCidade(), entity.getEnderecoEstado(), entity.getEnderecoComplemento());
    }

    /** Uma linha do roster de turma (ver TurmaService#listarComAlunos e TurmaOcorrenciaService) - status ATIVA/CANCELADA da matrícula representa ativo/inativo. */
    default AlunoDaTurmaResponseDTO paraAlunoDaTurma(Matricula matricula) {
        Aluno aluno = matricula.getAluno();
        Cliente responsavel = aluno.getResponsavel();
        return new AlunoDaTurmaResponseDTO(
                aluno.getId(),
                matricula.getId(),
                aluno.getNome(),
                aluno.getIdade(),
                EnderecoFormatter.resumoPrimeiroEndereco(responsavel.getEnderecos()),
                responsavel.getTelefone(),
                matricula.getStatus()
        );
    }
}

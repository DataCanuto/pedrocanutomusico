package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

/** Turma + roster de alunos matriculados (Q_verTurmas) - painel do professor, mesmo padrão de clique-para-expandir da vitrine de serviços. */
public record TurmaComAlunosResponseDTO(
        Long id,
        String codigo,
        ECategoriaServico categoria,
        EInstrumento instrumento,
        DayOfWeek diaSemana,
        LocalTime hora,
        String local,
        /** Nulo só para turmas criadas antes do endereço estruturado existir - ver Turma#enderecoCep. */
        EnderecoRequestDTO endereco,
        EStatusTurma status,
        List<AlunoDaTurmaResponseDTO> alunos
) {
}

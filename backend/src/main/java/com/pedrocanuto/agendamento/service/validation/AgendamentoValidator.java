package com.pedrocanuto.agendamento.service.validation;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import com.pedrocanuto.agendamento.dto.request.AgendamentoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.HorarioRecorrenteRequestDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Centraliza as regras condicionais por categoria que o Bean Validation não expressa bem
 * (campo obrigatório/proibido dependendo do valor de outro campo). Usa
 * {@link ECategoriaServico#isAulaTipo()}/{@link ECategoriaServico#isEvento()} em vez de
 * espalhar "if (categoria == EVENTO)" pelos services.
 */
@Component
public class AgendamentoValidator {

    private static final LocalTime INICIO_EXPEDIENTE = LocalTime.of(8, 0);
    private static final LocalTime FIM_EXPEDIENTE = LocalTime.of(18, 0);
    private static final LocalTime FIM_EXPEDIENTE_SABADO = LocalTime.of(13, 0);
    private static final int GRADE_MINUTOS = 15;

    public void validarCamposPorCategoria(AgendamentoRequestDTO dto) {
        if (dto.cliente().enderecos() == null || dto.cliente().enderecos().isEmpty()) {
            throw new RegraDeNegocioException("Informe pelo menos um endereço");
        }
        if (dto.categoria().isEvento()) {
            if (dto.hora() == null) {
                throw new RegraDeNegocioException("hora é obrigatória");
            }
            validarHorario(dto.hora());
            validarCamposDeEvento(dto);
        } else {
            validarCamposDeAula(dto);
        }
    }

    /**
     * Horário só pode ser um dos slots de 08h às 18h, de 15 em 15 minutos, sem restrição de dia da
     * semana. Só se aplica à categoria EVENTO - eventos podem ser marcados em qualquer dia
     * disponível (inclusive domingo), diferente das categorias de aula - ver
     * {@link #validarHorarioDeAula}.
     */
    public void validarHorario(LocalTime hora) {
        validarGrade(hora);
        if (hora.isBefore(INICIO_EXPEDIENTE) || hora.isAfter(FIM_EXPEDIENTE)) {
            throw new RegraDeNegocioException("Horário deve estar entre %s e %s".formatted(INICIO_EXPEDIENTE, FIM_EXPEDIENTE));
        }
    }

    /**
     * Expediente das categorias de aula (Musicalização, Musicoterapia, Aula de Instrumento):
     * segunda a sexta das 08h às 18h, sábado das 08h às 13h, sem atendimento aos domingos (nesse
     * caso só EVENTO pode ser marcado - ver {@link #validarHorario}).
     */
    public void validarHorarioDeAula(DayOfWeek diaSemana, LocalTime hora) {
        validarGrade(hora);
        LocalTime fimExpediente = switch (diaSemana) {
            case SUNDAY -> throw new RegraDeNegocioException(
                    "Não há expediente de aulas aos domingos - disponível apenas para categoria EVENTO");
            case SATURDAY -> FIM_EXPEDIENTE_SABADO;
            default -> FIM_EXPEDIENTE;
        };
        if (hora.isBefore(INICIO_EXPEDIENTE) || hora.isAfter(fimExpediente)) {
            throw new RegraDeNegocioException("Horário deve estar entre %s e %s".formatted(INICIO_EXPEDIENTE, fimExpediente));
        }
    }

    public void validarHorarioDeAula(LocalDate data, LocalTime hora) {
        validarHorarioDeAula(data.getDayOfWeek(), hora);
    }

    private void validarGrade(LocalTime hora) {
        if (hora.getSecond() != 0 || hora.getNano() != 0 || hora.getMinute() % GRADE_MINUTOS != 0) {
            throw new RegraDeNegocioException("Horário deve ser em intervalos de %d minutos (ex.: 08:00, 08:15, 08:30...)".formatted(GRADE_MINUTOS));
        }
    }

    private void validarCamposDeEvento(AgendamentoRequestDTO dto) {
        if (dto.data() == null) {
            throw new RegraDeNegocioException("data é obrigatória");
        }
        if (dto.recorrencias() != null && !dto.recorrencias().isEmpty()) {
            throw new RegraDeNegocioException("Categoria EVENTO não deve informar recorrencias (evento não é recorrente)");
        }
        if (dto.tipoEvento() == null) {
            throw new RegraDeNegocioException("tipoEvento é obrigatório para categoria EVENTO");
        }
        if (dto.enderecoEvento() == null) {
            throw new RegraDeNegocioException("enderecoEvento é obrigatório para categoria EVENTO");
        }
        if (dto.eventoPrecoServicoId() == null) {
            throw new RegraDeNegocioException("Selecione um pacote de evento (eventoPrecoServicoId é obrigatório)");
        }
        if (dto.aluno() != null && dto.tipoEvento() != ETipoEvento.ANIVERSARIO) {
            throw new RegraDeNegocioException("Categoria EVENTO só aceita aluno quando tipoEvento é ANIVERSARIO (nome do aniversariante)");
        }
        if (dto.modalidade() != null || dto.tipoContratacao() != null) {
            throw new RegraDeNegocioException("Categoria EVENTO não deve informar modalidade/tipoContratacao (não há pacote de aula para evento)");
        }
        if (dto.instrumento() != null) {
            throw new RegraDeNegocioException("Categoria EVENTO não deve informar instrumento");
        }
        if (dto.anamnese() != null) {
            throw new RegraDeNegocioException("Categoria EVENTO não deve informar anamnese");
        }
    }

    private void validarCamposDeAula(AgendamentoRequestDTO dto) {
        if (dto.aluno() == null) {
            throw new RegraDeNegocioException("aluno é obrigatório para esta categoria de serviço");
        }
        if (dto.modalidade() == null) {
            throw new RegraDeNegocioException("modalidade é obrigatória para esta categoria de serviço");
        }
        if (dto.tipoContratacao() == null) {
            throw new RegraDeNegocioException("tipoContratacao é obrigatório para esta categoria de serviço (selecione um pacote)");
        }
        if (dto.tipoEvento() != null || dto.enderecoEvento() != null || dto.eventoPrecoServicoId() != null) {
            throw new RegraDeNegocioException("Campos de evento não se aplicam a esta categoria de serviço");
        }
        boolean isInstrumento = dto.categoria() == ECategoriaServico.AULA_INSTRUMENTO;
        if (isInstrumento && dto.instrumento() == null) {
            throw new RegraDeNegocioException("instrumento é obrigatório para categoria AULA_INSTRUMENTO");
        }
        if (!isInstrumento && dto.instrumento() != null) {
            throw new RegraDeNegocioException("instrumento só se aplica à categoria AULA_INSTRUMENTO");
        }
        if (dto.categoria() != ECategoriaServico.MUSICOTERAPIA && dto.anamnese() != null) {
            throw new RegraDeNegocioException("anamnese só se aplica à categoria MUSICOTERAPIA");
        }
        validarDataOuRecorrencias(dto);
    }

    /**
     * AVULSO é uma visita única: exige data/hora e proíbe recorrencias. PACOTE_4/PACOTE_12 é o
     * oposto: o cliente escolhe dia(s) da semana + horário (1 a 3) e o servidor gera as datas -
     * ver GeradorDeDatasRecorrentes - então data/hora soltos não fazem sentido aqui.
     */
    private void validarDataOuRecorrencias(AgendamentoRequestDTO dto) {
        boolean ehPacote = dto.tipoContratacao() != ETipoContratacao.AVULSO;
        if (!ehPacote) {
            if (dto.data() == null || dto.hora() == null) {
                throw new RegraDeNegocioException("data e hora são obrigatórias para tipoContratacao AVULSO");
            }
            if (dto.recorrencias() != null && !dto.recorrencias().isEmpty()) {
                throw new RegraDeNegocioException("tipoContratacao AVULSO não deve informar recorrencias");
            }
            validarHorarioDeAula(dto.data(), dto.hora());
            return;
        }
        if (dto.data() != null || dto.hora() != null) {
            throw new RegraDeNegocioException("Pacotes recorrentes não devem informar data/hora soltos - use recorrencias");
        }
        List<HorarioRecorrenteRequestDTO> recorrencias = dto.recorrencias();
        if (recorrencias == null || recorrencias.isEmpty() || recorrencias.size() > 3) {
            throw new RegraDeNegocioException("Selecione de 1 a 3 dias da semana + horário para este pacote (recorrencias)");
        }
        Set<HorarioRecorrenteRequestDTO> semDuplicados = new HashSet<>();
        for (HorarioRecorrenteRequestDTO recorrencia : recorrencias) {
            validarHorarioDeAula(recorrencia.diaSemana(), recorrencia.hora());
            if (!semDuplicados.add(recorrencia)) {
                throw new RegraDeNegocioException(
                        "Dia da semana/horário duplicado em recorrencias: %s %s".formatted(recorrencia.diaSemana(), recorrencia.hora()));
            }
        }
    }
}

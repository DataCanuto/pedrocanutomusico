package com.pedrocanuto.agendamento.service.validation;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.dto.request.AgendamentoRequestDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import java.time.LocalTime;
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
    private static final int GRADE_MINUTOS = 15;

    public void validarCamposPorCategoria(AgendamentoRequestDTO dto) {
        validarHorario(dto.hora());
        if (dto.categoria().isEvento()) {
            validarCamposDeEvento(dto);
        } else {
            validarCamposDeAula(dto);
        }
    }

    /** Horário só pode ser um dos slots de 08h às 18h, de 15 em 15 minutos - usado também na inscrição em Turma. */
    public void validarHorario(LocalTime hora) {
        if (hora.isBefore(INICIO_EXPEDIENTE) || hora.isAfter(FIM_EXPEDIENTE)) {
            throw new RegraDeNegocioException("Horário deve estar entre %s e %s".formatted(INICIO_EXPEDIENTE, FIM_EXPEDIENTE));
        }
        if (hora.getSecond() != 0 || hora.getNano() != 0 || hora.getMinute() % GRADE_MINUTOS != 0) {
            throw new RegraDeNegocioException("Horário deve ser em intervalos de %d minutos (ex.: 08:00, 08:15, 08:30...)".formatted(GRADE_MINUTOS));
        }
    }

    private void validarCamposDeEvento(AgendamentoRequestDTO dto) {
        if (dto.tipoEvento() == null) {
            throw new RegraDeNegocioException("tipoEvento é obrigatório para categoria EVENTO");
        }
        if (dto.enderecoEvento() == null) {
            throw new RegraDeNegocioException("enderecoEvento é obrigatório para categoria EVENTO");
        }
        if (dto.eventoPrecoServicoId() == null) {
            throw new RegraDeNegocioException("Selecione um pacote de evento (eventoPrecoServicoId é obrigatório)");
        }
        if (dto.aluno() != null) {
            throw new RegraDeNegocioException("Categoria EVENTO não deve informar aluno");
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
    }
}

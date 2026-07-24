package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * enderecoResumo e clienteTelefone existem aqui pensando no painel administrativo futuro
 * (PROJECT.md: ao clicar num agendamento, mostrar cliente/endereço/telefone/serviço/observações
 * e permitir copiar endereço / abrir Waze / WhatsApp) - não construímos essa tela agora, mas o
 * response já carrega o necessário para ela. pacoteEventoNome só é preenchido para EVENTO.
 * codigoPublico é o identificador não sequencial que o cliente usa para consultar sua própria
 * aula (GET /api/agendamentos/publico/{codigoPublico}) sem expor a de terceiros por tentativa.
 */
public record AgendamentoResponseDTO(
        Long id,
        String codigoPublico,
        Long clienteId,
        String clienteNome,
        String clienteTelefone,
        String enderecoResumo,
        Long alunoId,
        String alunoNome,
        Long matriculaId,
        Long turmaId,
        ECategoriaServico categoria,
        EModalidadeServico modalidade,
        EInstrumento instrumento,
        ETipoEvento tipoEvento,
        String local,
        String pacoteEventoNome,
        List<String> musicasObrigatorias,
        BigDecimal valorCobrado,
        Integer duracaoMinutos,
        LocalDate data,
        LocalTime hora,
        EStatusAgendamento status,
        LocalDateTime dataHoraCheckIn,
        LocalDateTime dataHoraFinalizacao,
        String observacoes,
        LocalDateTime dataHoraAgendamento
) {
}

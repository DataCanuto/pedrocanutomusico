package com.pedrocanuto.agendamento.service.validation;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import com.pedrocanuto.agendamento.dto.request.AgendamentoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AlunoSelecaoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AnamneseMusicoterapiaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.HorarioRecorrenteRequestDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class AgendamentoValidatorTest {

    private final AgendamentoValidator validator = new AgendamentoValidator();

    @Test
    void aceitaHorariosNaGradeDe15MinutosDentroDoExpediente() {
        assertThatCode(() -> validator.validarHorario(LocalTime.of(8, 0))).doesNotThrowAnyException();
        assertThatCode(() -> validator.validarHorario(LocalTime.of(13, 45))).doesNotThrowAnyException();
        assertThatCode(() -> validator.validarHorario(LocalTime.of(18, 0))).doesNotThrowAnyException();
    }

    @Test
    void rejeitaHorarioForaDaGrade() {
        assertThatThrownBy(() -> validator.validarHorario(LocalTime.of(10, 5)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("15 minutos");
    }

    @Test
    void rejeitaHorarioForaDoExpediente() {
        assertThatThrownBy(() -> validator.validarHorario(LocalTime.of(7, 45)))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("08:00");
        assertThatThrownBy(() -> validator.validarHorario(LocalTime.of(18, 15)))
                .isInstanceOf(RegraDeNegocioException.class);
    }

    @Test
    void rejeitaSemEnderecoDoCliente() {
        ClienteRequestDTO clienteSemEndereco =
                new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null, List.of());
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(
                clienteSemEndereco, alunoSelecao(), ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL,
                ETipoContratacao.AVULSO, null, null, null, null, null, null, null,
                LocalDate.now().plusDays(3), LocalTime.of(10, 0), null, null);

        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("endereço");
    }

    @Test
    void aceitaAgendamentoDeAulaComTodosOsCamposObrigatorios() {
        AgendamentoRequestDTO dto = aulaDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, null);
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void rejeitaAulaSemAluno() {
        AgendamentoRequestDTO dto = base(ECategoriaServico.MUSICALIZACAO_INFANTIL, null,
                EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, null, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("aluno");
    }

    @Test
    void rejeitaAulaSemTipoContratacao() {
        AgendamentoRequestDTO dto = base(ECategoriaServico.MUSICALIZACAO_INFANTIL, alunoSelecao(),
                EModalidadeServico.INDIVIDUAL, null, null, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("tipoContratacao");
    }

    @Test
    void rejeitaAulaDeInstrumentoSemInstrumentoEscolhido() {
        AgendamentoRequestDTO dto = aulaDTO(ECategoriaServico.AULA_INSTRUMENTO, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("instrumento");
    }

    @Test
    void aceitaAulaDeInstrumentoComInstrumentoEscolhido() {
        AgendamentoRequestDTO dto = aulaDTO(ECategoriaServico.AULA_INSTRUMENTO, EInstrumento.VIOLAO);
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void rejeitaMusicalizacaoComInstrumentoPreenchido() {
        AgendamentoRequestDTO dto = aulaDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, EInstrumento.VIOLAO);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("instrumento");
    }

    @Test
    void aceitaEventoComTodosOsCamposObrigatorios() {
        AgendamentoRequestDTO dto = eventoDTO(1L);
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void rejeitaEventoComAlunoPreenchidoForaDeAniversario() {
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(
                clienteDTO(), alunoSelecao(), ECategoriaServico.EVENTO, null, null, null,
                ETipoEvento.CASAMENTO, 1L, enderecoEvento(), null, null, null,
                LocalDate.now().plusDays(5), LocalTime.of(15, 0), null, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("aluno");
    }

    @Test
    void aceitaEventoDeAniversarioComAluno() {
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(
                clienteDTO(), alunoSelecao(), ECategoriaServico.EVENTO, null, null, null,
                ETipoEvento.ANIVERSARIO, 1L, enderecoEvento(), null, null, null,
                LocalDate.now().plusDays(5), LocalTime.of(15, 0), null, null);
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void rejeitaEventoSemEnderecoEvento() {
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(
                clienteDTO(), null, ECategoriaServico.EVENTO, null, null, null,
                ETipoEvento.CASAMENTO, 1L, null, null, null, null,
                LocalDate.now().plusDays(10), LocalTime.of(18, 0), null, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("enderecoEvento");
    }

    @Test
    void rejeitaEventoSemEscolherPacote() {
        AgendamentoRequestDTO dto = eventoDTO(null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("eventoPrecoServicoId");
    }

    @Test
    void rejeitaAnamneseForaDeMusicoterapia() {
        AgendamentoRequestDTO dto = base(ECategoriaServico.MUSICALIZACAO_INFANTIL, alunoSelecao(),
                EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, null, anamneseDTO());
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("anamnese");
    }

    @Test
    void aceitaMusicoterapiaComAnamnese() {
        AgendamentoRequestDTO dto = base(ECategoriaServico.MUSICOTERAPIA, alunoSelecao(),
                EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, null, anamneseDTO());
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void aceitaMusicoterapiaSemAnamnese() {
        AgendamentoRequestDTO dto = base(ECategoriaServico.MUSICOTERAPIA, alunoSelecao(),
                EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, null, null);
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void rejeitaEventoComAnamnese() {
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(
                clienteDTO(), null, ECategoriaServico.EVENTO, null, null, null,
                ETipoEvento.ANIVERSARIO, 1L, enderecoEvento(), null, null, anamneseDTO(),
                LocalDate.now().plusDays(5), LocalTime.of(15, 0), null, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("anamnese");
    }

    private AgendamentoRequestDTO aulaDTO(ECategoriaServico categoria, EInstrumento instrumento) {
        return base(categoria, alunoSelecao(), EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, instrumento, null);
    }

    private AnamneseMusicoterapiaRequestDTO anamneseDTO() {
        return new AnamneseMusicoterapiaRequestDTO(
                30, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    private AgendamentoRequestDTO eventoDTO(Long eventoPrecoServicoId) {
        return new AgendamentoRequestDTO(
                clienteDTO(), null, ECategoriaServico.EVENTO, null, null, null,
                ETipoEvento.ANIVERSARIO, eventoPrecoServicoId, enderecoEvento(), null, null, null,
                LocalDate.now().plusDays(5), LocalTime.of(15, 0), null, "Festa de 5 anos");
    }

    private EnderecoRequestDTO enderecoEvento() {
        return new EnderecoRequestDTO("41700-000", "Av. Oceânica", "500", "Pituba", "Salvador", "BA", "Salão de festas X");
    }

    private AgendamentoRequestDTO base(ECategoriaServico categoria, AlunoSelecaoRequestDTO aluno,
                                        EModalidadeServico modalidade, ETipoContratacao tipoContratacao,
                                        EInstrumento instrumento, AnamneseMusicoterapiaRequestDTO anamnese) {
        return new AgendamentoRequestDTO(
                clienteDTO(), aluno, categoria, modalidade, tipoContratacao, instrumento,
                null, null, null, null, null, anamnese,
                LocalDate.now().plusDays(3), LocalTime.of(10, 0), null, null);
    }

    private AgendamentoRequestDTO pacoteDTO(ETipoContratacao tipoContratacao, List<HorarioRecorrenteRequestDTO> recorrencias) {
        return new AgendamentoRequestDTO(
                clienteDTO(), alunoSelecao(), ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL,
                tipoContratacao, null, null, null, null, null, null, null,
                null, null, recorrencias, null);
    }

    @Test
    void aceitaPacoteComRecorrenciasValidas() {
        AgendamentoRequestDTO dto = pacoteDTO(ETipoContratacao.PACOTE_4,
                List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, LocalTime.of(15, 0)),
                        new HorarioRecorrenteRequestDTO(DayOfWeek.THURSDAY, LocalTime.of(16, 0))));
        assertThatCode(() -> validator.validarCamposPorCategoria(dto)).doesNotThrowAnyException();
    }

    @Test
    void rejeitaPacoteSemRecorrencias() {
        AgendamentoRequestDTO dto = pacoteDTO(ETipoContratacao.PACOTE_4, null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("recorrencias");
    }

    @Test
    void rejeitaPacoteComMaisDeTresRecorrencias() {
        AgendamentoRequestDTO dto = pacoteDTO(ETipoContratacao.PACOTE_12,
                List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.MONDAY, LocalTime.of(9, 0)),
                        new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, LocalTime.of(9, 0)),
                        new HorarioRecorrenteRequestDTO(DayOfWeek.WEDNESDAY, LocalTime.of(9, 0)),
                        new HorarioRecorrenteRequestDTO(DayOfWeek.THURSDAY, LocalTime.of(9, 0))));
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("recorrencias");
    }

    @Test
    void rejeitaPacoteComRecorrenciaDuplicada() {
        AgendamentoRequestDTO dto = pacoteDTO(ETipoContratacao.PACOTE_4,
                List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, LocalTime.of(15, 0)),
                        new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, LocalTime.of(15, 0))));
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("duplicado");
    }

    @Test
    void rejeitaAvulsoComRecorrenciasPreenchidas() {
        AgendamentoRequestDTO base = aulaDTO(ECategoriaServico.MUSICALIZACAO_INFANTIL, null);
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO(
                base.cliente(), base.aluno(), base.categoria(), base.modalidade(), base.tipoContratacao(), base.instrumento(),
                null, null, null, null, null, null,
                base.data(), base.hora(), List.of(new HorarioRecorrenteRequestDTO(DayOfWeek.TUESDAY, LocalTime.of(15, 0))), null);
        assertThatThrownBy(() -> validator.validarCamposPorCategoria(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("recorrencias");
    }

    private ClienteRequestDTO clienteDTO() {
        return new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null, List.of(enderecoEvento()));
    }

    private AlunoSelecaoRequestDTO alunoSelecao() {
        return new AlunoSelecaoRequestDTO(false, new AlunoRequestDTO("Sofia Souza", LocalDate.of(2020, 3, 10), null, null));
    }
}

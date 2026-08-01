package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteListItemResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.ClienteMapper;
import com.pedrocanuto.agendamento.mapper.EnderecoMapper;
import com.pedrocanuto.agendamento.repository.AgendamentoRepository;
import com.pedrocanuto.agendamento.repository.ClienteRepository;
import com.pedrocanuto.agendamento.repository.MatriculaRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;
    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private MatriculaRepository matriculaRepository;
    @Mock
    private ClienteMapper clienteMapper;
    @Mock
    private EnderecoMapper enderecoMapper;

    private ClienteService clienteService;

    @BeforeEach
    void setUp() {
        clienteService = new ClienteService(clienteRepository, agendamentoRepository, matriculaRepository,
                clienteMapper, enderecoMapper);
    }

    @Test
    void deletarRemoveAgendamentosEMatriculasAntesDoClienteNaOrdemCerta() {
        Cliente cliente = new Cliente();
        cliente.setId(7L);
        when(clienteRepository.findById(7L)).thenReturn(Optional.of(cliente));

        List<Agendamento> agendamentos = List.of(new Agendamento());
        when(agendamentoRepository.findByClienteId(7L)).thenReturn(agendamentos);

        List<Matricula> matriculas = List.of(new Matricula());
        when(matriculaRepository.findByClienteId(7L)).thenReturn(matriculas);

        clienteService.deletar(7L);

        // Ordem importa: agendamento referencia matricula_id e matricula referencia cliente_id,
        // nenhum dos dois com ON DELETE CASCADE no banco (ver V1__criar_tabelas_iniciais.sql) -
        // excluir fora dessa ordem quebraria por violação de FK.
        InOrder ordem = Mockito.inOrder(agendamentoRepository, matriculaRepository, clienteRepository);
        ordem.verify(agendamentoRepository).deleteAll(agendamentos);
        ordem.verify(matriculaRepository).deleteAll(matriculas);
        ordem.verify(clienteRepository).delete(cliente);
    }

    @Test
    void deletarLancaExcecaoQuandoClienteNaoExiste() {
        when(clienteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clienteService.deletar(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void listarResumidoDerivaCategoriaDoAgendamentoMaisRecente() {
        Cliente cliente = new Cliente();
        cliente.setId(3L);
        when(clienteRepository.listarTodosComEnderecos()).thenReturn(List.of(cliente));

        Agendamento maisRecente = new Agendamento();
        maisRecente.setCategoria(ECategoriaServico.AULA_INSTRUMENTO);
        when(agendamentoRepository.findFirstByClienteIdOrderByDataHoraAgendamentoDesc(3L))
                .thenReturn(Optional.of(maisRecente));

        ClienteListItemResponseDTO esperado =
                new ClienteListItemResponseDTO(3L, "Maria", "71999588950", null, ECategoriaServico.AULA_INSTRUMENTO);
        when(clienteMapper.toListItemResponseDTO(cliente, ECategoriaServico.AULA_INSTRUMENTO)).thenReturn(esperado);

        assertThat(clienteService.listarResumido()).containsExactly(esperado);
    }

    @Test
    void listarResumidoUsaCategoriaNulaQuandoClienteNaoTemAgendamento() {
        Cliente cliente = new Cliente();
        cliente.setId(4L);
        when(clienteRepository.listarTodosComEnderecos()).thenReturn(List.of(cliente));
        when(agendamentoRepository.findFirstByClienteIdOrderByDataHoraAgendamentoDesc(4L)).thenReturn(Optional.empty());

        ClienteListItemResponseDTO esperado = new ClienteListItemResponseDTO(4L, "João", "71988887777", null, null);
        when(clienteMapper.toListItemResponseDTO(cliente, null)).thenReturn(esperado);

        assertThat(clienteService.listarResumido()).containsExactly(esperado);
    }

    @Test
    void criarLancaExcecaoSemEndereco() {
        ClienteRequestDTO dto = new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null, List.of());

        assertThatThrownBy(() -> clienteService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("endereço");
    }

    @Test
    void atualizarLancaExcecaoSemEndereco() {
        ClienteRequestDTO dto = new ClienteRequestDTO("Maria Souza", "71999588950", null, null, null, null, null, null);

        assertThatThrownBy(() -> clienteService.atualizar(1L, dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("endereço");
    }
}

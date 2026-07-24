package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.MusicoParceiro;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.dto.request.MusicoParceiroRequestDTO;
import com.pedrocanuto.agendamento.dto.response.MusicoParceiroResponseDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.MusicoParceiroMapper;
import com.pedrocanuto.agendamento.repository.MusicoParceiroRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MusicoParceiroServiceTest {

    @Mock
    private MusicoParceiroRepository musicoParceiroRepository;
    @Mock
    private MusicoParceiroMapper musicoParceiroMapper;

    private MusicoParceiroService musicoParceiroService;

    @BeforeEach
    void setUp() {
        musicoParceiroService = new MusicoParceiroService(musicoParceiroRepository, musicoParceiroMapper);
    }

    @Test
    void criarRejeitaCpfJaCadastrado() {
        when(musicoParceiroRepository.existsByCpf("12345678901")).thenReturn(true);
        MusicoParceiroRequestDTO dto = new MusicoParceiroRequestDTO("João Silva", "12345678901", "71999998888", EInstrumento.VIOLAO);

        assertThatThrownBy(() -> musicoParceiroService.criar(dto))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("CPF");
    }

    @Test
    void criarSalvaQuandoCpfEhNovo() {
        when(musicoParceiroRepository.existsByCpf("12345678901")).thenReturn(false);
        MusicoParceiro entidade = new MusicoParceiro();
        when(musicoParceiroMapper.toEntity(any())).thenReturn(entidade);
        when(musicoParceiroRepository.save(entidade)).thenReturn(entidade);
        when(musicoParceiroMapper.toResponseDTO(entidade)).thenReturn(
                new MusicoParceiroResponseDTO(1L, "João Silva", "12345678901", "71999998888", EInstrumento.VIOLAO, LocalDateTime.now()));

        MusicoParceiroRequestDTO dto = new MusicoParceiroRequestDTO("João Silva", "12345678901", "71999998888", EInstrumento.VIOLAO);
        MusicoParceiroResponseDTO resultado = musicoParceiroService.criar(dto);

        assertThat(resultado.nome()).isEqualTo("João Silva");
    }
}

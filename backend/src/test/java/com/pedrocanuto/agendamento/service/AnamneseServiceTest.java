package com.pedrocanuto.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Anamnese;
import com.pedrocanuto.agendamento.dto.request.AnamneseMusicoterapiaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AnamneseMusicoterapiaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.mapper.AnamneseMapper;
import com.pedrocanuto.agendamento.repository.AnamneseRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AnamneseServiceTest {

    @Mock
    private AnamneseRepository anamneseRepository;
    @Mock
    private AnamneseMapper anamneseMapper;

    private AnamneseService anamneseService;

    @BeforeEach
    void setUp() {
        anamneseService = new AnamneseService(anamneseRepository, anamneseMapper);
    }

    @Test
    void criarSeAusenteNaoFazNadaQuandoDtoNulo() {
        Aluno aluno = new Aluno();
        aluno.setId(1L);

        anamneseService.criarSeAusente(aluno, null);

        verify(anamneseRepository, never()).save(any());
    }

    @Test
    void criarSeAusenteNaoSobrescreveQuandoAlunoJaTemAnamnese() {
        Aluno aluno = new Aluno();
        aluno.setId(2L);
        when(anamneseRepository.existsByAlunoId(2L)).thenReturn(true);

        anamneseService.criarSeAusente(aluno, anamneseDTO());

        verify(anamneseRepository, never()).save(any());
    }

    @Test
    void criarSeAusenteCriaQuandoAlunoNaoTemAnamnese() {
        Aluno aluno = new Aluno();
        aluno.setId(3L);
        when(anamneseRepository.existsByAlunoId(3L)).thenReturn(false);
        Anamnese entidade = new Anamnese();
        when(anamneseMapper.toEntity(any(AnamneseMusicoterapiaRequestDTO.class))).thenReturn(entidade);

        anamneseService.criarSeAusente(aluno, anamneseDTO());

        assertThat(entidade.getAluno()).isSameAs(aluno);
        verify(anamneseRepository).save(entidade);
    }

    @Test
    void buscarPorAlunoLancaExcecaoQuandoNaoEncontrado() {
        when(anamneseRepository.findByAlunoId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> anamneseService.buscarPorAluno(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void buscarPorAlunoRetornaDTOQuandoEncontrado() {
        Anamnese entidade = new Anamnese();
        AnamneseMusicoterapiaResponseDTO responseDTO = new AnamneseMusicoterapiaResponseDTO(
                1L, 4L, 30, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        when(anamneseRepository.findByAlunoId(4L)).thenReturn(Optional.of(entidade));
        when(anamneseMapper.toResponseDTO(entidade)).thenReturn(responseDTO);

        AnamneseMusicoterapiaResponseDTO resultado = anamneseService.buscarPorAluno(4L);

        assertThat(resultado.idade()).isEqualTo(30);
    }

    private AnamneseMusicoterapiaRequestDTO anamneseDTO() {
        return new AnamneseMusicoterapiaRequestDTO(
                30, null, null, null, null, null, null, null, null, null, null, null, null, null);
    }
}

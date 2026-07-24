package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.domain.Anamnese;
import com.pedrocanuto.agendamento.dto.request.AnamneseMusicoterapiaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AnamneseMusicoterapiaResponseDTO;
import com.pedrocanuto.agendamento.exception.RecursoNaoEncontradoException;
import com.pedrocanuto.agendamento.mapper.AnamneseMapper;
import com.pedrocanuto.agendamento.repository.AnamneseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * A anamnese é 1:1 com o {@link Aluno} (perfil do paciente de Musicoterapia) - preenchida uma
 * única vez, não a cada agendamento. {@link #criarSeAusente} é chamado só por
 * {@code AgendamentoService.criar}; agendamentos seguintes do mesmo aluno não sobrescrevem a
 * anamnese já registrada (editar uma anamnese existente fica fora de escopo por ora).
 */
@Service
@Transactional
public class AnamneseService {

    private final AnamneseRepository anamneseRepository;
    private final AnamneseMapper anamneseMapper;

    public AnamneseService(AnamneseRepository anamneseRepository, AnamneseMapper anamneseMapper) {
        this.anamneseRepository = anamneseRepository;
        this.anamneseMapper = anamneseMapper;
    }

    public void criarSeAusente(Aluno aluno, AnamneseMusicoterapiaRequestDTO dto) {
        if (dto == null || anamneseRepository.existsByAlunoId(aluno.getId())) {
            return;
        }
        Anamnese anamnese = anamneseMapper.toEntity(dto);
        anamnese.setAluno(aluno);
        anamneseRepository.save(anamnese);
    }

    @Transactional(readOnly = true)
    public AnamneseMusicoterapiaResponseDTO buscarPorAluno(Long alunoId) {
        Anamnese anamnese = anamneseRepository.findByAlunoId(alunoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno ainda não tem anamnese registrada"));
        return anamneseMapper.toResponseDTO(anamnese);
    }
}

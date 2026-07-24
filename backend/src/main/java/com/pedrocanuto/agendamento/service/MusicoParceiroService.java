package com.pedrocanuto.agendamento.service;

import com.pedrocanuto.agendamento.domain.MusicoParceiro;
import com.pedrocanuto.agendamento.dto.request.MusicoParceiroRequestDTO;
import com.pedrocanuto.agendamento.dto.response.MusicoParceiroResponseDTO;
import com.pedrocanuto.agendamento.exception.RegraDeNegocioException;
import com.pedrocanuto.agendamento.mapper.MusicoParceiroMapper;
import com.pedrocanuto.agendamento.repository.MusicoParceiroRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MusicoParceiroService {

    private final MusicoParceiroRepository musicoParceiroRepository;
    private final MusicoParceiroMapper musicoParceiroMapper;

    public MusicoParceiroService(MusicoParceiroRepository musicoParceiroRepository, MusicoParceiroMapper musicoParceiroMapper) {
        this.musicoParceiroRepository = musicoParceiroRepository;
        this.musicoParceiroMapper = musicoParceiroMapper;
    }

    public MusicoParceiroResponseDTO criar(MusicoParceiroRequestDTO dto) {
        if (musicoParceiroRepository.existsByCpf(dto.cpf())) {
            throw new RegraDeNegocioException("Já existe um músico parceiro cadastrado com esse CPF");
        }
        MusicoParceiro musico = musicoParceiroMapper.toEntity(dto);
        return musicoParceiroMapper.toResponseDTO(musicoParceiroRepository.save(musico));
    }

    @Transactional(readOnly = true)
    public List<MusicoParceiroResponseDTO> listarTodos() {
        return musicoParceiroRepository.findAll().stream().map(musicoParceiroMapper::toResponseDTO).toList();
    }
}

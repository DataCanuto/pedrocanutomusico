package com.pedrocanuto.agendamento.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Confirma que o seed de V2 (prices.txt) bate exatamente com os valores reais informados pelo
 * dono do produto - não a fórmula de desconto antiga. Roda contra o schema real via Flyway+H2.
 */
@SpringBootTest
class PrecoServicoRepositoryIntegrationTest {

    @Autowired
    private PrecoServicoRepository precoServicoRepository;

    @Test
    void musicalizacaoIndividualNaoSeguemFormulaDeDesconto() {
        assertValor(ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO, "150.00");
        assertValor(ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_4, "560.00");
    }

    /** Regra simplificada depois do lançamento: categorias de aula só oferecem avulso/pacote_4/pacote_12 - pacote_2/pacote_3 saíram do catálogo. */
    @Test
    void musicalizacaoNaoTemMaisPacote2NemPacote3() {
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_2))
                .isEmpty();
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_3))
                .isEmpty();
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.GRUPO, ETipoContratacao.PACOTE_2))
                .isEmpty();
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.GRUPO, ETipoContratacao.PACOTE_3))
                .isEmpty();
    }

    @Test
    void musicoterapiaTemPacote12QueMusicalizacaoNaoTem() {
        assertValor(ECategoriaServico.MUSICOTERAPIA, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_12, "1700.00");
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_12))
                .isEmpty();
    }

    @Test
    void instrumentoNaoTemPacote2NemPacote3() {
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.AULA_INSTRUMENTO, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_2))
                .isEmpty();
        assertThat(precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.AULA_INSTRUMENTO, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_3))
                .isEmpty();
        assertValor(ECategoriaServico.AULA_INSTRUMENTO, EModalidadeServico.INDIVIDUAL, ETipoContratacao.PACOTE_4, "500.00");
    }

    @Test
    void duracaoPadraoNaoVariaPorIdadeEhFixaPorCategoriaEModalidade() {
        var individual = precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.INDIVIDUAL, ETipoContratacao.AVULSO).orElseThrow();
        var grupo = precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(
                ECategoriaServico.MUSICALIZACAO_INFANTIL, EModalidadeServico.GRUPO, ETipoContratacao.AVULSO).orElseThrow();

        assertThat(individual.getDuracaoPadraoMinutos()).isEqualTo(30);
        assertThat(grupo.getDuracaoPadraoMinutos()).isEqualTo(45);
    }

    private void assertValor(ECategoriaServico categoria, EModalidadeServico modalidade, ETipoContratacao tipoContratacao, String valorEsperado) {
        var preco = precoServicoRepository.findByCategoriaAndModalidadeAndTipoContratacao(categoria, modalidade, tipoContratacao)
                .orElseThrow(() -> new AssertionError("Preço não encontrado para " + categoria + "/" + modalidade + "/" + tipoContratacao));
        assertThat(preco.getValor()).isEqualByComparingTo(valorEsperado);
    }
}

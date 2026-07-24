import { useFormContext } from "react-hook-form";
import type { ETipoContratacao, PrecoServico } from "../../types/domain";
import {
    CATEGORIA_LABELS,
    CONTRATACAO_LABELS,
    INSTRUMENTO_LABELS,
    MODALIDADE_LABELS,
    TIPO_EVENTO_LABELS,
    formatarMoeda,
} from "../../types/labels";
import { categoriaEhDeAula, ehGrupoDeAula, type AgendamentoFormValues } from "./formTypes";
import { TurmaCampos } from "./TurmaCampos";

const TODAS_CATEGORIAS = Object.keys(CATEGORIA_LABELS) as (keyof typeof CATEGORIA_LABELS)[];
const TODAS_MODALIDADES = Object.keys(MODALIDADE_LABELS) as (keyof typeof MODALIDADE_LABELS)[];
const TODOS_INSTRUMENTOS = Object.keys(INSTRUMENTO_LABELS) as (keyof typeof INSTRUMENTO_LABELS)[];
const TODOS_TIPOS_EVENTO = Object.keys(TIPO_EVENTO_LABELS) as (keyof typeof TIPO_EVENTO_LABELS)[];

export function ServicoFields({ precos }: { precos: PrecoServico[] }) {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<AgendamentoFormValues>();

    const categoria = watch("categoria");
    const modalidade = watch("modalidade");
    const tipoContratacao = watch("tipoContratacao");
    const eventoPrecoServicoId = watch("eventoPrecoServicoId");
    const ehAula = categoriaEhDeAula(categoria);
    const ehGrupo = ehGrupoDeAula(categoria, modalidade);

    // Nem toda categoria oferece todos os pacotes (Instrumento não tem PACOTE_2/PACOTE_3, por
    // exemplo) - as opções vêm sempre do catálogo real, nunca de uma lista fixa no frontend.
    const pacotesDisponiveis = ehAula && modalidade
        ? precos.filter((p) => p.categoria === categoria && p.modalidade === modalidade)
        : [];

    const precoSelecionado = pacotesDisponiveis.find((p) => p.tipoContratacao === tipoContratacao);

    const pacotesDeEvento = categoria === "EVENTO" ? precos.filter((p) => p.categoria === "EVENTO") : [];
    const pacoteSelecionado = pacotesDeEvento.find((p) => p.id === eventoPrecoServicoId);
    const precisaDuracaoManual = pacoteSelecionado != null && pacoteSelecionado.duracaoPadraoMinutos == null;

    return (
        <fieldset className="form-section">
            <legend>Serviço</legend>

            <label htmlFor="categoria">Serviço desejado</label>
            <select id="categoria" {...register("categoria", { required: "Selecione um serviço" })}>
                <option value="">Selecione...</option>
                {TODAS_CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                        {CATEGORIA_LABELS[c]}
                    </option>
                ))}
            </select>
            {errors.categoria && <span className="erro-campo">{errors.categoria.message}</span>}

            {ehAula && (
                <>
                    <label htmlFor="modalidade">Modalidade</label>
                    <select id="modalidade" {...register("modalidade", { required: "Selecione a modalidade" })}>
                        <option value="">Selecione...</option>
                        {TODAS_MODALIDADES.map((m) => (
                            <option key={m} value={m}>
                                {MODALIDADE_LABELS[m]}
                            </option>
                        ))}
                    </select>
                    {errors.modalidade && <span className="erro-campo">{errors.modalidade.message}</span>}

                    {categoria === "AULA_INSTRUMENTO" && (
                        <>
                            <label htmlFor="instrumento">Instrumento</label>
                            <select id="instrumento" {...register("instrumento", { required: "Selecione o instrumento" })}>
                                <option value="">Selecione...</option>
                                {TODOS_INSTRUMENTOS.map((i) => (
                                    <option key={i} value={i}>
                                        {INSTRUMENTO_LABELS[i]}
                                    </option>
                                ))}
                            </select>
                            {errors.instrumento && <span className="erro-campo">{errors.instrumento.message}</span>}
                        </>
                    )}

                    {modalidade && (
                        <>
                            <label htmlFor="tipoContratacao">Pacote</label>
                            <select id="tipoContratacao" {...register("tipoContratacao", { required: "Selecione uma opção de pacote" })}>
                                <option value="">Selecione...</option>
                                {pacotesDisponiveis.map((p) => (
                                    <option key={p.tipoContratacao} value={p.tipoContratacao ?? undefined}>
                                        {CONTRATACAO_LABELS[p.tipoContratacao as ETipoContratacao]}
                                        {p.valor != null ? ` - ${formatarMoeda(p.valor)}` : ""}
                                    </option>
                                ))}
                            </select>
                            {errors.tipoContratacao && <span className="erro-campo">{errors.tipoContratacao.message}</span>}

                            {pacotesDisponiveis.length === 0 && (
                                <p className="aviso">
                                    Ainda não temos preço cadastrado para essa combinação - fale com a gente pelo WhatsApp para confirmar
                                    disponibilidade.
                                </p>
                            )}
                            {precoSelecionado?.valor != null && (
                                <p className="valor-estimado">Valor do pacote: {formatarMoeda(precoSelecionado.valor)}</p>
                            )}

                            {ehGrupo && <TurmaCampos />}
                        </>
                    )}
                </>
            )}

            {categoria === "EVENTO" && (
                <>
                    <label htmlFor="tipoEvento">Tipo de evento</label>
                    <select id="tipoEvento" {...register("tipoEvento", { required: "Selecione o tipo de evento" })}>
                        <option value="">Selecione...</option>
                        {TODOS_TIPOS_EVENTO.map((t) => (
                            <option key={t} value={t}>
                                {TIPO_EVENTO_LABELS[t]}
                            </option>
                        ))}
                    </select>
                    {errors.tipoEvento && <span className="erro-campo">{errors.tipoEvento.message}</span>}

                    {pacotesDeEvento.length === 0 ? (
                        <p className="aviso">
                            Ainda não temos pacotes de evento cadastrados - fale com a gente pelo WhatsApp para montar uma proposta.
                        </p>
                    ) : (
                        <>
                            <label htmlFor="eventoPrecoServicoId">Pacote</label>
                            <select
                                id="eventoPrecoServicoId"
                                {...register("eventoPrecoServicoId", { required: "Selecione um pacote", valueAsNumber: true })}
                            >
                                <option value="">Selecione...</option>
                                {pacotesDeEvento.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} {p.valor != null ? `- ${formatarMoeda(p.valor)}` : "- Sob consulta"}
                                    </option>
                                ))}
                            </select>
                            {errors.eventoPrecoServicoId && <span className="erro-campo">{errors.eventoPrecoServicoId.message}</span>}

                            {pacoteSelecionado && (
                                <div className="detalhe-pacote">
                                    {pacoteSelecionado.publicoAlvo && <p>Público-alvo: {pacoteSelecionado.publicoAlvo}</p>}
                                    {pacoteSelecionado.descricao && <p>{pacoteSelecionado.descricao}</p>}
                                    {pacoteSelecionado.equipe && <p>Equipe: {pacoteSelecionado.equipe}</p>}
                                    {pacoteSelecionado.duracaoPadraoMinutos && <p>Duração: {pacoteSelecionado.duracaoPadraoMinutos} minutos</p>}
                                </div>
                            )}
                        </>
                    )}

                    <p className="aviso">O evento acontecerá no endereço informado em "Seus dados", logo abaixo.</p>

                    {precisaDuracaoManual && (
                        <>
                            <label htmlFor="duracaoMinutosEvento">Duração estimada (minutos)</label>
                            <input
                                id="duracaoMinutosEvento"
                                type="number"
                                min={1}
                                {...register("duracaoMinutosEvento", { required: "Informe a duração estimada", min: 1 })}
                            />
                            {errors.duracaoMinutosEvento && <span className="erro-campo">{errors.duracaoMinutosEvento.message}</span>}
                        </>
                    )}

                    <label htmlFor="musicasObrigatorias">Músicas que não podem faltar (opcional, uma por linha)</label>
                    <textarea id="musicasObrigatorias" rows={3} {...register("musicasObrigatorias")} />

                    {pacoteSelecionado && pacoteSelecionado.valor == null && (
                        <p className="aviso">Esse pacote é sob consulta - entraremos em contato pelo WhatsApp com o orçamento.</p>
                    )}
                </>
            )}
        </fieldset>
    );
}

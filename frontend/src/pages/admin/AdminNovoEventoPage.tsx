import { useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { criarPreco } from "../../services/precoService";
import { TIPO_EVENTO_LABELS } from "../../types/labels";
import type { ETipoEvento } from "../../types/domain";

const TODOS_TIPOS_EVENTO = Object.keys(TIPO_EVENTO_LABELS) as ETipoEvento[];

export function AdminNovoEventoPage() {
    return <AdminGate titulo="Cadastrar novo evento">{(adminKey) => <NovoPacoteDeEvento adminKey={adminKey} />}</AdminGate>;
}

/** Só EVENTO aceita cadastro livre - preços de aula são regra de negócio fixa (ver AdminPrecosPage). */
function NovoPacoteDeEvento({ adminKey }: { adminKey: string }) {
    const [tipoEvento, setTipoEvento] = useState<ETipoEvento | "">("");
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [publicoAlvo, setPublicoAlvo] = useState("");
    const [equipe, setEquipe] = useState("");
    const [materiais, setMateriais] = useState("");
    const [valor, setValor] = useState("");
    const [duracao, setDuracao] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    async function criar() {
        if (!nome) {
            setErro("Preencha o nome do pacote antes de cadastrar.");
            return;
        }
        setSalvando(true);
        setErro(null);
        setSucesso(false);
        try {
            await criarPreco(
                {
                    categoria: "EVENTO",
                    modalidade: null,
                    tipoContratacao: null,
                    tipoEvento: tipoEvento || null,
                    nome,
                    descricao: descricao || null,
                    publicoAlvo: publicoAlvo || null,
                    equipe: equipe || null,
                    materiais: materiais || null,
                    valor: valor === "" ? null : Number(valor),
                    duracaoPadraoMinutos: duracao === "" ? null : Number(duracao),
                },
                adminKey,
            );
            setTipoEvento("");
            setNome("");
            setDescricao("");
            setPublicoAlvo("");
            setEquipe("");
            setMateriais("");
            setValor("");
            setDuracao("");
            setSucesso(true);
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não foi possível cadastrar o pacote.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            {sucesso && <p className="valor-estimado">Pacote de evento cadastrado com sucesso.</p>}
            {erro && <p className="erro-campo">{erro}</p>}

            <fieldset className="form-section">
                <legend>Novo pacote de evento</legend>

                <label htmlFor="novoTipoEvento">Tipo de evento (opcional)</label>
                <select id="novoTipoEvento" value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value as ETipoEvento)}>
                    <option value="">Qualquer um</option>
                    {TODOS_TIPOS_EVENTO.map((t) => (
                        <option key={t} value={t}>
                            {TIPO_EVENTO_LABELS[t]}
                        </option>
                    ))}
                </select>

                <label htmlFor="novoNome">Nome do pacote</label>
                <input id="novoNome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Festa Temática" />

                <label htmlFor="novaDescricao">Descrição (opcional)</label>
                <textarea id="novaDescricao" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />

                <label htmlFor="novoPublicoAlvo">Público-alvo (opcional)</label>
                <input
                    id="novoPublicoAlvo"
                    value={publicoAlvo}
                    onChange={(e) => setPublicoAlvo(e.target.value)}
                    placeholder="Ex.: 1 a 4 anos"
                />

                <label htmlFor="novaEquipe">Equipe (opcional)</label>
                <input id="novaEquipe" value={equipe} onChange={(e) => setEquipe(e.target.value)} placeholder="Ex.: Pedro + músico" />

                <label htmlFor="novosMateriais">Materiais (opcional)</label>
                <input
                    id="novosMateriais"
                    value={materiais}
                    onChange={(e) => setMateriais(e.target.value)}
                    placeholder="Ex.: tapete, instrumentos"
                />

                <label htmlFor="novoValor">Valor em R$ (deixe em branco para "sob consulta")</label>
                <input id="novoValor" type="number" step="0.01" min="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />

                <label htmlFor="novaDuracao">Duração padrão em minutos (opcional)</label>
                <input id="novaDuracao" type="number" min="1" value={duracao} onChange={(e) => setDuracao(e.target.value)} />

                <button onClick={criar} disabled={salvando}>
                    {salvando ? "Cadastrando..." : "Cadastrar pacote"}
                </button>
            </fieldset>
        </>
    );
}

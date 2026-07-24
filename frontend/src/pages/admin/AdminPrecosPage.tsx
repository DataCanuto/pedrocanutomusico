import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { extrairMensagemErro } from "../../services/api";
import { atualizarPreco, listarPrecos } from "../../services/precoService";
import { CATEGORIA_LABELS, CONTRATACAO_LABELS, MODALIDADE_LABELS } from "../../types/labels";
import type { PrecoServico } from "../../types/domain";

export function AdminPrecosPage() {
    return <AdminGate titulo="Tabela de preços">{(adminKey) => <TabelaDePrecos adminKey={adminKey} />}</AdminGate>;
}

function TabelaDePrecos({ adminKey }: { adminKey: string }) {
    const queryClient = useQueryClient();
    const precosQuery = useQuery({ queryKey: ["precos"], queryFn: listarPrecos });
    const [erro, setErro] = useState<string | null>(null);

    async function salvarValor(preco: PrecoServico, novoValor: number | null, novaDuracao: number | null) {
        setErro(null);
        try {
            await atualizarPreco(
                preco.id,
                {
                    categoria: preco.categoria,
                    modalidade: preco.modalidade,
                    tipoContratacao: preco.tipoContratacao,
                    tipoEvento: preco.tipoEvento,
                    nome: preco.nome,
                    descricao: preco.descricao,
                    publicoAlvo: preco.publicoAlvo,
                    equipe: preco.equipe,
                    materiais: preco.materiais,
                    valor: novoValor,
                    duracaoPadraoMinutos: novaDuracao,
                },
                adminKey,
            );
            await queryClient.invalidateQueries({ queryKey: ["precos"] });
        } catch (e) {
            setErro(extrairMensagemErro(e, "Não foi possível salvar o preço."));
        }
    }

    return (
        <>
            {erro && <p className="erro-campo">{erro}</p>}

            {precosQuery.isLoading && <p>Carregando...</p>}

            {precosQuery.data && (
                <table className="tabela-precos">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Modalidade / Pacote</th>
                            <th>Valor (R$)</th>
                            <th>Duração (min)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {precosQuery.data.map((preco) => (
                            <LinhaPreco key={preco.id} preco={preco} onSalvar={salvarValor} />
                        ))}
                    </tbody>
                </table>
            )}

            <p className="aviso">
                Preços de aula (Musicalização, Musicoterapia, Instrumento) são definidos como regra de negócio no backend - só é
                possível ajustar o valor/duração de uma combinação já existente aqui. Para cadastrar um novo pacote de evento, use
                "Cadastrar novo evento" na área do professor.
            </p>
        </>
    );
}

function LinhaPreco({
    preco,
    onSalvar,
}: {
    preco: PrecoServico;
    onSalvar: (preco: PrecoServico, valor: number | null, duracao: number | null) => Promise<void>;
}) {
    const [valor, setValor] = useState(preco.valor !== null ? String(preco.valor) : "");
    const [duracao, setDuracao] = useState(preco.duracaoPadraoMinutos !== null ? String(preco.duracaoPadraoMinutos) : "");
    const [salvando, setSalvando] = useState(false);

    async function salvar() {
        setSalvando(true);
        try {
            await onSalvar(preco, valor === "" ? null : Number(valor), duracao === "" ? null : Number(duracao));
        } finally {
            setSalvando(false);
        }
    }

    const pacote = preco.modalidade
        ? `${MODALIDADE_LABELS[preco.modalidade]} - ${preco.tipoContratacao ? CONTRATACAO_LABELS[preco.tipoContratacao] : ""}`
        : preco.nome;

    return (
        <tr>
            <td>{CATEGORIA_LABELS[preco.categoria]}</td>
            <td>{pacote}</td>
            <td>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="sob consulta"
                />
            </td>
            <td>
                <input type="number" min="1" value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="livre" />
            </td>
            <td>
                <button onClick={salvar} disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar"}
                </button>
            </td>
        </tr>
    );
}

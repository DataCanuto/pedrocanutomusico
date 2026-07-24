import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { extrairMensagemErro } from "../../services/api";
import { criarMusicoParceiro, listarMusicosParceiros } from "../../services/musicoParceiroService";
import { INSTRUMENTO_LABELS } from "../../types/labels";
import type { EInstrumento } from "../../types/domain";

const TODOS_INSTRUMENTOS = Object.keys(INSTRUMENTO_LABELS) as EInstrumento[];

export function AdminMusicosPage() {
    return <AdminGate titulo="Músicos parceiros">{(adminKey) => <Musicos adminKey={adminKey} />}</AdminGate>;
}

function Musicos({ adminKey }: { adminKey: string }) {
    const queryClient = useQueryClient();
    const musicosQuery = useQuery({ queryKey: ["admin-musicos"], queryFn: () => listarMusicosParceiros(adminKey) });

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [instrumento, setInstrumento] = useState<EInstrumento | "">("");

    const mutation = useMutation({
        mutationFn: () =>
            criarMusicoParceiro({ nome, cpf, telefone, instrumento: instrumento as EInstrumento }, adminKey),
        onSuccess: async () => {
            setNome("");
            setCpf("");
            setTelefone("");
            setInstrumento("");
            await queryClient.invalidateQueries({ queryKey: ["admin-musicos"] });
        },
    });

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate();
                }}
            >
                <fieldset className="form-section">
                    <legend>Cadastrar músico parceiro</legend>

                    <label htmlFor="nome">Nome completo</label>
                    <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

                    <label htmlFor="cpf">CPF (só números)</label>
                    <input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} maxLength={11} placeholder="00000000000" required />

                    <label htmlFor="telefone">Telefone</label>
                    <input
                        id="telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(71) 99999-9999"
                        required
                    />

                    <label htmlFor="instrumento">Instrumento</label>
                    <select id="instrumento" value={instrumento} onChange={(e) => setInstrumento(e.target.value as EInstrumento)} required>
                        <option value="">Selecione...</option>
                        {TODOS_INSTRUMENTOS.map((i) => (
                            <option key={i} value={i}>
                                {INSTRUMENTO_LABELS[i]}
                            </option>
                        ))}
                    </select>

                    {mutation.isError && (
                        <p className="erro-campo">{extrairMensagemErro(mutation.error, "Não foi possível cadastrar o músico.")}</p>
                    )}

                    <button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Cadastrando..." : "Cadastrar músico"}
                    </button>
                </fieldset>
            </form>

            {musicosQuery.data && musicosQuery.data.length > 0 && (
                <table className="tabela-precos">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Instrumento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {musicosQuery.data.map((musico) => (
                            <tr key={musico.id}>
                                <td>{musico.nome}</td>
                                <td>{musico.telefone}</td>
                                <td>{INSTRUMENTO_LABELS[musico.instrumento]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AdminGate } from "../../components/admin/AdminGate";
import { extrairMensagemErro } from "../../services/api";
import { criarTurma } from "../../services/turmaService";
import { gerarSlotsDeHorario } from "../../utils/horarios";
import { CATEGORIA_LABELS, DIA_SEMANA_LABELS, INSTRUMENTO_LABELS } from "../../types/labels";
import type { ECategoriaServico, EDiaSemana, EInstrumento } from "../../types/domain";

const CATEGORIAS_DE_AULA = Object.keys(CATEGORIA_LABELS).filter((c) => c !== "EVENTO") as ECategoriaServico[];
const TODOS_INSTRUMENTOS = Object.keys(INSTRUMENTO_LABELS) as EInstrumento[];
const DIAS_SEMANA = Object.keys(DIA_SEMANA_LABELS) as EDiaSemana[];
const SLOTS = gerarSlotsDeHorario();

export function AdminTurmasPage() {
    return <AdminGate titulo="Cadastrar turma">{(adminKey) => <CadastroDeTurma adminKey={adminKey} />}</AdminGate>;
}

function CadastroDeTurma({ adminKey }: { adminKey: string }) {
    const [categoria, setCategoria] = useState<ECategoriaServico | "">("");
    const [instrumento, setInstrumento] = useState<EInstrumento | "">("");
    const [diaSemana, setDiaSemana] = useState<EDiaSemana | "">("");
    const [hora, setHora] = useState("");
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [complemento, setComplemento] = useState("");
    const ehInstrumento = categoria === "AULA_INSTRUMENTO";

    const mutation = useMutation({
        mutationFn: () =>
            criarTurma(
                {
                    categoria: categoria as ECategoriaServico,
                    instrumento: ehInstrumento ? (instrumento as EInstrumento) : null,
                    diaSemana: diaSemana as EDiaSemana,
                    hora,
                    endereco: { cep, rua, numero, bairro, cidade, estado, complemento: complemento || undefined },
                },
                adminKey,
            ),
    });

    return (
        <>
            {mutation.isSuccess ? (
                <div className="detalhe-pacote">
                    <p>Turma criada! Compartilhe o código abaixo com as famílias interessadas:</p>
                    <p className="valor-estimado">{mutation.data.codigo}</p>
                    <button onClick={() => mutation.reset()}>Cadastrar outra turma</button>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate();
                    }}
                >
                    <fieldset className="form-section">
                        <legend>Dados da turma</legend>

                        <label htmlFor="categoria">Serviço</label>
                        <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as ECategoriaServico)} required>
                            <option value="">Selecione...</option>
                            {CATEGORIAS_DE_AULA.map((c) => (
                                <option key={c} value={c}>
                                    {CATEGORIA_LABELS[c]}
                                </option>
                            ))}
                        </select>

                        {ehInstrumento && (
                            <>
                                <label htmlFor="instrumento">Instrumento</label>
                                <select
                                    id="instrumento"
                                    value={instrumento}
                                    onChange={(e) => setInstrumento(e.target.value as EInstrumento)}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {TODOS_INSTRUMENTOS.map((i) => (
                                        <option key={i} value={i}>
                                            {INSTRUMENTO_LABELS[i]}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <label htmlFor="diaSemana">Dia da semana</label>
                        <select id="diaSemana" value={diaSemana} onChange={(e) => setDiaSemana(e.target.value as EDiaSemana)} required>
                            <option value="">Selecione...</option>
                            {DIAS_SEMANA.map((dia) => (
                                <option key={dia} value={dia}>
                                    {DIA_SEMANA_LABELS[dia]}
                                </option>
                            ))}
                        </select>
                        <p className="aviso">
                            A turma acontece toda semana neste dia e horário. Cada família que se matricular recebe automaticamente
                            todas as aulas do pacote escolhido, geradas dentro de 31 dias corridos a partir da inscrição.
                        </p>

                        <label htmlFor="hora">Horário</label>
                        <select id="hora" value={hora} onChange={(e) => setHora(e.target.value)} required>
                            <option value="">Selecione...</option>
                            {SLOTS.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>

                    </fieldset>

                    <fieldset className="form-section">
                        <legend>Endereço da turma</legend>

                        <label htmlFor="cep">CEP</label>
                        <input id="cep" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} required />

                        <label htmlFor="rua">Rua</label>
                        <input id="rua" value={rua} onChange={(e) => setRua(e.target.value)} required />

                        <label htmlFor="numero">Número</label>
                        <input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required />

                        <label htmlFor="bairro">Bairro</label>
                        <input id="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} required />

                        <label htmlFor="cidade">Cidade</label>
                        <input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />

                        <label htmlFor="estado">Estado (UF)</label>
                        <input id="estado" maxLength={2} placeholder="BA" value={estado} onChange={(e) => setEstado(e.target.value)} required />

                        <label htmlFor="complemento">Complemento (opcional)</label>
                        <input
                            id="complemento"
                            placeholder="Sala, ponto de referência..."
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />
                    </fieldset>

                    {mutation.isError && (
                        <p className="erro-campo">{extrairMensagemErro(mutation.error, "Não foi possível criar a turma.")}</p>
                    )}

                    <button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Criando..." : "Criar turma"}
                    </button>
                </form>
            )}
        </>
    );
}

import { useQuery } from "@tanstack/react-query";
import { AdminGate } from "../../components/admin/AdminGate";
import { AccordionItem } from "../../components/ui/Accordion";
import { extrairMensagemErro } from "../../services/api";
import { listarPacientesMusicoterapia } from "../../services/anamneseAdminService";
import { formatarDataBr } from "../../utils/calendario";
import type {
    AnamneseInfantilResponse,
    HistoricoClinicoResponse,
    HistoricoMusicalResponse,
    PacienteMusicoterapia,
    PerfilDesenvolvimentoResponse,
    ResponsavelAnamneseResponse,
} from "../../types/domain";

export function AdminVerAnamnesesPage() {
    return <AdminGate titulo="Anamneses de Musicoterapia">{(adminKey) => <ListaDePacientes adminKey={adminKey} />}</AdminGate>;
}

function ListaDePacientes({ adminKey }: { adminKey: string }) {
    const pacientesQuery = useQuery({ queryKey: ["admin-anamneses"], queryFn: () => listarPacientesMusicoterapia(adminKey) });

    return (
        <>
            {pacientesQuery.isLoading && <p>Carregando...</p>}
            {pacientesQuery.isError && (
                <p className="erro-campo">{extrairMensagemErro(pacientesQuery.error, "Não foi possível carregar os pacientes.")}</p>
            )}
            {pacientesQuery.data && pacientesQuery.data.length === 0 && (
                <p>Nenhum paciente de musicoterapia com anamnese registrada ainda.</p>
            )}

            {pacientesQuery.data && pacientesQuery.data.length > 0 && (
                <div className="accordion-grupo">
                    {pacientesQuery.data.map((paciente) => (
                        <AccordionItem
                            key={paciente.alunoId}
                            className="servico-card"
                            titulo={`${paciente.nomeAluno} (${paciente.idadeAtual} anos)`}
                            subtitulo={`Responsável: ${paciente.nomeResponsavel} - ${paciente.telefoneResponsavel}`}
                        >
                            <DetalheAnamnese paciente={paciente} />
                        </AccordionItem>
                    ))}
                </div>
            )}
        </>
    );
}

/** Só exibe o campo se houver valor - evita poluir a leitura com "Rótulo: -" pra tudo que o professor não preencheu. */
function Campo({ label, valor }: { label: string; valor: string | number | null | undefined }) {
    if (valor === null || valor === undefined || valor === "") return null;
    return (
        <p>
            <strong>{label}:</strong> {valor}
        </p>
    );
}

/** Campo booleano com detalhe opcional (ex.: "Possui diagnóstico: Sim - TEA") - só aparece quando marcado, mesmo padrão do formulário original (AnamneseFields). */
function CampoFlag({ label, marcado, detalhe }: { label: string; marcado: boolean | null | undefined; detalhe?: string | null }) {
    if (!marcado) return null;
    return (
        <p>
            <strong>{label}</strong>
            {detalhe ? `: ${detalhe}` : ""}
        </p>
    );
}

function SemInformacao() {
    return <p className="aviso">Nenhuma informação registrada nesta seção.</p>;
}

function DetalheAnamnese({ paciente }: { paciente: PacienteMusicoterapia }) {
    const anamnese = paciente.anamnese;
    const ehCrianca = anamnese.anamneseInfantil != null && temAlgumValor(anamnese.anamneseInfantil);

    return (
        <>
            <p className="aviso">Anamnese registrada em {formatarDataBr(anamnese.criadaEm.split("T")[0])}.</p>

            <Campo label="Idade (na anamnese)" valor={anamnese.idade} />
            <Campo label="Profissão" valor={anamnese.profissao} />
            <Campo label="Escolaridade" valor={anamnese.escolaridade} />
            <Campo label="Estado civil" valor={anamnese.estadoCivil} />

            <div className="accordion-grupo">
                <AccordionItem titulo="Motivo e objetivos">
                    <Campo label="Motivo do encaminhamento" valor={anamnese.motivoEncaminhamento} />
                    <Campo label="Queixa principal" valor={anamnese.queixaPrincipal} />
                    <Campo label="Objetivos do paciente/família" valor={anamnese.objetivosPaciente} />
                    <Campo label="Objetivos musicoterapêuticos" valor={anamnese.objetivosMusicoterapeuticos} />
                    {!temAlgumValor({
                        a: anamnese.motivoEncaminhamento,
                        b: anamnese.queixaPrincipal,
                        c: anamnese.objetivosPaciente,
                        d: anamnese.objetivosMusicoterapeuticos,
                    }) && <SemInformacao />}
                </AccordionItem>

                <AccordionItem titulo="Histórico clínico">
                    <HistoricoClinico historico={anamnese.historicoClinico} />
                </AccordionItem>

                <AccordionItem titulo="Perfil de desenvolvimento">
                    <PerfilDesenvolvimento perfil={anamnese.perfilDesenvolvimento} />
                </AccordionItem>

                <AccordionItem titulo="Histórico musical">
                    <HistoricoMusical historico={anamnese.historicoMusical} />
                </AccordionItem>

                <AccordionItem titulo="Responsável (informado na anamnese)">
                    <Responsavel responsavel={anamnese.responsavel} />
                </AccordionItem>

                {ehCrianca && (
                    <AccordionItem titulo="Dados da infância" subtitulo="Só preenchido para pacientes crianças">
                        <AnamneseInfantil dados={anamnese.anamneseInfantil} />
                    </AccordionItem>
                )}
            </div>

            <Campo label="Observações gerais" valor={anamnese.observacoesGerais} />
        </>
    );
}

function HistoricoClinico({ historico }: { historico: HistoricoClinicoResponse | null }) {
    if (!historico || !temAlgumValor(historico)) return <SemInformacao />;
    return (
        <>
            <CampoFlag label="Possui diagnóstico" marcado={historico.possuiDiagnostico} detalhe={historico.diagnosticos} />
            <CampoFlag label="Faz uso de medicamentos" marcado={historico.fazUsoMedicamentos} detalhe={historico.medicamentos} />
            <CampoFlag
                label="Possui acompanhamento médico"
                marcado={historico.possuiAcompanhamentoMedico}
                detalhe={historico.especialidadesMedicas}
            />
            <CampoFlag
                label="Possui acompanhamento psicológico"
                marcado={historico.possuiAcompanhamentoPsicologico}
                detalhe={historico.observacoesAcompanhamentoPsicologico}
            />
            <CampoFlag label="Possui alergias" marcado={historico.possuiAlergias} detalhe={historico.alergias} />
        </>
    );
}

function PerfilDesenvolvimento({ perfil }: { perfil: PerfilDesenvolvimentoResponse | null }) {
    if (!perfil || !temAlgumValor(perfil)) return <SemInformacao />;
    return (
        <>
            <Campo label="Desenvolvimento geral" valor={perfil.desenvolvimento} />
            <Campo label="Aspectos emocionais" valor={perfil.aspectosEmocionais} />
            <Campo label="Aspectos cognitivos" valor={perfil.aspectosCognitivos} />
            <Campo label="Aspectos motores" valor={perfil.aspectosMotores} />
            <Campo label="Comunicação" valor={perfil.comunicacao} />
            <Campo label="Socialização" valor={perfil.socializacao} />
            <Campo label="Rotina" valor={perfil.rotina} />
            <Campo label="Sono" valor={perfil.sono} />
            <Campo label="Alimentação" valor={perfil.alimentacao} />
        </>
    );
}

function HistoricoMusical({ historico }: { historico: HistoricoMusicalResponse | null }) {
    if (!historico || !temAlgumValor(historico)) return <SemInformacao />;
    return (
        <>
            <CampoFlag
                label="Já teve experiência musical"
                marcado={historico.possuiExperienciaMusical}
                detalhe={historico.descricaoExperienciaMusical}
            />
            <Campo label="Instrumentos preferidos" valor={historico.instrumentosPreferidos} />
            <Campo label="Estilos musicais preferidos" valor={historico.estilosMusicaisPreferidos} />
            <Campo label="Músicas significativas" valor={historico.musicasSignificativas} />
            <CampoFlag
                label="Possui hipersensibilidade sonora"
                marcado={historico.possuiHipersensibilidadeSonora}
                detalhe={historico.observacoesAuditivas}
            />
        </>
    );
}

function Responsavel({ responsavel }: { responsavel: ResponsavelAnamneseResponse | null }) {
    if (!responsavel || !temAlgumValor(responsavel)) return <SemInformacao />;
    return (
        <>
            <Campo label="Nome" valor={responsavel.nome} />
            <Campo label="Parentesco" valor={responsavel.parentesco} />
            <Campo label="Telefone" valor={responsavel.telefone} />
            <Campo label="E-mail" valor={responsavel.email} />
        </>
    );
}

function AnamneseInfantil({ dados }: { dados: AnamneseInfantilResponse | null }) {
    if (!dados) return <SemInformacao />;
    return (
        <>
            <Campo label="Gestação" valor={dados.gestacao} />
            <Campo label="Parto" valor={dados.parto} />
            <Campo label="Desenvolvimento motor" valor={dados.desenvolvimentoMotor} />
            <Campo label="Desenvolvimento da linguagem" valor={dados.desenvolvimentoLinguagem} />
            <Campo label="Desenvolvimento social" valor={dados.desenvolvimentoSocial} />
            <Campo label="Desenvolvimento escolar" valor={dados.desenvolvimentoEscolar} />
            <Campo label="Comportamento em casa" valor={dados.comportamentoCasa} />
            <Campo label="Comportamento na escola" valor={dados.comportamentoEscola} />
            <Campo label="Seletividade alimentar" valor={dados.seletividadeAlimentar} />
            {dados.desfraldeConcluido != null && <Campo label="Desfralde concluído" valor={dados.desfraldeConcluido ? "Sim" : "Não"} />}
            {dados.usaFraldas != null && <Campo label="Usa fraldas" valor={dados.usaFraldas ? "Sim" : "Não"} />}
            <Campo label="Interesses da criança" valor={dados.interessesCrianca} />
            <Campo label="Brincadeiras favoritas" valor={dados.brincadeirasFavoritas} />
        </>
    );
}

/** true se qualquer propriedade do objeto tiver valor (não null/undefined/""/false) - usado para decidir se uma seção tem algo a mostrar. */
function temAlgumValor(obj: object): boolean {
    return Object.values(obj as Record<string, unknown>).some(
        (valor) => valor !== null && valor !== undefined && valor !== "" && valor !== false,
    );
}

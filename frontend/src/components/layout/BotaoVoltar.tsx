import { useNavigate } from "react-router-dom";

export function BotaoVoltar({ destino }: { destino?: string }) {
    const navigate = useNavigate();

    function voltar() {
        if (destino) {
            navigate(destino);
            return;
        }
        navigate(-1);
    }

    return (
        <button type="button" className="botao-voltar" onClick={voltar}>
            ← Voltar
        </button>
    );
}

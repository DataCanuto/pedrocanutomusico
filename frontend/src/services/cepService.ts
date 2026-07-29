import axios from "axios";

interface ViaCepResposta {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export interface EnderecoPorCep {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
}

/** ViaCEP é um serviço público separado da nossa API - por isso usa axios direto, sem a instância `api` (que aponta para o backend). */
export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoPorCep | null> {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
        return null;
    }

    const { data } = await axios.get<ViaCepResposta>(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (data.erro) {
        return null;
    }

    return {
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
    };
}

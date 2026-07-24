import { useCallback, useState } from "react";

const STORAGE_KEY = "admin-api-key";

/**
 * Guarda a chave de admin (header X-Admin-Key) em sessionStorage - só dura a aba aberta.
 * Substitui login de verdade por enquanto (ver AdminApiKeyFilter no backend).
 */
export function useAdminKey() {
    const [adminKey, setAdminKeyState] = useState<string>(() => sessionStorage.getItem(STORAGE_KEY) ?? "");

    const setAdminKey = useCallback((valor: string) => {
        sessionStorage.setItem(STORAGE_KEY, valor);
        setAdminKeyState(valor);
    }, []);

    return { adminKey, setAdminKey, temChave: adminKey.length > 0 };
}

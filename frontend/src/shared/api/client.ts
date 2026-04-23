const BASE = import.meta.env.VITE_API_URL ?? '';

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(`${BASE}${url}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error((error as { message?: string }).message ?? String(res.status));
    }
    const data = res.status !== 204 ? await res.json() : undefined;
    return { data, status: res.status, headers: res.headers } as T;
};

import { i18nStore, type Locale } from './i18n';

export function useTranslation() {
    const locale = i18nStore.locale;
    const t = (key: string, params?: Record<string, string | number>) => i18nStore.t(key, params);
    const setLocale = (l: Locale) => i18nStore.setLocale(l);
    return { t, locale, setLocale };
}

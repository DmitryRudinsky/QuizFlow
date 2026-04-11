import { makeAutoObservable } from 'mobx';

import en from '../config/locales/en.json';
import ru from '../config/locales/ru.json';

export type Locale = 'en' | 'ru';

const translations = { en, ru } as const;

function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
    return key
        .split('.')
        .reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj) as
        | string
        | undefined;
}

class I18nStore {
    locale: Locale = (localStorage.getItem('locale') as Locale) ?? 'en';

    constructor() {
        makeAutoObservable(this);
    }

    setLocale(locale: Locale) {
        this.locale = locale;
        localStorage.setItem('locale', locale);
    }

    t(key: string, params?: Record<string, string | number>): string {
        let result =
            getNestedValue(translations[this.locale] as Record<string, unknown>, key) ?? key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            });
        }
        return result;
    }
}

export const i18nStore = new I18nStore();

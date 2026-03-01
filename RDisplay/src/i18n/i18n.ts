/**
 * i18n configuration with browser language detection
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import pl from './pl.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            pl: { translation: pl }
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'pl'],
        interpolation: {
            escapeValue: false // React already escapes
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

// Set the HTML lang attribute on init and language change
const updateHtmlLang = (lng: string) => {
    document.documentElement.lang = lng;
};

updateHtmlLang(i18n.language?.substring(0, 2) || 'en');
i18n.on('languageChanged', (lng) => updateHtmlLang(lng));

export default i18n;

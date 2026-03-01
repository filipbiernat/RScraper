/**
 * Language switcher component with PL/EN flag buttons
 */

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Inline SVG flags to avoid external dependencies
const PlFlag: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="16">
        <g fillRule="evenodd">
            <path fill="#fff" d="M0 0h640v240H0z" />
            <path fill="#dc143c" d="M0 240h640v240H0z" />
        </g>
    </svg>
);

const GbFlag: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="24" height="16">
        <path fill="#012169" d="M0 0h640v480H0z" />
        <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z" />
        <path fill="#C8102E" d="m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z" />
        <path fill="#FFF" d="M241 0v480h160V0zM0 160v160h640V160z" />
        <path fill="#C8102E" d="M0 193v96h640v-96zM273 0v480h96V0z" />
    </svg>
);

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.substring(0, 2) || 'en';

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Polski">
                <span>
                    <IconButton
                        size="small"
                        onClick={() => changeLanguage('pl')}
                        disabled={currentLang === 'pl'}
                        sx={{
                            opacity: currentLang === 'pl' ? 1 : 0.5,
                            border: currentLang === 'pl' ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                            borderRadius: '4px',
                            padding: '4px',
                            transition: 'all 0.2s',
                            '&:hover': {
                                opacity: 1
                            },
                            '&.Mui-disabled': {
                                opacity: 1,
                                cursor: 'default'
                            }
                        }}
                    >
                        <PlFlag />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="English">
                <span>
                    <IconButton
                        size="small"
                        onClick={() => changeLanguage('en')}
                        disabled={currentLang === 'en'}
                        sx={{
                            opacity: currentLang === 'en' ? 1 : 0.5,
                            border: currentLang === 'en' ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                            borderRadius: '4px',
                            padding: '4px',
                            transition: 'all 0.2s',
                            '&:hover': {
                                opacity: 1
                            },
                            '&.Mui-disabled': {
                                opacity: 1,
                                cursor: 'default'
                            }
                        }}
                    >
                        <GbFlag />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

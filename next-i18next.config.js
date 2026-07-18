const { AVAILABLE_LANGUAGES } = require('./src/config/constants');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
    i18n: {
    defaultLocale: 'en',
    
    locales: AVAILABLE_LANGUAGES,
    },
    
}
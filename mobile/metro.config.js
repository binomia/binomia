// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
/** @type {import('expo/metro-config').MetroConfig} */


const config = getSentryExpoConfig(__dirname);
config.resolver.sourceExts.push('sql');
module.exports = config;
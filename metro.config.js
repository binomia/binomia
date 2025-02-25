import { getDefaultConfig } from 'expo/metro-config';
/** @type {import('expo/metro-config').MetroConfig} */


const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');
export default config;
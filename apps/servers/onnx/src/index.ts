// @ts-nocheck
import path from 'path';
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { Server, Extensions } from "cromio"

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const addon = require(path.join(__dirname, "../build/Release/iforest.node"));


const result = addon.predictTransaction([10, 2, 5, 6, 4]);
console.log({ result });

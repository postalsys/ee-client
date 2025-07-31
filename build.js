import { readFileSync, writeFileSync } from 'fs';

const esmContent = readFileSync('index.js', 'utf8');

const cjsContent = esmContent
    .replace(/export class/g, 'class')
    .replace(/export function/g, 'function')
    .replace(/export default EmailEngineClient;/g, '')
    + `
module.exports = {
    EmailEngineClient,
    createEmailEngineClient,
    default: EmailEngineClient
};
`;

writeFileSync('index.cjs', cjsContent);
console.log('Built CommonJS version: index.cjs');
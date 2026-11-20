// Starts what every e2e test shares: EmailEngine with its Redis, and the static server for the
// harness page. Their addresses reach the test workers through the environment. The returned
// function is Playwright's teardown.

import { containerLogs, startStack, stopStack } from './stack.js';
import { serve } from './serve.js';

export const HARNESS_PORT = Number(process.env.EE_E2E_HARNESS_PORT) || 7198;

export default async function globalSetup() {
    const baseUrl = `http://127.0.0.1:${HARNESS_PORT}`;
    const server = await serve(HARNESS_PORT);
    let stack;
    try {
        stack = await startStack({ corsOrigin: baseUrl });
    } catch (error) {
        server.close();
        throw error;
    }

    process.env.EE_E2E_API_URL = stack.apiUrl;
    process.env.EE_E2E_TOKEN = stack.token;
    process.env.EE_E2E_CONTAINER = stack.containers[0];

    return async () => {
        if (process.env.EE_E2E_LOGS) {
            console.log(await containerLogs(stack.containers[0]));
        }
        server.close();
        await stopStack(stack);
    };
}

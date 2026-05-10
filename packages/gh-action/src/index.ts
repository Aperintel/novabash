import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as core from '@actions/core';

/**
 * Entry point for the NovaBash GitHub Action.
 *
 * Reads the workspace key from the action's `with.workspace-key` input,
 * calls the NovaBash API to fetch the env body for the requested variant,
 * writes it to the chosen output file inside the runner's workspace.
 *
 * The workspace key is masked in the action log via core.setSecret. The
 * env file body is never logged. On any failure the action fails the job
 * with a clean message rather than leaking the raw response body.
 */

async function run(): Promise<void> {
  try {
    const workspaceKey = core.getInput('workspace-key', { required: true });
    const env = (core.getInput('env') || 'production').toLowerCase();
    const output = core.getInput('output') || '.env';
    const apiUrl = (core.getInput('api-url') || 'https://api.novabash.dev').replace(/\/+$/, '');

    if (!['development', 'staging', 'production'].includes(env)) {
      core.setFailed(`Invalid env "${env}". Use development, staging, or production.`);
      return;
    }

    core.setSecret(workspaceKey);

    const url = `${apiUrl}/v1/cli/env?variant=${encodeURIComponent(env)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${workspaceKey}` },
    });

    if (!res.ok) {
      const status = res.status;
      let message = `NovaBash API returned ${status}`;
      try {
        const body = (await res.json()) as { message?: string; error?: string };
        if (body.message) message = `${message}: ${body.message}`;
        else if (body.error) message = `${message}: ${body.error}`;
      } catch {
        // body was not json; ignore
      }
      core.setFailed(message);
      return;
    }

    const body = await res.text();
    const target = path.resolve(process.env.GITHUB_WORKSPACE ?? process.cwd(), output);
    await fs.writeFile(target, body, 'utf8');

    core.setOutput('bytes-written', String(Buffer.byteLength(body, 'utf8')));
    core.setOutput('variant', env);
    core.info(`Wrote ${output} (${env}) from NovaBash workspace.`);
  } catch (err) {
    core.setFailed(err instanceof Error ? err.message : String(err));
  }
}

void run();

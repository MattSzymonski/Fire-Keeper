import Fastify from 'fastify';
import cors from '@fastify/cors';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs/promises';
import path from 'path';

const fastify = Fastify();

fastify.register(cors, { origin: '*' });

const execAsync = promisify(exec);

fastify.get('/docker-containers-status', async (_req, reply) => {
  try {
    // Get container name, status, and ID
    const { stdout } = await execAsync(`docker ps --format '{{.Names}},{{.Status}},{{.ID}}'`);

    const containers = stdout
      .trim()
      .split('\n')
      .map(line => {
        const [name, status, id] = line.split(',');
        return { name, status, id };
      });

    reply.send({ containers });
  } catch (err: unknown) {
    if (err instanceof Error) {
      const e = err as Error & { stderr?: string };
      reply.code(500).send({ error: e.stderr || e.message });
    } else {
      reply.code(500).send({ error: 'Unknown error occurred' });
    }
  }
});

fastify.get('/system-status', async (_req, reply) => {
  try {
    // Read uptime from host's /proc/uptime
    const uptimeRaw = await fs.readFile('/host/proc/uptime', 'utf8');
    const [uptimeSeconds] = uptimeRaw.trim().split(' ').map(parseFloat);

    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    const uptime = `${days}d ${hours}h ${minutes}m`;

    // RAM: /proc/meminfo
    const meminfo = await fs.readFile('/host/proc/meminfo', 'utf8');
    const memTotal = parseInt(/MemTotal:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const memFree = parseInt(/MemFree:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const buffers = parseInt(/Buffers:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const cached = parseInt(/Cached:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const used = memTotal - memFree - buffers - cached;

    const toGB = (kb: number) => +(kb / 1024 / 1024).toFixed(2);
    const ram = {
      totalGB: toGB(memTotal),
      usedGB: toGB(used),
      freeGB: toGB(memFree),
    };

    // CPU Load: /proc/loadavg
    
    // Read CPU core count from host
    const cpuinfo = await fs.readFile('/host/proc/cpuinfo', 'utf8');
    const coreCount = (cpuinfo.match(/^processor\s+:/gm) || []).length;

    // Load average
    const loadavgRaw = await fs.readFile('/host/proc/loadavg', 'utf8');
    const [load1, load5, load15] = loadavgRaw.trim().split(' ').map(Number);

    // Normalize
    const cpu = {
      load1,
      load5,
      load15,
      coreCount,
      usagePercent1: +(load1 / coreCount * 100).toFixed(2),
      usagePercent5: +(load5 / coreCount * 100).toFixed(2),
      usagePercent15: +(load15 / coreCount * 100).toFixed(2),
    };

    reply.send({ uptime, ram, cpu });
  } catch (err: unknown) {
    if (err instanceof Error) {
      const e = err as Error & { stderr?: string };
      reply.code(500).send({ error: e.stderr || e.message });
    } else {
      reply.code(500).send({ error: 'Unknown error occurred' });
    }
  }
});

fastify.listen({ port: 3001, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

console.log('Backend server listening on http://localhost:3001');
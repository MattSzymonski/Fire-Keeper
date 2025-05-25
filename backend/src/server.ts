import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs/promises';
import path from 'path';

const fastify = Fastify();
fastify.register(cors, { origin: '*' });
const execAsync = promisify(exec);

if (process.env.NODE_ENV === 'production') {
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../frontend/dist'), // Adjust path if needed
    prefix: '/', // Serve at root
  });

  fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.method === 'GET' && !req.raw.url?.startsWith('/api')) {
      reply.type('text/html').sendFile('index.html');
    } else {
      reply.status(404).send({ error: 'Not Found' });
    }
  });
}

fastify.get('/api/docker-containers-status', async (_req, reply) => {
  try {
    const { stdout } = await execAsync(`docker ps --format '{{.Names}},{{.Status}},{{.ID}}'`);
    const containers = stdout
      .trim()
      .split('\n')
      .map(line => {
        const [name, status, id] = line.split(',');
        return { name, status, id };
      });
    reply.send({ containers });
  } catch (err: any) {
    reply.code(500).send({ error: err.stderr || err.message });
  }
});

fastify.get('/api/system-status', async (_req, reply) => {
  try {
    const uptimeRaw = await fs.readFile('/host/proc/uptime', 'utf8');
    const [uptimeSeconds] = uptimeRaw.trim().split(' ').map(parseFloat);

    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${days}d ${hours}h ${minutes}m`;

    const meminfo = await fs.readFile('/host/proc/meminfo', 'utf8');
    const memTotal = parseInt(/MemTotal:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const memFree = parseInt(/MemFree:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const buffers = parseInt(/Buffers:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const cached = parseInt(/Cached:\s+(\d+)/.exec(meminfo)?.[1] || '0', 10);
    const used = memTotal - memFree - buffers - cached;
    const toGB = (kb: number) => +(kb / 1024 / 1024).toFixed(2);

    const cpuinfo = await fs.readFile('/host/proc/cpuinfo', 'utf8');
    const coreCount = (cpuinfo.match(/^processor\s+:/gm) || []).length;

    const loadavgRaw = await fs.readFile('/host/proc/loadavg', 'utf8');
    const [load1, load5, load15] = loadavgRaw.trim().split(' ').map(Number);

    const cpu = {
      load1,
      load5,
      load15,
      coreCount,
      usagePercent1: +(load1 / coreCount * 100).toFixed(2),
      usagePercent5: +(load5 / coreCount * 100).toFixed(2),
      usagePercent15: +(load15 / coreCount * 100).toFixed(2),
    };

    reply.send({ uptime, ram: { totalGB: toGB(memTotal), usedGB: toGB(used), freeGB: toGB(memFree) }, cpu });
  } catch (err: any) {
    reply.code(500).send({ error: err.stderr || err.message });
  }
});

fastify.get('/api/ping-ip', async (_req, reply) => {
  const start = Date.now();
  try {
    await execAsync('curl -Is --max-time 2 http://89.79.36.66');
    reply.send({ status: 'Online' });
  } catch (err) {
    reply.send({ status: 'Offline' });
  }
});

fastify.listen({ port: 3001, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

console.log('Backend server listening on http://localhost:3001');

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs/promises';
import path from 'path';
import { X509Certificate } from 'crypto';

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
    // Uptime
    const uptimeRaw = await fs.readFile('/host/proc/uptime', 'utf8');
    const [uptimeSeconds] = uptimeRaw.trim().split(' ').map(parseFloat);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${days}d ${hours}h ${minutes}m`;

    // Hardware info
    const memInfo = await fs.readFile('/host/proc/meminfo', 'utf8');
    const memTotal = parseInt(/MemTotal:\s+(\d+)/.exec(memInfo)?.[1] || '0', 10);
    const memFree = parseInt(/MemFree:\s+(\d+)/.exec(memInfo)?.[1] || '0', 10);
    const buffers = parseInt(/Buffers:\s+(\d+)/.exec(memInfo)?.[1] || '0', 10);
    const cached = parseInt(/Cached:\s+(\d+)/.exec(memInfo)?.[1] || '0', 10);
    const used = memTotal - memFree - buffers - cached;
    const toGB = (kb: number) => +(kb / 1024 / 1024).toFixed(2);
    const cpuInfo = await fs.readFile('/host/proc/cpuinfo', 'utf8');
    const coreCount = (cpuInfo.match(/^processor\s+:/gm) || []).length;
    const loadAvgRaw = await fs.readFile('/host/proc/loadavg', 'utf8');
    const [load1, load5, load15] = loadAvgRaw.trim().split(' ').map(Number);
    const cpu = {
      load1,
      load5,
      load15,
      coreCount,
      usagePercent1: +(load1 / coreCount * 100).toFixed(2),
      usagePercent5: +(load5 / coreCount * 100).toFixed(2),
      usagePercent15: +(load15 / coreCount * 100).toFixed(2),
    };

    // SSL certificate expiration check
    let certExpiresAt: string | null = null;
    try {
      const certPath = '/host/certificates/fullchain.pem';
      const certPem = await fs.readFile(certPath, 'utf8');
      const cert = new X509Certificate(certPem);
      const utcDate = new Date(cert.validTo);

      // Convert to Europe/Berlin timezone and format as dd.MM.yyyy
      const berlinDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
      const day = String(berlinDate.getDate()).padStart(2, '0');
      const month = String(berlinDate.getMonth() + 1).padStart(2, '0');
      const year = berlinDate.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;

      certExpiresAt = `${formattedDate}`;
    } catch (e) {
      certExpiresAt = null; // Could not read or parse certificate
    }

    reply.send({
      uptime,
      ram: { totalGB: toGB(memTotal), usedGB: toGB(used), freeGB: toGB(memFree) },
      cpu,
      ssl: { expiresAt: certExpiresAt }
    });
  } catch (err: any) {
    reply.code(500).send({ error: err.stderr || err.message });
  }
});

fastify.listen({ port: 3001, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

console.log('Backend server listening on http://localhost:3001');

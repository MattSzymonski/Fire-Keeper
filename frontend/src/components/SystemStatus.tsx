import React, { useEffect, useState } from "react";
import { Tooltip, Chip } from "@heroui/react";

type SystemStatus = {
  uptime: string;
  ram: {
    totalGB: number;
    usedGB: number;
    freeGB: number;
  };
  cpu: {
    load1: number;
    load5: number;
    load15: number;
    coreCount: number;
    usagePercent1: number;
    usagePercent5: number;
    usagePercent15: number;
  };
};

const URL = "https://campfire-on-the-wall.com";
const IP = "89.79.36.66";


export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("-");
  const [isCpuLoadTooltipOpen, setIsCpuLoadTooltipOpen] = React.useState(false);
  const [ipPingStatus, setIpPingStatus] = useState<"Online" | "Offline" | "Checking">("Checking");
  const [dnsPingStatus, setDnsPingStatus] = useState<"Online" | "Offline" | "Checking">("Checking");

  function StatusChip(status: "Online" | "Offline" | "Checking") {
    if (status === "Online") {
      return <Chip color="success">Online</Chip>;
    }
    if (status === "Offline") {
      return <Chip color="danger">Offline</Chip>;
    }
    return <Chip color="warning">Checking...</Chip>;
  }

  const pingIp = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      await fetch(IP, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIpPingStatus("Online");
    } catch {
      setIpPingStatus("Offline");
    }
  };

  const pingDns = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      await fetch(URL, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setDnsPingStatus("Online");
    } catch {
      setDnsPingStatus("Offline");
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/system-status");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStatus(data);

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const formattedTime = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setLastUpdateTime(formattedTime);
    } catch (err) {
      setError((err as Error).message || "Failed to load system status");
    } finally {
      setLoading(false);
    }
  };

  // --- Single useEffect ---
  useEffect(() => {
    pingIp();
    pingDns();
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 rounded animate-pulse w-1/2" />
        ))}
      </div>
    );
  }

  if (error || !status) {
    return <p className="text-red-500 text-center mt-4">Error: {error}</p>;
  }

  return (
    <div>
      <div className="p-[28px] bg-content1 rounded-large shadow-small w-full space-y-3">
        <div className="flex justify-between">
          <p>Status:</p>
          {StatusChip(ipPingStatus)}
        </div>
        <div className="flex justify-between">
          <p>DNS:</p>
          {StatusChip(dnsPingStatus)}
        </div>
        <div className="flex justify-between">
          <p>Uptime:</p>
          <p>{status.uptime}</p>
        </div>
        <div className="flex justify-between">
          <p>RAM:</p>
          <p>{status.ram.usedGB.toFixed(2)} / {status.ram.totalGB.toFixed(2)} GB</p>
        </div>
        
        <div className="flex justify-between">
          <div className={`space-y-[2px] flex flex-col justify-between`}>
            <p>CPU Load (1min):</p>
            <p>CPU Load (5min):</p>
            <p>CPU Load (15min):</p>
          </div>
          <Tooltip 
            content={<>Value 1.0 means that:<br/>A 1-core CPU is fully loaded<br/>A 4-core CPU is at 0.25% usage</>}
            showArrow={true}
            isOpen={isCpuLoadTooltipOpen}
            onOpenChange={(open) => setIsCpuLoadTooltipOpen(open)}
          >
            <div className={`${isCpuLoadTooltipOpen ? "bg-content2" : "bg-content1"} rounded-large space-y-[2px] flex flex-col justify-between`}>
              <p>{status.cpu.load1.toFixed(2)} / {status.cpu.coreCount} cores ({status.cpu.usagePercent1.toFixed(1)}%)</p>
              <p>{status.cpu.load5.toFixed(2)} / {status.cpu.coreCount} cores ({status.cpu.usagePercent5.toFixed(1)}%)</p>
              <p>{status.cpu.load15.toFixed(2)} / {status.cpu.coreCount} cores ({status.cpu.usagePercent15.toFixed(1)}%)</p>
            </div>
          </Tooltip>
        </div>
      </div>
      {lastUpdateTime ? <p className="text-tiny mt-2 text-right mr-1">Last update: {lastUpdateTime}</p> : null}
    </div>
  );
}

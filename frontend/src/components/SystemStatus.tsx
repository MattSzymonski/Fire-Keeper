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
  ssl: {
    expiresAt: string | null;
  };
  backups: {
    name: string;
    latestDate: string;
    expirationDays: number;
  }[];
};

export default function SystemStatus( { setIsServerOnline }: { setIsServerOnline?: (isOnline: boolean) => void } ) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
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
      const timeout = setTimeout(() => controller.abort(), 2000); // 3s timeout
      await fetch(import.meta.env.VITE_SERVER_IP!, { mode: "no-cors", signal: controller.signal });
      clearTimeout(timeout);
      setIpPingStatus("Online");
    } catch {
      setIpPingStatus("Offline");
    }
  };

  const pingDns = async () => {
    if (!navigator.onLine) {
      setDnsPingStatus("Offline");
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      await fetch(import.meta.env.VITE_SERVER_URL!, { method: "HEAD", mode: "no-cors", signal: controller.signal });
      clearTimeout(timeout);
      setDnsPingStatus("Online");
      setIsServerOnline && setIsServerOnline(true);
    } catch {
      setDnsPingStatus("Offline");
      setIsServerOnline && setIsServerOnline(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/system-status");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setStatus(data);
    } catch {
      
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

  const FormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hour}:${minute}`;
  }

  const dateColor = (dateString: string, expirationDays: number) => { 
    const date = new Date(dateString);
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    if (diffDays > expirationDays) {
      return "text-[hsl(var(--heroui-danger))]";
    }
    return "";
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
          <p>SSL Expiration Date:</p>
          {status ? (status.ssl.expiresAt ? 
            <p>{FormattedDate(status.ssl.expiresAt)}</p>
            : 
            <p className="text-[hsl(var(--heroui-danger))]">No Certificate Found</p>) 
            :
            <p>-</p>
          }
        </div>
        <div className="flex justify-between">
          <p>Uptime:</p>
          <p>{status ? status.uptime : "-"}</p>
        </div>
        <div className="flex justify-between items-start gap-4">
          <p className="font-medium">Backups:</p>
          <div className="flex flex-col items-end">
            {status && status.backups.length > 0 ? (
              status.backups.map((backup) => (
                <p key={backup.name} className={dateColor(backup.latestDate, backup.expirationDays)}>
                  {backup.name} - {FormattedDate(backup.latestDate)}
                </p>
              ))
            ) : (
              <p>No Backups Found</p>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <p>RAM:</p>
          <p>{status ? status.ram.usedGB.toFixed(2) : "-"} / {status ? status.ram.totalGB.toFixed(2) : "-"} GB</p>
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
              <p>{status ? status.cpu.load1.toFixed(2) : "-"} / {status ? status.cpu.coreCount : "-"} cores ({status ? status.cpu.usagePercent1.toFixed(1) : "-"}%)</p>
              <p>{status ? status.cpu.load5.toFixed(2) : "-"} / {status ? status.cpu.coreCount : "-"} cores ({status ? status.cpu.usagePercent5.toFixed(1) : "-"}%)</p>
              <p>{status ? status.cpu.load15.toFixed(2) : "-"} / {status ? status.cpu.coreCount : "-"} cores ({status ? status.cpu.usagePercent15.toFixed(1) : "-"}%)</p>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

import { StrictMode, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HeroUIProvider } from '@heroui/react';
import DockerContainersStatus from './components/DockerContainersStatus';
import SystemStatus from './components/SystemStatus';
import ServiceShortcuts from './components/ServicesShortcuts';
import PerspectiveCard from './components/PerspectiveCard';
const logo = '/images/COTW_logo.png';
import './style/global.css';

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState<null | boolean>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("-");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
  
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (!contentRef.current) return;
      setOverflowing(contentRef.current.scrollHeight > window.innerHeight - 700);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  useEffect(() => { 
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formattedTime = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setLastUpdateTime(formattedTime);
  }, []);


  return (
    <div ref={contentRef} className={`mx-[50px] w-full md:w-[700px] ${overflowing ? 'mt-[164px]' : ''}`}>
      {/* Offline Notification */}
      {!isOnline && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-black/30">
          <div className="text-white text-[20px] px-[32px] py-4 shadow-lg bg-content1 rounded-large">
            YOU ARE OFFLINE
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${overflowing === null ? "opacity-0" : ""}`}>
        <header 
          className=
          {`
            fixed top-0 left-0 w-full z-50 pt-[2px]  flex justify-center lg:justify-start
            lg:p-[16px] bg-[#000000] lg:bg-[#ffffff00]
          `}
        >
        <PerspectiveCard imagePath={logo} style={ "w-[80px] sm:w-[100px] lg:w-[120px]"} />
        </header> 
        <div className="px-6">
          <>
            <h1 className="mb-[12px]">SERVICES</h1>
            <ServiceShortcuts isDisabled={!isServerOnline}/>
          </>
            <div className='h-[84px]'/>
          <>
            <h1 className="mb-[12px]">SYSTEM</h1>
            <SystemStatus setIsServerOnline={setIsServerOnline}/>
          </>
            <div className='h-[64px]'/>
          <>
            <h1 className="mb-[12px]">CONTAINERS</h1>
            <DockerContainersStatus/>
          </>
          <div className='h-[128px]'/>
          {lastUpdateTime ? <p className="text-tiny mb-4 text-center">Last update: {lastUpdateTime}</p> : null}
        </div> 
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <main className="dark text-foreground bg-[#090909] flex flex-col items-center justify-center min-h-screen"> 
        <App/> 
      </main>
    </HeroUIProvider>
  </StrictMode>
);

import { StrictMode, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Calendar, HeroUIProvider } from '@heroui/react';
import DockerContainersStatus from './components/DockerContainersStatus';
import './style/global.css';
import logo from './assets/images/COTW_logo.png';
import SystemStatus from './components/SystemStatus';
import ServiceShortcuts from './components/ServiceShortcuts';

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState<null | boolean>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (!contentRef.current) return;
      setOverflowing(contentRef.current.scrollHeight > window.innerHeight - 700);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <div
      ref={contentRef}
      className={`mx-[50px] w-full md:w-[700px] ${overflowing ? 'mt-[164px]' : ''}`}
    >
      <div className={`${overflowing === null ? "opacity-0" : ""}`}>
        <header
          className="fixed top-0 left-0 w-full z-50 flex items-center px-4 py-2"
          style={{ minHeight: '120px' }}
        >
          <a
            href="https://campfire-on-the-wall.com"
            rel="noopener noreferrer"
            className="cursor-pointer hover:animate-pulse mr-4"
          >
            <img
              src={logo}
              alt="COTW Logo"
              style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
            />
          </a>
        </header>

          <div className="p-8">
            <>
              <h1 className="mb-[12px]">SERVICES</h1>
              <ServiceShortcuts/>
            </>
              <div className='h-[84px]'/>
            <>
              <h1 className="mb-[12px]">SYSTEM</h1>
              <SystemStatus/>
            </>
              <div className='h-[64px]'/>
            <>
              <h1 className="mb-[12px]">CONTAINERS</h1>
              <DockerContainersStatus/>
            </>
            <div className='h-[128px]'/>
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

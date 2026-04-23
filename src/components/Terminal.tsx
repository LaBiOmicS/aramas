import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalEngine } from '../terminal/engine/TerminalEngine';
import type { VFSNode } from '../terminal/vfs/types';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const engineRef = useRef<TerminalEngine | null>(null);
  
  const [currentQuest, setCurrentQuest] = useState<{title: string, progress: string} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (fitAddonRef.current) fitAddonRef.current.fit();
    };

    window.addEventListener('resize', handleResize);
    
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#151515',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: '#333333',
      },
      fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
      fontSize: isMobile ? 12 : 14,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    
    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    const updateUI = () => {
      if (engineRef.current) {
        const qm = engineRef.current.getQuestManager();
        const q = qm.getCurrentQuest();
        if (q) {
          setCurrentQuest({ title: q.title, progress: qm.getProgress() });
        } else {
          setCurrentQuest(null);
        }
      }
    };

    engineRef.current = new TerminalEngine(xterm, updateUI);
    updateUI();

    // Pequeno delay para garantir que o container terminou de animar
    setTimeout(() => fitAddon.fit(), 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, []);

  // Re-ajustar terminal quando a sidebar abre/fecha
  useEffect(() => {
    setTimeout(() => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    }, 300);
  }, [sidebarOpen]);

  const commandGroups = [
    {
      title: 'Navegação',
      commands: [
        { name: 'pwd', desc: 'Mostra onde você está agora', example: 'pwd' },
        { name: 'ls', desc: 'Lista arquivos e pastas', example: 'ls -l' },
        { name: 'cd', desc: 'Entra em uma pasta', example: 'cd nome_da_pasta' },
        { name: 'cd ..', desc: 'Volta para a pasta anterior', example: 'cd ..' },
      ]
    },
    {
      title: 'Arquivos e Pastas',
      commands: [
        { name: 'mkdir', desc: 'Cria uma nova pasta', example: 'mkdir nova_pasta' },
        { name: 'touch', desc: 'Cria um arquivo vazio', example: 'touch nota.txt' },
        { name: 'cp', desc: 'Copia um arquivo', example: 'cp arq1.txt copia.txt' },
        { name: 'mv', desc: 'Move ou renomeia um arquivo', example: 'mv arq.txt pasta/' },
        { name: 'rm', desc: 'Remove um arquivo', example: 'rm arquivo.txt' },
        { name: 'rm -r', desc: 'Remove uma pasta e tudo nela', example: 'rm -r pasta/' },
      ]
    },
    {
      title: 'Texto e Conteúdo',
      commands: [
        { name: 'cat', desc: 'Mostra o conteúdo de um arquivo', example: 'cat nota.txt' },
        { name: 'echo', desc: 'Escreve texto ou cria arquivos', example: 'echo "Oi" > arq.txt' },
        { name: 'grep', desc: 'Busca texto dentro de arquivos', example: 'grep "erro" log.txt' },
        { name: 'head/tail', desc: 'Vê o início ou fim de um arquivo', example: 'head arq.txt' },
      ]
    },
    {
      title: 'Rede e Sistema',
      commands: [
        { name: 'apt', desc: 'Instala pacotes (simulado)', example: 'apt install git' },
        { name: 'ping', desc: 'Testa conexão com um site', example: 'ping google.com' },
        { name: 'top/ps', desc: 'Mostra processos rodando', example: 'top' },
      ]
    }
  ];

  return (
    <div ref={containerRef} style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#0a0a0a',
      color: '#d4d4d4',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Header Responsivo */}
      <header style={{ 
        height: '50px', 
        backgroundColor: '#1a1a1b', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 15px',
        borderBottom: '1px solid #333',
        zIndex: 100,
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '20px',
              cursor: 'pointer',
              marginRight: '15px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>
            LABIOMICS <span style={{ color: '#007acc', fontWeight: 400 }}>TERMINAL</span>
          </div>
        </div>
        
        {isMobile && currentQuest && (
          <div style={{ fontSize: '11px', color: '#0dbc79' }}>
            {currentQuest.progress}
          </div>
        )}
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar Lateral - Guia de Comandos */}
        <aside style={{ 
          width: sidebarOpen ? (isMobile ? '100%' : '300px') : '0px', 
          height: '100%', 
          backgroundColor: '#111112', 
          borderRight: sidebarOpen ? '1px solid #333' : 'none',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: isMobile ? 'absolute' : 'relative',
          zIndex: 90,
          visibility: sidebarOpen ? 'visible' : 'hidden'
        }}>
          <div style={{ padding: '20px 15px 10px', fontSize: '11px', fontWeight: 700, color: '#007acc', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Guia de Comandos (Cola)
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 15px 20px' }}>
            {commandGroups.map((group, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', borderBottom: '1px solid #222', paddingBottom: '3px' }}>
                  {group.title}
                </div>
                {group.commands.map((cmd, j) => (
                  <div key={j} style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#eee', fontFamily: 'monospace', fontWeight: 'bold' }}>{cmd.name}</div>
                    <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>{cmd.desc}</div>
                    <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic', marginTop: '1px' }}>Ex: {cmd.example}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Missão no Sidebar */}
          {currentQuest && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#1a1a1b', 
              borderTop: '1px solid #333',
              margin: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '10px', color: '#0dbc79', fontWeight: 800, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>MISSÃO ATUAL</span>
                <span>{currentQuest.progress}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#eee', lineHeight: '1.4', fontWeight: 500 }}>
                {currentQuest.title}
              </div>
            </div>
          )}
        </aside>

        {/* Área do Terminal */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#151515',
          position: 'relative'
        }}>
          {/* Tabs/Breadcrumb */}
          <div style={{ 
            height: '35px', 
            backgroundColor: '#1a1a1b', 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 15px',
            fontSize: '11px',
            color: '#888',
            borderBottom: '1px solid #111'
          }}>
            <span style={{ color: '#0dbc79', marginRight: '8px' }}>➜</span>
            terminal — bash — dayhoff@LaBiOmicS
          </div>

          <div 
            ref={terminalRef} 
            style={{ 
              flex: 1, 
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box'
            }} 
          />
        </main>
      </div>
    </div>
  );
};

export default Terminal;

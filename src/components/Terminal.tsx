import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalEngine } from '../terminal/engine/TerminalEngine';
import { RANKS, Achievement } from '../terminal/engine/QuestManager';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const engineRef = useRef<TerminalEngine | null>(null);
  
  const [currentQuest, setCurrentQuest] = useState<{title: string, progress: string, category: string, xp: number} | null>(null);
  const [userProfile, setUserProfile] = useState<{rank: string, xp: number, achievements: Achievement[]}>({ rank: RANKS[0].name, xp: 0, achievements: [] });
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
          setCurrentQuest({ title: q.title, progress: qm.getProgress(), category: q.category, xp: q.xp });
        } else {
          setCurrentQuest(null);
        }
        setUserProfile({
          rank: qm.getRank().name,
          xp: qm.getXP(),
          achievements: qm.getAchievements()
        });
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
      title: '1. Navegação e Exploração de Arquivos',
      info: 'Comandos para entender onde você está e o que há ao seu redor.',
      commands: [
        { name: 'pwd', desc: 'Exibe o caminho completo do diretório atual (Print Working Directory)', example: 'pwd' },
        { name: 'ls', desc: 'Lista o conteúdo do diretório (arquivos e pastas)', example: 'ls -la' },
        { name: 'cd', desc: 'Muda o diretório de trabalho atual', example: 'cd diretório' },
      ]
    },
    {
      title: '2. Manipulação de Arquivos e Pastas',
      commands: [
        { name: 'mkdir', desc: 'Cria um novo diretório (pasta)', example: 'mkdir nova_pasta' },
        { name: 'touch', desc: 'Cria um arquivo vazio ou atualiza o timestamp', example: 'touch arquivo.txt' },
        { name: 'cp', desc: 'Copia arquivos ou diretórios', example: 'cp origem destino' },
        { name: 'mv', desc: 'Move ou renomeia arquivos ou diretórios', example: 'mv antigo novo' },
        { name: 'rm', desc: 'Remove arquivos ou diretórios', example: 'rm -rf pasta' },
      ]
    },
    {
      title: '3. Visualização e Busca de Texto',
      commands: [
        { name: 'cat', desc: 'Exibe o conteúdo completo de um arquivo', example: 'cat sequencia.fasta' },
        { name: 'grep', desc: 'Busca por padrões de texto dentro de arquivos', example: 'grep "ATG" seq.txt' },
        { name: 'find', desc: 'Busca arquivos em toda a hierarquia', example: 'find / -name "seq.fasta"' },
        { name: 'head', desc: 'Exibe as primeiras linhas de um arquivo', example: 'head -n 5 seq.txt' },
        { name: 'tail', desc: 'Exibe as últimas linhas de um arquivo', example: 'tail -n 5 seq.txt' },
      ]
    },
    {
      title: '4. Administração e Permissões',
      commands: [
        { name: 'sudo', desc: 'Executa comandos com privilégios de superusuário', example: 'sudo ls /root' },
        { name: 'chmod', desc: 'Altera as permissões de acesso (rwx)', example: 'chmod rwxr-xr-x arquivo' },
        { name: 'chown', desc: 'Altera o dono e o grupo de um arquivo', example: 'sudo chown root arquivo' },
        { name: 'whoami', desc: 'Exibe o nome do usuário atual', example: 'whoami' },
      ]
    },
    {
      title: '5. Computação Científica (Bioinfo)',
      commands: [
        { name: 'conda', desc: 'Gerenciador de ambientes virtuais', example: 'conda create -n bio' },
        { name: 'mamba', desc: 'Instalador ultra-rápido de pacotes', example: 'mamba install bwa' },
        { name: 'samtools', desc: 'Manipulação de arquivos genômicos', example: 'samtools view' },
        { name: 'fasta-view', desc: 'Visualização colorida de sequências', example: 'fasta-view seq.fasta' },
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
            TERMINAL <span style={{ color: '#007acc', fontWeight: 400 }}>EDUCACIONAL</span>
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
          {/* Perfil do Pesquisador Dashboard */}
          <div style={{ padding: '20px 15px', backgroundColor: '#1a1a1b', borderBottom: '1px solid #333' }}>
            <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase' }}>Perfil do Estudante</div>
            <div style={{ fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '2px' }}>{userProfile.rank}</div>
            <div style={{ fontSize: '11px', color: '#007acc', marginBottom: '10px' }}>{userProfile.xp} XP acumulados</div>
            
            {/* Conquistas (Badges) */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
              {userProfile.achievements.map(a => (
                <span key={a.id} title={`${a.name}: ${a.description}`} style={{ 
                  fontSize: '18px', 
                  backgroundColor: '#222', 
                  padding: '5px', 
                  borderRadius: '4px',
                  cursor: 'help'
                }}>
                  {a.icon}
                </span>
              ))}
              {userProfile.achievements.length === 0 && (
                <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic' }}>Nenhuma conquista ainda...</div>
              )}
            </div>
          </div>

          <div style={{ padding: '20px 15px 10px', fontSize: '11px', fontWeight: 700, color: '#007acc', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Guia de Comandos
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 15px 20px' }}>
            {commandGroups.map((group, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '4px', borderBottom: '1px solid #222', paddingBottom: '3px' }}>
                  {group.title}
                </div>
                {group.info && (
                  <div style={{ fontSize: '11px', color: '#555', marginBottom: '10px', fontStyle: 'italic' }}>
                    {group.info}
                  </div>
                )}
                {group.commands.map((cmd, j) => (
                  <div key={j} style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#eee', fontFamily: 'monospace', fontWeight: 'bold' }}>{cmd.name}</div>
                    <div style={{ fontSize: '11px', color: '#777', marginTop: '2px' }}>{cmd.desc}</div>
                    <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic', marginTop: '1px' }}>Ex: {cmd.example}</div>
                  </div>
                ))}
              </div>
            ))}

            {/* Dica de Ouro Section */}
            <div style={{ 
              marginTop: '30px', 
              padding: '15px', 
              backgroundColor: 'rgba(255, 215, 0, 0.05)', 
              border: '1px solid rgba(255, 215, 0, 0.2)', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffd700', marginBottom: '8px' }}>
                💡 Dica de Ouro: Pipes (|) e Grep
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>
                Uma das maiores forças do Linux é o <strong>grep</strong>, usado para buscar texto. 
                Com o <strong>pipe (|)</strong>, você pode enviar o resultado de um comando para outro.<br/><br/>
                <code style={{ color: '#eee' }}>ls | grep ".fasta"</code><br/>
                (Lista arquivos e filtra apenas os .fasta)
              </div>
            </div>
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
                <span>{currentQuest.category.toUpperCase()}</span>
                <span>{currentQuest.progress}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#eee', lineHeight: '1.4', fontWeight: 500 }}>
                {currentQuest.title}
              </div>
              <div style={{ fontSize: '10px', color: '#007acc', marginTop: '5px', fontWeight: 600 }}>
                Recompensa: +{currentQuest.xp} XP
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

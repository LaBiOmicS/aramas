import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalEngine } from '../terminal/engine/TerminalEngine';
import { RANKS } from '../terminal/engine/QuestManager';
import type { Achievement } from '../terminal/engine/QuestManager';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const engineRef = useRef<TerminalEngine | null>(null);
  
  const [currentQuest, setCurrentQuest] = useState<{title: string, progress: string, category: string, xp: number} | null>(null);
  const [userProfile, setUserProfile] = useState<{rank: string, xp: number, achievements: Achievement[]}>({ rank: RANKS[0].name, xp: 0, achievements: [] });
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => ({ ...prev, [index]: !prev[index] }));
  };

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
      scrollback: 1000,
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

    setTimeout(() => fitAddon.fit(), 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    }, 300);
  }, [sidebarOpen]);

  const commandGroups = [
    {
      title: '📁 Navegação e Arquivos',
      commands: [
        { name: 'ls', desc: 'Lista arquivos e diretórios', example: 'ls -la' },
        { name: 'cd', desc: 'Muda de diretório', example: 'cd data/' },
        { name: 'pwd', desc: 'Mostra o caminho atual', example: 'pwd' },
        { name: 'mkdir', desc: 'Cria uma pasta', example: 'mkdir analise' },
        { name: 'rm', desc: 'Remove arquivos/pastas', example: 'rm -rf tmp/' },
        { name: 'cp/mv', desc: 'Copia ou move arquivos', example: 'cp arq.txt backup/' },
        { name: 'touch', desc: 'Cria arquivo vazio', example: 'touch nota.txt' },
        { name: 'cat', desc: 'Mostra conteúdo de arquivo', example: 'cat seq.fa' },
      ]
    },
    {
      title: '🧬 Bioinformática',
      commands: [
        { name: 'fastqc', desc: 'Controle de qualidade', example: 'fastqc reads.fq' },
        { name: 'bwa/bowtie2', desc: 'Alinhamento de DNA', example: 'bwa mem ref.fa r1.fq' },
        { name: 'samtools', desc: 'Manipula arquivos BAM', example: 'samtools sort aln.bam' },
        { name: 'gatk', desc: 'Chamada de variantes', example: 'gatk HaplotypeCaller' },
        { name: 'blastn/p', desc: 'Busca de similaridade', example: 'blastn -query q.fa' },
        { name: 'spades', desc: 'Montagem de genomas', example: 'spades.py -1 r1.fq' },
        { name: 'kraken2', desc: 'Taxonomia metagenômica', example: 'kraken2 --db db r.fq' },
        { name: 'salmon', desc: 'Expressão gênica RNA-seq', example: 'salmon quant -i idx' },
        { name: 'bedtools', desc: 'Aritmética genômica', example: 'bedtools intersect' },
      ]
    },
    {
      title: '📦 Gerenciadores & Ambientes',
      commands: [
        { name: 'conda/mamba', desc: 'Cria ambientes e instala pacotes', example: 'conda create -n bio' },
        { name: 'pip', desc: 'Pacotes Python', example: 'pip install pandas' },
        { name: 'pyenv', desc: 'Versões do Python', example: 'pyenv global 3.10.4' },
        { name: 'apt', desc: 'Pacotes do sistema', example: 'apt install git' },
        { name: 'pixi', desc: 'Projetos reprodutíveis', example: 'pixi add numpy' },
      ]
    },
    {
      title: '🐳 Containers & HPC',
      commands: [
        { name: 'docker', desc: 'Containers Docker', example: 'docker run ubuntu' },
        { name: 'singularity', desc: 'Containers para HPC', example: 'singularity shell img.sif' },
        { name: 'sbatch/squeue', desc: 'Slurm Cluster', example: 'squeue -u $USER' },
        { name: 'snakemake', desc: 'Pipelines de bioinfo', example: 'snakemake -c 4' },
        { name: 'make', desc: 'Automação de build', example: 'make all' },
      ]
    },
    {
      title: '🌐 Redes & Sistema',
      commands: [
        { name: 'ip addr', desc: 'Endereços de rede', example: 'ip a' },
        { name: 'netstat', desc: 'Portas e conexões', example: 'netstat -tulpn' },
        { name: 'top/ps', desc: 'Processos e CPU', example: 'ps aux' },
        { name: 'free -h', desc: 'Memória RAM', example: 'free -h' },
        { name: 'df -h', desc: 'Espaço em disco', example: 'df -h' },
        { name: 'chmod/chown', desc: 'Permissões e donos', example: 'chmod 755 script' },
        { name: 'whoami/id', desc: 'Usuário atual', example: 'id' },
      ]
    },
    {
      title: '🛠️ Utilitários de Texto',
      commands: [
        { name: 'grep', desc: 'Busca texto', example: 'grep "motif" seq.fa' },
        { name: 'sed/awk', desc: 'Edição de fluxo/colunas', example: 'awk "{print $1}"' },
        { name: 'sort/uniq', desc: 'Ordenação e contagem', example: 'sort list.txt | uniq -c' },
        { name: 'head/tail', desc: 'Início ou fim do arquivo', example: 'head -n 20 data.txt' },
        { name: 'vim', desc: 'Editor de texto', example: 'vim config.yaml' },
      ]
    }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#d4d4d4', 
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
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
          <div style={{ padding: '20px 15px', backgroundColor: '#1a1a1b', borderBottom: '1px solid #333' }}>
            <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase' }}>Perfil do Estudante</div>
            <div style={{ fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '2px' }}>{userProfile.rank}</div>
            <div style={{ fontSize: '11px', color: '#007acc' }}>{userProfile.xp} XP acumulados</div>
          </div>

          <div style={{ padding: '15px 15px 5px', fontSize: '11px', fontWeight: 700, color: '#007acc', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Guia de Comandos
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {commandGroups.map((group, i) => (
              <div key={i} style={{ borderBottom: '1px solid #222' }}>
                <button 
                  onClick={() => toggleGroup(i)}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: expandedGroups[i] ? '#1a1a1b' : 'none',
                    border: 'none',
                    color: expandedGroups[i] ? '#0dbc79' : '#ccc',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{group.title}</span>
                  <span style={{ fontSize: '10px' }}>{expandedGroups[i] ? '▼' : '▶'}</span>
                </button>
                
                {expandedGroups[i] && (
                  <div style={{ padding: '10px 15px', backgroundColor: '#0f0f10' }}>
                    {group.commands.map((cmd, j) => (
                      <div key={j} style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#eee', fontFamily: 'monospace', fontWeight: 'bold' }}>{cmd.name}</div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{cmd.desc}</div>
                        <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic', marginTop: '1px' }}>Ex: {cmd.example}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#151515', position: 'relative' }}>
          <div style={{ height: '35px', backgroundColor: '#1a1a1b', display: 'flex', alignItems: 'center', padding: '0 15px', fontSize: '11px', color: '#888', borderBottom: '1px solid #111' }}>
            <span style={{ color: '#0dbc79', marginRight: '8px' }}>➜</span>
            terminal — bash — dayhoff@LaBiOmicS
          </div>
          <div 
            ref={terminalRef} 
            style={{ 
              flex: 1, 
              width: '100%',
              padding: '0',
              margin: '0',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }} 
          />
        </main>
      </div>
    </div>
  );
};

export default Terminal;

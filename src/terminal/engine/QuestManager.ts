import { VFSManager } from '../vfs/VFSManager';

export type QuestCategory = 'Sistemas Operacionais' | 'Manipulação de Dados' | 'Computação Científica';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
}

export interface Quest {
  id: string;
  category: QuestCategory;
  title: string;
  description: string;
  hint: string;
  xp: number;
  checkCondition: (vfs: VFSManager, lastCommand: string, fullLine: string) => boolean;
  completionMessage: string;
}

export const RANKS = [
  { name: 'Novato(a)', minXp: 0 },
  { name: 'Iniciante', minXp: 500 },
  { name: 'Intermediário(a)', minXp: 1200 },
  { name: 'Avançado(a)', minXp: 2500 },
  { name: 'Especialista', minXp: 5000 }
];

export const quests: Quest[] = [
  // --- MÓDULO 1: SISTEMAS OPERACIONAIS ---
  {
    id: 'so-1',
    category: 'Sistemas Operacionais',
    title: 'Explorador de Arquivos',
    description: 'Comece pelo básico. Liste os arquivos do seu diretório atual para ver o que há por aqui.',
    hint: 'Use o comando \'ls\'.',
    xp: 100,
    checkCondition: (_, cmd) => cmd === 'ls',
    completionMessage: 'Você deu o primeiro passo na navegação de sistemas!',
  },
  {
    id: 'so-2',
    category: 'Sistemas Operacionais',
    title: 'Hierarquia Oculta',
    description: 'Muitos arquivos importantes no Linux começam com ponto (.). Liste todos os arquivos, incluindo os ocultos.',
    hint: 'Tente \'ls -la\'.',
    xp: 150,
    checkCondition: (_, __, line) => line.includes('ls') && line.includes('-a'),
    completionMessage: 'Parabéns! Você descobriu arquivos de configuração como o .bashrc.',
  },
  {
    id: 'so-3',
    category: 'Sistemas Operacionais',
    title: 'Acesso Administrativo',
    description: 'Tente visualizar o conteúdo do diretório \'/root\'. Você precisará elevar seus privilégios.',
    hint: 'Use \'sudo ls /root\'.',
    xp: 250,
    checkCondition: (_, cmd, line) => cmd === 'sudo' && line.includes('ls /root'),
    completionMessage: 'Poder de root concedido! Cuidado ao usar este comando.',
  },

  // --- MÓDULO 2: MANIPULAÇÃO DE DADOS ---
  {
    id: 'data-1',
    category: 'Manipulação de Dados',
    title: 'Coleta de Dados',
    description: 'Baixe um conjunto de dados simulado da web para análise.',
    hint: 'Use \'wget http://exemplo.com/dados.csv\'.',
    xp: 200,
    checkCondition: (_, cmd) => cmd === 'wget' || cmd === 'curl',
    completionMessage: 'Download concluído! Agora os dados estão prontos para o processamento.',
  },
  {
    id: 'data-2',
    category: 'Manipulação de Dados',
    title: 'Descompactação Progressiva',
    description: 'Muitos datasets vêm compactados. Crie um arquivo .tar simulado e depois extraia-o.',
    hint: 'Use \'tar -cvf backup.tar projetos\' e depois \'tar -xvf backup.tar\'.',
    xp: 300,
    checkCondition: (_, cmd) => cmd === 'tar',
    completionMessage: 'Domínio de empacotamento e compressão alcançado!',
  },
  {
    id: 'data-3',
    category: 'Manipulação de Dados',
    title: 'Minerador de Texto',
    description: 'Filtre linhas específicas de um arquivo de log e conte as ocorrências.',
    hint: 'Tente algo como \'grep "Erro" log.txt | wc -l\'.',
    xp: 400,
    checkCondition: (_, __, line) => line.includes('|') && line.includes('grep') && line.includes('wc'),
    completionMessage: 'Mestre dos Pipes! O encadeamento de comandos é o segredo da produtividade.',
  },

  // --- MÓDULO 3: COMPUTAÇÃO CIENTÍFICA ---
  {
    id: 'science-1',
    category: 'Computação Científica',
    title: 'O Laboratório Virtual',
    description: 'Na ciência, a reprodutibilidade é tudo. Crie um ambiente isolado chamado \'projeto_beta\' usando mamba.',
    hint: 'Tente \'mamba create -n projeto_beta\'.',
    xp: 400,
    checkCondition: () => {
      const envs = JSON.parse(localStorage.getItem('terminal_envs') || '[]');
      return envs.includes('projeto_beta');
    },
    completionMessage: 'Ambiente criado! Você agora pode gerenciar dependências sem conflitos.',
  },
  {
    id: 'science-2',
    category: 'Computação Científica',
    title: 'Ativação de Ferramentas',
    description: 'Ative seu novo ambiente para começar a instalar ferramentas específicas.',
    hint: 'Use \'conda activate projeto_beta\'.',
    xp: 300,
    checkCondition: () => localStorage.getItem('current_env') === 'projeto_beta',
    completionMessage: 'Prompt alterado! Você está operando de forma isolada e segura.',
  },
  {
    id: 'science-3',
    category: 'Computação Científica',
    title: 'Análise Genômica Real',
    description: 'Instale a ferramenta \'samtools\' no ambiente e visualize os dados do arquivo fasta.',
    hint: 'Use \'mamba install samtools\' e depois explore o comando \'fasta-view\'.',
    xp: 500,
    checkCondition: (_, cmd) => {
      const pkgs = JSON.parse(localStorage.getItem('pkgs_projeto_beta') || '[]');
      return (cmd === 'mamba' && pkgs.includes('samtools')) || cmd === 'fasta-view';
    },
    completionMessage: 'Jornada concluída! Você domina do SO básico à Computação Científica avançada.',
  }
];

export const achievements: Achievement[] = [
  { id: 'admin_badge', name: 'Administrador(a)', description: 'Usou comandos sudo com sucesso', icon: '⚡', condition: (s) => s.sudoCount > 0 },
  { id: 'pipe_badge', name: 'Mestre dos Pipes', description: 'Executou filtros complexos com pipes', icon: '🔗', condition: (s) => s.pipeCount >= 3 },
  { id: 'env_badge', name: 'Cientista de Ambientes', description: 'Gerenciou múltiplos ambientes virtuais', icon: '🧪', condition: (s) => s.envCount >= 2 }
];

export class QuestManager {
  private currentQuestIndex: number = 0;
  private totalXp: number = 0;
  private stats = { sudoCount: 0, pipeCount: 0, envCount: 1 };

  constructor() {
    this.loadState();
  }

  private loadState() {
    const saved = localStorage.getItem('quest_manager_state');
    if (saved) {
      const state = JSON.parse(saved);
      this.currentQuestIndex = state.index || 0;
      this.totalXp = state.xp || 0;
      this.stats = state.stats || this.stats;
    }
    const envs = JSON.parse(localStorage.getItem('terminal_envs') || '["base"]');
    this.stats.envCount = envs.length;
  }

  private saveState() {
    localStorage.setItem('quest_manager_state', JSON.stringify({
      index: this.currentQuestIndex,
      xp: this.totalXp,
      stats: this.stats
    }));
  }

  public getRank() {
    return [...RANKS].reverse().find(r => this.totalXp >= r.minXp) || RANKS[0];
  }

  public getXP() { return this.totalXp; }
  
  public getProgress(): string {
    return `${this.currentQuestIndex}/${quests.length}`;
  }

  public getCurrentQuest(): Quest | null {
    return this.currentQuestIndex < quests.length ? quests[this.currentQuestIndex] : null;
  }

  public getAchievements(): Achievement[] {
    return achievements.filter(a => a.condition(this.stats));
  }

  public checkProgress(vfs: VFSManager, lastCommand: string, fullLine: string): {quest: Quest, rankUp: boolean} | null {
    const current = this.getCurrentQuest();
    
    if (fullLine.startsWith('sudo')) this.stats.sudoCount++;
    if (fullLine.includes('|')) this.stats.pipeCount++;
    const envs = JSON.parse(localStorage.getItem('terminal_envs') || '["base"]');
    this.stats.envCount = envs.length;

    if (current && current.checkCondition(vfs, lastCommand, fullLine)) {
      const oldRank = this.getRank().name;
      this.totalXp += current.xp;
      this.currentQuestIndex++;
      const newRank = this.getRank().name;
      
      this.saveState();
      return { quest: current, rankUp: oldRank !== newRank };
    }
    
    this.saveState();
    return null;
  }
}

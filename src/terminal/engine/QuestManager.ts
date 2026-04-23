import { VFSManager } from '../vfs/VFSManager';

export type QuestCategory = 'Fundamentos' | 'Administração' | 'Dados & Pipes' | 'Bioinformática';

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
  { name: 'Estagiário(a) de Bioinfo', minXp: 0 },
  { name: 'Analista Júnior', minXp: 500 },
  { name: 'Analista Pleno', minXp: 1200 },
  { name: 'Pesquisador(a) Sênior', minXp: 2500 },
  { name: 'Arquiteto(a) Genômico', minXp: 5000 }
];

export const quests: Quest[] = [
  // --- FUNDAMENTOS ---
  {
    id: 'intro-1',
    category: 'Fundamentos',
    title: 'Ponto de Partida',
    description: 'Localize sua posição atual no servidor.',
    hint: 'Use \'pwd\'.',
    xp: 100,
    checkCondition: (_, cmd) => cmd === 'pwd',
    completionMessage: 'Você identificou seu diretório home (/home/dayhoff).',
  },
  {
    id: 'ls-1',
    category: 'Fundamentos',
    title: 'Visão Periférica',
    description: 'Liste os arquivos, incluindo os ocultos, para ver a configuração do ambiente.',
    hint: 'Tente \'ls -la\'.',
    xp: 150,
    checkCondition: (_, __, line) => line.includes('ls') && line.includes('-a'),
    completionMessage: 'Excelente. Você descobriu arquivos ocultos como .bashrc!',
  },
  
  // --- ADMINISTRAÇÃO ---
  {
    id: 'sudo-1',
    category: 'Administração',
    title: 'Acesso Restrito',
    description: 'Tente visualizar o conteúdo da pasta /root e use privilégios se necessário.',
    hint: 'Use \'sudo ls /root\'.',
    xp: 300,
    checkCondition: (_, cmd, line) => cmd === 'sudo' && line.includes('ls /root'),
    completionMessage: 'Privilégios de superusuário adquiridos!',
  },
  {
    id: 'chmod-1',
    category: 'Administração',
    title: 'Cofre de Dados',
    description: 'Crie um arquivo \'protegido.txt\' e mude a permissão para que ninguém (nem você) possa ler.',
    hint: 'Use \'touch protegido.txt\' e \'chmod 000 protegido.txt\'.',
    xp: 250,
    checkCondition: (vfs) => {
      const node = vfs.getNode('/home/dayhoff/protegido.txt');
      return !!node && node.permissions === '---------';
    },
    completionMessage: 'Permissões alteradas com sucesso. Segurança em primeiro lugar!',
  },

  // --- DADOS & PIPES ---
  {
    id: 'pipe-1',
    category: 'Dados & Pipes',
    title: 'Fluxo de Trabalho',
    description: 'Conte quantas sequências existem no arquivo \'sequencia.fasta\' usando grep e wc em um único comando.',
    hint: 'Tente \'grep ">" sequencia.fasta | wc -l\'.',
    xp: 400,
    checkCondition: (_, __, line) => line.includes('|') && line.includes('grep') && line.includes('wc'),
    completionMessage: 'Você dominou o encadeamento de comandos (Pipes)!',
  },

  // --- BIOINFORMATICA ---
  {
    id: 'bio-env-1',
    category: 'Bioinformática',
    title: 'Isolamento Biológico',
    description: 'Crie um ambiente virtual chamado \'genomica\' usando o mamba para seus experimentos.',
    hint: 'Tente \'mamba create -n genomica\'.',
    xp: 300,
    checkCondition: () => {
      const envs = JSON.parse(localStorage.getItem('terminal_envs') || '[]');
      return envs.includes('genomica');
    },
    completionMessage: 'Ambiente de análise criado!',
  },
  {
    id: 'bio-tool-1',
    category: 'Bioinformática',
    title: 'Arsenal Técnico',
    description: 'Instale o \'samtools\' no ambiente \'genomica\' e verifique a versão.',
    hint: 'Ative o ambiente primeiro e use \'mamba install samtools\'.',
    xp: 500,
    checkCondition: (_, cmd) => {
      const pkgs = JSON.parse(localStorage.getItem('pkgs_genomica') || '[]');
      return cmd === 'samtools' || (cmd === 'mamba' && pkgs.includes('samtools'));
    },
    completionMessage: 'Ferramenta pronta para uso no ambiente correto!',
  }
];

export const achievements: Achievement[] = [
  { id: 'root_power', name: 'Soberano do Sistema', description: 'Usou sudo pela primeira vez', icon: '👑', condition: (s) => s.sudoCount > 0 },
  { id: 'pipe_master', name: 'Mestre dos Encanos', description: 'Usou um pipe complexo', icon: '🧪', condition: (s) => s.pipeCount > 0 },
  { id: 'env_architect', name: 'Arquiteto de Ambientes', description: 'Criou 3 ou mais ambientes virtuais', icon: '🏗️', condition: (s) => s.envCount >= 3 }
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
    // Sincronizar envCount
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
    
    // Atualizar stats
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

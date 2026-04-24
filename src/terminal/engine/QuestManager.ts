import { VFSManager } from '../vfs/VFSManager';

export type QuestCategory = 'Sistemas Operacionais' | 'Manipulação de Dados' | 'Computação Científica';

export interface Stats {
  sudoCount: number;
  pipeCount: number;
  envCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: Stats) => boolean;
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
  { name: 'Iniciante', minXp: 1000 },
  { name: 'Intermediário(a)', minXp: 3000 },
  { name: 'Avançado(a)', minXp: 7000 },
  { name: 'Especialista', minXp: 15000 },
  { name: 'Mestre da Bioinformática', minXp: 30000 }
];

export const quests: Quest[] = [
  // --- MÓDULO 1: SISTEMAS OPERACIONAIS (Básico -> Admin) ---
  {
    id: 'so-1',
    category: 'Sistemas Operacionais',
    title: 'Exploração Inicial',
    description: 'Liste os arquivos do seu diretório atual para ver o que há por aqui.',
    hint: 'Use o comando \'ls\'.',
    xp: 100,
    checkCondition: (_, cmd) => cmd === 'ls',
    completionMessage: 'Primeiro passo dado!',
  },
  {
    id: 'so-2',
    category: 'Sistemas Operacionais',
    title: 'Arquivos Invisíveis',
    description: 'No Linux, arquivos que começam com ponto (.) são ocultos. Liste todos eles.',
    hint: 'Tente \'ls -a\'.',
    xp: 150,
    checkCondition: (_, __, line) => line.includes('ls') && line.includes('-a'),
    completionMessage: 'Você descobriu os segredos do sistema!',
  },
  {
    id: 'so-3',
    category: 'Sistemas Operacionais',
    title: 'Onde estou?',
    description: 'Descubra o caminho completo do diretório onde você está trabalhando agora.',
    hint: 'Use \'pwd\'.',
    xp: 100,
    checkCondition: (_, cmd) => cmd === 'pwd',
    completionMessage: 'Localização confirmada.',
  },
  {
    id: 'so-4',
    category: 'Sistemas Operacionais',
    title: 'Criando Espaço',
    description: 'Crie uma nova pasta chamada \'experimentos\' para organizar seus arquivos.',
    hint: 'Use \'mkdir experimentos\'.',
    xp: 150,
    checkCondition: (vfs) => vfs.getNode('/home/dayhoff/experimentos') !== null,
    completionMessage: 'Diretório criado com sucesso!',
  },
  {
    id: 'so-5',
    category: 'Sistemas Operacionais',
    title: 'Entrando na Pasta',
    description: 'Mude para o diretório \'experimentos\' que você acabou de criar.',
    hint: 'Use \'cd experimentos\'.',
    xp: 100,
    checkCondition: (vfs) => vfs.getCwd() === '/home/dayhoff/experimentos',
    completionMessage: 'Navegação concluída.',
  },
  {
    id: 'so-6',
    category: 'Sistemas Operacionais',
    title: 'Novo Registro',
    description: 'Crie um arquivo vazio chamado \'notas.txt\' dentro da pasta atual.',
    hint: 'Use \'touch notas.txt\'.',
    xp: 150,
    checkCondition: (vfs) => vfs.getNode('/home/dayhoff/experimentos/notas.txt') !== null,
    completionMessage: 'Arquivo criado!',
  },
  {
    id: 'so-7',
    category: 'Sistemas Operacionais',
    title: 'Voltando para Casa',
    description: 'Retorne ao diretório anterior ou ao seu diretório home (~).',
    hint: 'Use \'cd ..\' ou apenas \'cd\'.',
    xp: 100,
    checkCondition: (vfs) => vfs.getCwd() === '/home/dayhoff',
    completionMessage: 'Bem-vindo de volta.',
  },
  {
    id: 'so-8',
    category: 'Sistemas Operacionais',
    title: 'Cópia de Segurança',
    description: 'Faça uma cópia do arquivo \'Dockerfile\' para \'Dockerfile.bak\'.',
    hint: 'Use \'cp Dockerfile Dockerfile.bak\'.',
    xp: 200,
    checkCondition: (vfs) => vfs.getNode('/home/dayhoff/Dockerfile.bak') !== null,
    completionMessage: 'Backup garantido.',
  },
  {
    id: 'so-9',
    category: 'Sistemas Operacionais',
    title: 'Renomeando',
    description: 'Mude o nome do arquivo \'notas.txt\' (que está em experimentos) para \'projeto.txt\'.',
    hint: 'Use \'mv experimentos/notas.txt experimentos/projeto.txt\'.',
    xp: 200,
    checkCondition: (vfs) => vfs.getNode('/home/dayhoff/experimentos/projeto.txt') !== null && vfs.getNode('/home/dayhoff/experimentos/notas.txt') === null,
    completionMessage: 'Arquivo renomeado.',
  },
  {
    id: 'so-10',
    category: 'Sistemas Operacionais',
    title: 'Limpeza Seletiva',
    description: 'Remova o arquivo de backup \'Dockerfile.bak\'.',
    hint: 'Use \'rm Dockerfile.bak\'.',
    xp: 150,
    checkCondition: (vfs) => vfs.getNode('/home/dayhoff/Dockerfile.bak') === null,
    completionMessage: 'Espaço liberado.',
  },
  {
    id: 'so-11',
    category: 'Sistemas Operacionais',
    title: 'Lendo o Conteúdo',
    description: 'Exiba o conteúdo do arquivo \'environment.yml\' na tela.',
    hint: 'Use \'cat environment.yml\'.',
    xp: 150,
    checkCondition: (_, cmd, line) => cmd === 'cat' && line.includes('environment.yml'),
    completionMessage: 'Leitura concluída.',
  },
  {
    id: 'so-12',
    category: 'Sistemas Operacionais',
    title: 'Primeiras Linhas',
    description: 'Veja apenas o topo (cabeçalho) do arquivo \'environment.yml\'.',
    hint: 'Use \'head environment.yml\'.',
    xp: 150,
    checkCondition: (_, cmd) => cmd === 'head',
    completionMessage: 'Cabeçalho visualizado.',
  },
  {
    id: 'so-13',
    category: 'Sistemas Operacionais',
    title: 'Poder de Root',
    description: 'Tente listar o conteúdo do diretório restrito \'/root\'.',
    hint: 'Use \'sudo ls /root\'.',
    xp: 300,
    checkCondition: (_, cmd, line) => cmd === 'sudo' && line.includes('ls /root'),
    completionMessage: 'Privilégios administrativos utilizados!',
  },
  {
    id: 'so-14',
    category: 'Sistemas Operacionais',
    title: 'Identidade Digital',
    description: 'Verifique qual é o seu nome de usuário atual no sistema.',
    hint: 'Use \'whoami\'.',
    xp: 100,
    checkCondition: (_, cmd) => cmd === 'whoami',
    completionMessage: 'Você é o dayhoff.',
  },
  {
    id: 'so-15',
    category: 'Sistemas Operacionais',
    title: 'Permissão de Execução',
    description: 'Mude as permissões de \'Makefile\' para permitir que seja executado.',
    hint: 'Use \'chmod +x Makefile\'.',
    xp: 250,
    checkCondition: (_, cmd, line) => cmd === 'chmod' && line.includes('+x'),
    completionMessage: 'Agora o arquivo é executável.',
  },
  {
    id: 'so-16',
    category: 'Sistemas Operacionais',
    title: 'Saúde do Disco',
    description: 'Verifique o espaço disponível em disco em um formato legível para humanos.',
    hint: 'Use \'df -h\'.',
    xp: 200,
    checkCondition: (_, cmd, line) => cmd === 'df' && line.includes('-h'),
    completionMessage: 'Relatório de armazenamento obtido.',
  },
  {
    id: 'so-17',
    category: 'Sistemas Operacionais',
    title: 'Uso de Memória',
    description: 'Verifique o consumo de memória RAM do sistema.',
    hint: 'Use \'free -h\' ou \'mem\'.',
    xp: 200,
    checkCondition: (_, cmd) => cmd === 'free' || cmd === 'mem',
    completionMessage: 'Status da memória verificado.',
  },
  {
    id: 'so-18',
    category: 'Sistemas Operacionais',
    title: 'Painel de Controle',
    description: 'Veja os processos em execução no sistema em tempo real.',
    hint: 'Use o comando \'top\'.',
    xp: 250,
    checkCondition: (_, cmd) => cmd === 'top',
    completionMessage: 'Gerenciador de tarefas aberto.',
  },
  {
    id: 'so-19',
    category: 'Sistemas Operacionais',
    title: 'Histórico de Comandos',
    description: 'Reveja os últimos comandos que você digitou nesta sessão.',
    hint: 'Use \'history\'.',
    xp: 100,
    checkCondition: (_, cmd) => cmd === 'history',
    completionMessage: 'Memória do terminal consultada.',
  },
  {
    id: 'so-20',
    category: 'Sistemas Operacionais',
    title: 'Informações do Sistema',
    description: 'Descubra a versão do kernel e arquitetura do sistema.',
    hint: 'Use \'uname -a\'.',
    xp: 200,
    checkCondition: (_, cmd, line) => cmd === 'uname' && line.includes('-a'),
    completionMessage: 'Você conhece o hardware e o kernel agora.',
  },

  // --- MÓDULO 2: MANIPULAÇÃO DE DADOS (Filtros -> Pipelines) ---
  {
    id: 'data-1',
    category: 'Manipulação de Dados',
    title: 'Coleta Web',
    description: 'Faça o download de um arquivo da rede simulada.',
    hint: 'Use \'wget http://labiomics.com/data.zip\'.',
    xp: 200,
    checkCondition: (_, cmd) => cmd === 'wget' || cmd === 'curl',
    completionMessage: 'Dados coletados com sucesso!',
  },
  {
    id: 'data-2',
    category: 'Manipulação de Dados',
    title: 'Compactando Projetos',
    description: 'Empacote a pasta \'experimentos\' em um arquivo chamado \'backup.tar\'.',
    hint: 'Use \'tar -cvf backup.tar experimentos\'.',
    xp: 300,
    checkCondition: (_, cmd, line) => cmd === 'tar' && line.includes('-c'),
    completionMessage: 'Pasta empacotada.',
  },
  {
    id: 'data-3',
    category: 'Manipulação de Dados',
    title: 'Extração de Dados',
    description: 'Extraia o conteúdo do arquivo \'backup.tar\'.',
    hint: 'Use \'tar -xvf backup.tar\'.',
    xp: 300,
    checkCondition: (_, cmd, line) => cmd === 'tar' && line.includes('-x'),
    completionMessage: 'Dados extraídos.',
  },
  {
    id: 'data-4',
    category: 'Manipulação de Dados',
    title: 'Busca de Padrões',
    description: 'Encontre todas as ocorrências da palavra \'bioconda\' no arquivo \'environment.yml\'.',
    hint: 'Use \'grep bioconda environment.yml\'.',
    xp: 250,
    checkCondition: (_, cmd, line) => cmd === 'grep' && line.includes('bioconda'),
    completionMessage: 'Padrão localizado!',
  },
  {
    id: 'data-5',
    category: 'Manipulação de Dados',
    title: 'Contagem de Itens',
    description: 'Conte quantas linhas existem no arquivo \'environment.yml\'.',
    hint: 'Use \'wc -l environment.yml\'.',
    xp: 200,
    checkCondition: (_, cmd, line) => cmd === 'wc' && line.includes('-l'),
    completionMessage: 'Contagem concluída.',
  },
  {
    id: 'data-6',
    category: 'Manipulação de Dados',
    title: 'Mestre dos Pipes',
    description: 'Combine grep e wc para contar quantas vezes a palavra \'samtools\' aparece no arquivo.',
    hint: 'Use \'grep samtools environment.yml | wc -l\'.',
    xp: 400,
    checkCondition: (_, __, line) => line.includes('|') && line.includes('grep') && line.includes('wc'),
    completionMessage: 'Encanamento (Pipes) dominado!',
  },
  {
    id: 'data-7',
    category: 'Manipulação de Dados',
    title: 'Ordenação Alfabética',
    description: 'Ordene as linhas do arquivo \'environment.yml\' alfabeticamente.',
    hint: 'Use \'sort environment.yml\'.',
    xp: 200,
    checkCondition: (_, cmd) => cmd === 'sort',
    completionMessage: 'Tudo em ordem.',
  },
  {
    id: 'data-8',
    category: 'Manipulação de Dados',
    title: 'Removendo Duplicatas',
    description: 'Ordene e remova linhas repetidas de uma lista.',
    hint: 'Use \'sort lista.txt | uniq\'.',
    xp: 300,
    checkCondition: (_, __, line) => line.includes('sort') && line.includes('uniq'),
    completionMessage: 'Lista limpa e única.',
  },
  {
    id: 'data-9',
    category: 'Manipulação de Dados',
    title: 'Substituição de Texto',
    description: 'Troque a palavra \'samtools\' por \'bcftools\' na saída do texto.',
    hint: 'Use \'sed "s/samtools/bcftools/g" environment.yml\'.',
    xp: 350,
    checkCondition: (_, cmd) => cmd === 'sed',
    completionMessage: 'Edição de fluxo concluída.',
  },
  {
    id: 'data-10',
    category: 'Manipulação de Dados',
    title: 'Colunas de Dados',
    description: 'Use awk para imprimir apenas a primeira coluna de um texto.',
    hint: 'Use \'awk "{print $1}" environment.yml\'.',
    xp: 400,
    checkCondition: (_, cmd) => cmd === 'awk',
    completionMessage: 'Manipulação de colunas efetuada.',
  },
  {
    id: 'data-11',
    category: 'Manipulação de Dados',
    title: 'Redirecionamento de Saída',
    description: 'Salve a saída do comando \'ls\' em um arquivo chamado \'arquivos.txt\'.',
    hint: 'Use \'ls > arquivos.txt\'.',
    xp: 250,
    checkCondition: (vfs) => vfs.getNode('/home/dayhoff/arquivos.txt') !== null,
    completionMessage: 'Saída capturada no arquivo.',
  },
  {
    id: 'data-12',
    category: 'Manipulação de Dados',
    title: 'Diferenças de Arquivos',
    description: 'Compare dois arquivos e veja o que mudou entre eles.',
    hint: 'Use \'diff arq1 arq2\'.',
    xp: 250,
    checkCondition: (_, cmd) => cmd === 'diff',
    completionMessage: 'Diferenças detectadas.',
  },
  {
    id: 'data-13',
    category: 'Manipulação de Dados',
    title: 'Busca de Arquivos',
    description: 'Encontre todos os arquivos com extensão \'.yml\' no sistema.',
    hint: 'Use \'find . -name "*.yml"\'.',
    xp: 300,
    checkCondition: (_, cmd) => cmd === 'find',
    completionMessage: 'Localizado!',
  },
  {
    id: 'data-14',
    category: 'Manipulação de Dados',
    title: 'Processamento em Lote',
    description: 'Use xargs para passar a lista de arquivos para outro comando.',
    hint: 'Use \'find . -name "*.txt" | xargs grep "A"\'.',
    xp: 450,
    checkCondition: (_, __, line) => line.includes('xargs'),
    completionMessage: 'Automação avançada com xargs.',
  },
  {
    id: 'data-15',
    category: 'Manipulação de Dados',
    title: 'Build Automatizado',
    description: 'Use o comando make para compilar o projeto simulado.',
    hint: 'Basta digitar \'make\'.',
    xp: 500,
    checkCondition: (_, cmd) => cmd === 'make',
    completionMessage: 'Sistema compilado.',
  },

  // --- MÓDULO 3: COMPUTAÇÃO CIENTÍFICA (HPC & Bioinfo) ---
  {
    id: 'science-1',
    category: 'Computação Científica',
    title: 'Ambiente de Análise',
    description: 'Crie um ambiente virtual chamado \'genomica\' usando mamba.',
    hint: 'Use \'mamba create -n genomica\'.',
    xp: 400,
    checkCondition: () => {
      const envs = JSON.parse(localStorage.getItem('terminal_envs') || '[]');
      return envs.includes('genomica');
    },
    completionMessage: 'Ambiente isolado pronto!',
  },
  {
    id: 'science-2',
    category: 'Computação Científica',
    title: 'Ativando Ferramentas',
    description: 'Ative o ambiente \'genomica\' para usá-lo.',
    hint: 'Use \'conda activate genomica\'.',
    xp: 300,
    checkCondition: () => localStorage.getItem('current_env') === 'genomica',
    completionMessage: 'Você está no ambiente genomica.',
  },
  {
    id: 'science-3',
    category: 'Computação Científica',
    title: 'Instalando Samtools',
    description: 'Instale a ferramenta samtools no ambiente atual.',
    hint: 'Use \'mamba install samtools\'.',
    xp: 400,
    checkCondition: () => {
      const env = localStorage.getItem('current_env') || 'base';
      const pkgs = JSON.parse(localStorage.getItem(`pkgs_${env}`) || '[]');
      return pkgs.includes('samtools');
    },
    completionMessage: 'Software instalado com sucesso.',
  },
  {
    id: 'science-4',
    category: 'Computação Científica',
    title: 'Sequências de DNA',
    description: 'Visualize a frequência de bases em uma sequência curta.',
    hint: 'Use \'bio-count ATGCATGC\'.',
    xp: 300,
    checkCondition: (_, cmd) => cmd === 'bio-count',
    completionMessage: 'Análise de nucleotídeos concluída.',
  },
  {
    id: 'science-5',
    category: 'Computação Científica',
    title: 'Visualizador Genômico',
    description: 'Abra um arquivo FASTA simulado no visualizador colorido.',
    hint: 'Use \'fasta-view genome.fa\'.',
    xp: 300,
    checkCondition: (_, cmd) => cmd === 'fasta-view',
    completionMessage: 'Visualização completa.',
  },
  {
    id: 'science-6',
    category: 'Computação Científica',
    title: 'Qualidade de Reads',
    description: 'Execute o FastQC para checar a qualidade dos dados de sequenciamento.',
    hint: 'Use \'fastqc reads.fq\'.',
    xp: 500,
    checkCondition: (_, cmd) => cmd === 'fastqc',
    completionMessage: 'Relatório de qualidade gerado.',
  },
  {
    id: 'science-7',
    category: 'Computação Científica',
    title: 'Trimming de Leituras',
    description: 'Use o fastp para limpar as leituras de baixa qualidade.',
    hint: 'Use \'fastp -i reads.fq -o clean.fq\'.',
    xp: 500,
    checkCondition: (_, cmd) => cmd === 'fastp',
    completionMessage: 'Reads limpas.',
  },
  {
    id: 'science-8',
    category: 'Computação Científica',
    title: 'Indexação do Genoma',
    description: 'Prepare o índice do genoma de referência usando bwa.',
    hint: 'Use \'bwa index ref.fa\'.',
    xp: 400,
    checkCondition: (_, cmd, line) => cmd === 'bwa' && line.includes('index'),
    completionMessage: 'Genoma indexado.',
  },
  {
    id: 'science-9',
    category: 'Computação Científica',
    title: 'Alinhamento de Reads',
    description: 'Mapeie as reads contra o genoma de referência usando bwa mem.',
    hint: 'Use \'bwa mem ref.fa reads.fq > aln.sam\'.',
    xp: 600,
    checkCondition: (_, cmd, line) => cmd === 'bwa' && line.includes('mem'),
    completionMessage: 'Alinhamento concluído.',
  },
  {
    id: 'science-10',
    category: 'Computação Científica',
    title: 'Ordenação de BAM',
    description: 'Use samtools para ordenar o arquivo de alinhamento.',
    hint: 'Use \'samtools sort aln.bam -o aln.sorted.bam\'.',
    xp: 400,
    checkCondition: (_, cmd, line) => cmd === 'samtools' && line.includes('sort'),
    completionMessage: 'Arquivo BAM ordenado.',
  },
  {
    id: 'science-11',
    category: 'Computação Científica',
    title: 'Chamada de Variantes',
    description: 'Use bcftools para identificar mutações (SNPs).',
    hint: 'Use \'bcftools call -mv aln.bam > var.vcf\'.',
    xp: 700,
    checkCondition: (_, cmd) => cmd === 'bcftools',
    completionMessage: 'Variantes identificadas.',
  },
  {
    id: 'science-12',
    category: 'Computação Científica',
    title: 'Pipeline Snakemake',
    description: 'Simule a execução de um pipeline completo usando Snakemake.',
    hint: 'Use \'snakemake -n\'.',
    xp: 800,
    checkCondition: (_, cmd) => cmd === 'snakemake',
    completionMessage: 'Workflow automatizado!',
  },
  {
    id: 'science-13',
    category: 'Computação Científica',
    title: 'Container Docker',
    description: 'Baixe uma imagem de software pronta do Docker Hub.',
    hint: 'Use \'docker pull bioconda/samtools\'.',
    xp: 500,
    checkCondition: (_, cmd, line) => cmd === 'docker' && line.includes('pull'),
    completionMessage: 'Imagem baixada.',
  },
  {
    id: 'science-14',
    category: 'Computação Científica',
    title: 'HPC com Singularity',
    description: 'Execute um shell dentro de um container Singularity (.sif).',
    hint: 'Use \'singularity shell image.sif\'.',
    xp: 600,
    checkCondition: (_, cmd) => cmd === 'singularity' || cmd === 'apptainer',
    completionMessage: 'Ambiente HPC isolado.',
  },
  {
    id: 'science-15',
    category: 'Computação Científica',
    title: 'Fila do Cluster',
    description: 'Verifique os jobs que estão rodando no cluster HPC.',
    hint: 'Use o comando \'squeue\'.',
    xp: 400,
    checkCondition: (_, cmd) => cmd === 'squeue',
    completionMessage: 'Status do cluster verificado.',
  }
];

export const achievements: Achievement[] = [
  { id: 'admin_badge', name: 'Administrador(a)', description: 'Usou comandos sudo com sucesso', icon: '⚡', condition: (s) => s.sudoCount > 0 },
  { id: 'pipe_badge', name: 'Mestre dos Pipes', description: 'Executou filtros complexos com pipes', icon: '🔗', condition: (s) => s.pipeCount >= 5 },
  { id: 'env_badge', name: 'Cientista de Ambientes', description: 'Gerenciou múltiplos ambientes virtuais', icon: '🧪', condition: (s) => s.envCount >= 2 }
];

export class QuestManager {
  private currentQuestIndex: number = 0;
  private totalXp: number = 0;
  private stats = { sudoCount: 0, pipeCount: 0, envCount: 1 };
  private isResetting = false;

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
    if (this.isResetting) return;
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
  
  public getProgressPercentage(): number {
    return Math.round((this.currentQuestIndex / quests.length) * 100);
  }

  public getCurrentQuest(): Quest | null {
    return this.currentQuestIndex < quests.length ? quests[this.currentQuestIndex] : null;
  }

  public getAchievements(): Achievement[] {
    return achievements.filter(a => a.condition(this.stats));
  }

  public reset() {
    this.isResetting = true;
    this.currentQuestIndex = 0;
    this.totalXp = 0;
    this.stats = { sudoCount: 0, pipeCount: 0, envCount: 1 };
    localStorage.removeItem('quest_manager_state');
    localStorage.removeItem('terminal_envs');
    localStorage.removeItem('current_env');
    localStorage.removeItem('vfs_state');
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

import { VFSManager } from '../vfs/VFSManager';

export interface Quest {
  id: string;
  title: string;
  description: string;
  hint: string;
  checkCondition: (vfs: VFSManager, lastCommand: string) => boolean;
  completionMessage: string;
}

export const quests: Quest[] = [
  {
    id: 'intro-1',
    title: 'Bem-vindo ao Templo',
    description: 'Primeiro, descubra onde você está. Use o comando para imprimir seu diretório de trabalho atual.',
    hint: 'Tente usar \'pwd\'.',
    checkCondition: (_, cmd) => cmd === 'pwd',
    completionMessage: 'Ótimo! Você está em /home/dayhoff. Este é o seu lar.',
  },
  {
    id: 'ls-1',
    title: 'Explorando os Arredores',
    description: 'Liste os arquivos em seu diretório atual para ver o que há ao seu redor.',
    hint: 'Tente usar \'ls\'.',
    checkCondition: (_, cmd) => cmd === 'ls',
    completionMessage: 'Excelente. Você pode ver seus arquivos agora.',
  },
  {
    id: 'mkdir-1',
    title: 'Criando Espaço',
    description: 'Crie um novo diretório chamado \'pratica\'.',
    hint: 'Tente \'mkdir pratica\'.',
    checkCondition: (vfs, cmd) => {
      const node = vfs.getNode('/home/dayhoff/pratica');
      return cmd === 'mkdir' && !!node && node.type === 'directory';
    },
    completionMessage: 'Muito bem! Você criou seu primeiro diretório.',
  },
  {
    id: 'cd-1',
    title: 'Entrando na Pasta',
    description: 'Mude seu diretório atual para a pasta \'pratica\' que você acabou de criar.',
    hint: 'Tente \'cd pratica\'.',
    checkCondition: (vfs, cmd) => cmd === 'cd' && vfs.getCwd() === '/home/dayhoff/pratica',
    completionMessage: 'Você está se movendo como um profissional!',
  },
  {
    id: 'echo-1',
    title: 'Escrevendo a História',
    description: 'Crie um arquivo chamado \'nota.txt\' contendo o texto \'Ola Linux\'.',
    hint: 'Tente \'echo Ola Linux > nota.txt\'.',
    checkCondition: (vfs, cmd) => {
      const content = vfs.readFile('/home/dayhoff/pratica/nota.txt');
      return cmd === 'echo' && content?.trim() === 'Ola Linux';
    },
    completionMessage: 'Você acabou de escrever seu primeiro arquivo!',
  }
];

export class QuestManager {
  private currentQuestIndex: number = 0;
  private completedQuests: Set<string> = new Set();

  constructor(initialIndex: number = 0) {
    this.currentQuestIndex = initialIndex;
  }

  public getCurrentIndex(): number {
    return this.currentQuestIndex;
  }

  public getCurrentQuest(): Quest | null {
    if (this.currentQuestIndex < quests.length) {
      return quests[this.currentQuestIndex];
    }
    return null;
  }

  public checkProgress(vfs: VFSManager, lastCommand: string): Quest | null {
    const current = this.getCurrentQuest();
    if (current && current.checkCondition(vfs, lastCommand)) {
      this.completedQuests.add(current.id);
      this.currentQuestIndex++;
      return current;
    }
    return null;
  }

  public getProgress(): string {
    return `${this.currentQuestIndex}/${quests.length}`;
  }
}

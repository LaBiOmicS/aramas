import { Terminal } from '@xterm/xterm';
import { VFSManager } from '../vfs/VFSManager';
import { CommandRegistry } from '../commands/registry';
import type { CommandContext } from '../commands/types';
import { QuestManager } from './QuestManager';

export type PromptStyle = 'bash' | 'zsh' | 'minimal';

export class TerminalEngine {
  private vfs: VFSManager;
  private registry: CommandRegistry;
  private questManager: QuestManager;
  private terminal: Terminal;
  private currentLine: string = '';
  private history: string[] = [];
  private historyIndex: number = -1;
  private onStateChange?: () => void;
  private promptStyle: PromptStyle = 'bash';

  constructor(terminal: Terminal, onStateChange?: () => void) {
    this.terminal = terminal;
    this.onStateChange = onStateChange;
    
    // Carregar do localStorage
    const savedVFS = localStorage.getItem('vfs_state');
    this.vfs = new VFSManager(savedVFS ? JSON.parse(savedVFS) : undefined);
    
    this.registry = new CommandRegistry();
    
    const savedQuestIndex = localStorage.getItem('quest_index');
    this.questManager = new QuestManager(savedQuestIndex ? parseInt(savedQuestIndex) : 0);

    const savedStyle = localStorage.getItem('prompt_style') as PromptStyle;
    if (savedStyle) this.promptStyle = savedStyle;
    
    this.terminal.onData(e => this.handleData(e));
    
    // Mensagem de Boas-vindas (MOTD)
    this.terminal.write('\x1b[1;34m#################################################################\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#                                                               #\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[1;33mBEM-VINDO AO TERMINAL LABIOMICS - APRENDIZADO DE LINUX\x1b[1;34m       #\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#                                                               #\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0mEste ambiente é um simulador gamificado para ensinar os      \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0mfundamentos do terminal Linux (Bash).                        \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#                                                               #\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[1;32mOBJETIVOS:\x1b[0m                                                   \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0m- Dominar comandos básicos e avançados                       \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0m- Compreender a hierarquia de arquivos                       \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0m- Praticar em um ambiente seguro e interativo                \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#                                                               #\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0mDigite \x1b[1;36mmissao\x1b[0m para ver seu objetivo atual.                  \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#  \x1b[0mDigite \x1b[1;36majuda\x1b[0m para listar os comandos disponíveis.            \x1b[1;34m#\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#                                                               #\x1b[0m\r\n');
    this.terminal.write('\x1b[1;34m#################################################################\x1b[0m\r\n');
    
    this.printPrompt();
  }

  public getVFS(): VFSManager {
    return this.vfs;
  }

  public getQuestManager(): QuestManager {
    return this.questManager;
  }

  public getPromptStyle(): PromptStyle {
    return this.promptStyle;
  }

  public setPromptStyle(style: PromptStyle) {
    this.promptStyle = style;
    this.saveState();
  }

  private printPrompt() {
    const cwd = this.vfs.getCwd();
    const shortCwd = cwd.replace('/home/dayhoff', '~');
    
    switch (this.promptStyle) {
      case 'zsh':
        this.terminal.write(`\r\n\x1b[1;36m➜  \x1b[1;32m${shortCwd}\x1b[0m \x1b[1;34mgit:(\x1b[1;31mmain\x1b[1;34m)\x1b[0m `);
        break;
      case 'minimal':
        this.terminal.write(`\r\n\x1b[1;32m${shortCwd} $\x1b[0m `);
        break;
      case 'bash':
      default:
        this.terminal.write(`\r\n\x1b[1;32mdayhoff@LaBiOmicS\x1b[0m:\x1b[1;34m${shortCwd}\x1b[0m$ `);
        break;
    }
  }

  private async handleData(data: string) {
    switch (data) {
      case '\r': // Enter
        await this.handleEnter();
        break;
      case '\u007F': // Backspace
        this.handleBackspace();
        break;
      case '\u001b[A': // Up arrow
        this.handleHistory(-1);
        break;
      case '\u001b[B': // Down arrow
        this.handleHistory(1);
        break;
      default:
        if (data >= ' ' && data <= '~') {
          this.currentLine += data;
          this.terminal.write(data);
        }
    }
  }

  private saveState() {
    localStorage.setItem('vfs_state', JSON.stringify(this.vfs.getState()));
    localStorage.setItem('quest_index', this.questManager.getCurrentIndex().toString());
    localStorage.setItem('prompt_style', this.promptStyle);
    if (this.onStateChange) this.onStateChange();
  }

  private async handleEnter() {
    const line = this.currentLine.trim();
    this.terminal.write('\r\n');
    
    let lastCmd = '';
    if (line) {
      this.history.push(line);
      this.historyIndex = this.history.length;
      lastCmd = line.split(/\s+/)[0];
      await this.executeCommand(line);
    }
    
    // Verificar progresso da missão após cada comando
    const completed = this.questManager.checkProgress(this.vfs, lastCmd);
    if (completed) {
      this.terminal.write(`\r\n\x1b[1;32m✅ MISSÃO CONCLUÍDA: ${completed.title}\x1b[0m\r\n`);
      this.terminal.write(`${completed.completionMessage}\r\n`);
      
      const next = this.questManager.getCurrentQuest();
      if (next) {
        this.terminal.write(`\r\n\x1b[1;33m🚀 PRÓXIMA MISSÃO: ${next.title}\x1b[0m\r\n`);
        this.terminal.write(`${next.description}\r\n`);
      } else {
        this.terminal.write(`\r\n\x1b[1;35m🏆 PARABÉNS! Você completou todas as missões!\x1b[0m\r\n`);
      }
    }
    
    this.saveState();
    this.currentLine = '';
    this.printPrompt();
  }

  private handleBackspace() {
    if (this.currentLine.length > 0) {
      this.currentLine = this.currentLine.slice(0, -1);
      this.terminal.write('\b \b');
    }
  }

  private handleHistory(dir: number) {
    const newIndex = this.historyIndex + dir;
    if (newIndex >= 0 && newIndex < this.history.length) {
      // Clear current line
      for (let i = 0; i < this.currentLine.length; i++) {
        this.terminal.write('\b \b');
      }
      this.historyIndex = newIndex;
      this.currentLine = this.history[this.historyIndex];
      this.terminal.write(this.currentLine);
    }
  }

  private async executeCommand(line: string) {
    const parts = line.split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);

    if (cmdName === 'missao' || cmdName === 'quest') {
      const q = this.questManager.getCurrentQuest();
      if (q) {
        this.terminal.write(`\x1b[1;33m🎯 MISSÃO ATUAL: ${q.title}\x1b[0m\r\n`);
        this.terminal.write(`${q.description}\r\n`);
        this.terminal.write(`\x1b[1;30mDica: ${q.hint}\x1b[0m\r\n`);
      } else {
        this.terminal.write('Nenhuma missão ativa no momento.\r\n');
      }
      return;
    }

    if (cmdName === 'tema') {
      const style = args[0] as PromptStyle;
      const validStyles: PromptStyle[] = ['bash', 'zsh', 'minimal'];
      if (!style || !validStyles.includes(style)) {
        this.terminal.write('Uso: tema [bash | zsh | minimal]\r\n');
      } else {
        this.setPromptStyle(style);
        this.terminal.write(`Estilo alterado para '${style}'.\r\n`);
      }
      return;
    }

    const command = this.registry.getCommand(cmdName);
    if (command) {
      const context: CommandContext = {
        vfs: this.vfs,
        args,
        print: (text) => this.terminal.write(text.replace(/\n/g, '\r\n') + '\r\n'),
        printError: (text) => this.terminal.write(`\x1b[31mErro: ${text}\x1b[0m\r\n`),
        clear: () => this.terminal.clear(),
      };
      try {
        await command.execute(context);
      } catch (err) {
        this.terminal.write(`\x1b[31mErro ao executar comando: ${err}\x1b[0m\r\n`);
      }
    } else {
      this.terminal.write(`zsh: comando não encontrado: ${cmdName}\r\n`);
    }
  }
}

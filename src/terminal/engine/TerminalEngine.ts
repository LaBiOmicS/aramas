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

  private currentUser: string = 'dayhoff';
  private currentEnv: string = '';

  constructor(terminal: Terminal, onStateChange?: () => void) {
    this.terminal = terminal;
    this.onStateChange = onStateChange;
    
    // Carregar do localStorage
    const savedVFS = localStorage.getItem('vfs_state');
    this.vfs = new VFSManager(savedVFS ? JSON.parse(savedVFS) : undefined);
    
    this.registry = new CommandRegistry();

    this.questManager = new QuestManager();

    const savedStyle = localStorage.getItem('prompt_style') as PromptStyle;
    if (savedStyle) this.promptStyle = savedStyle;

    const savedUser = localStorage.getItem('current_user');
    if (savedUser) this.currentUser = savedUser;

    const savedEnv = localStorage.getItem('current_env');
    if (savedEnv) this.currentEnv = savedEnv;
    
    this.terminal.onData(e => this.handleData(e));
    
    // Mensagem de Boas-vindas (MOTD) dinâmica para garantir alinhamento perfeito
    const totalWidth = 65;
    const formatLine = (text: string, colorCode: string = '0') => {
      const internalWidth = totalWidth - 4; // Desconta '# ' e ' #'
      const padding = ' '.repeat(Math.max(0, internalWidth - text.length));
      return `# \x1b[${colorCode}m${text}\x1b[0m${padding} #`;
    };

    const banner = [
      '#'.repeat(totalWidth),
      '# ' + ' '.repeat(totalWidth - 4) + ' #',
      formatLine('ARAMAS v1.0.0', '1;33'),
      formatLine('Ambiente Remoto para o Aprendizado e Manipulação', '1'),
      formatLine('de Arquivos e Sistemas', '1'),
      '# ' + ' '.repeat(totalWidth - 4) + ' #',
      formatLine('Desenvolvido por: LaBiOmicS - UMC', '1;32'),
      formatLine('Terminal Educacional de Linux e Bioinformática', '1;32'),
      '# ' + ' '.repeat(totalWidth - 4) + ' #',
      formatLine("Digite 'ajuda' para começar a explorar.", '1;36'),
      formatLine("Digite 'missao' para ver seus objetivos.", '1;36'),
      '# ' + ' '.repeat(totalWidth - 4) + ' #',
      '#'.repeat(totalWidth)
    ];
    
    this.terminal.write('\x1b[1;34m');
    banner.forEach(line => this.terminal.write(line + '\r\n'));
    this.terminal.write('\x1b[0m');
    
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
    const user = this.currentUser;
    const envPrefix = this.currentEnv ? `(${this.currentEnv}) ` : '';
    const symbol = user === 'root' ? '#' : '$';
    
    switch (this.promptStyle) {
      case 'zsh':
        this.terminal.write(`\r\n\x1b[1;36m➜  ${envPrefix}\x1b[1;32m${shortCwd}\x1b[0m \x1b[1;34mgit:(\x1b[1;31mmain\x1b[1;34m)\x1b[0m `);
        break;
      case 'minimal':
        this.terminal.write(`\r\n\x1b[1;32m${envPrefix}${shortCwd} ${symbol}\x1b[0m `);
        break;
      case 'bash':
      default: {
        const userColor = user === 'root' ? '\x1b[1;31m' : '\x1b[1;32m';
        this.terminal.write(`\r\n${envPrefix}${userColor}${user}@LaBiOmicS\x1b[0m:\x1b[1;34m${shortCwd}\x1b[0m${symbol} `);
        break;
      }
    }
    this.terminal.scrollToBottom();
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
    localStorage.setItem('prompt_style', this.promptStyle);
    localStorage.setItem('current_user', this.currentUser);
    localStorage.setItem('current_env', this.currentEnv);
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
    const result = this.questManager.checkProgress(this.vfs, lastCmd, line);
    if (result) {
      const { quest, rankUp } = result;
      this.terminal.write(`\r\n\x1b[1;32m✅ MISSÃO CONCLUÍDA: ${quest.title} (+${quest.xp} XP)\x1b[0m\r\n`);
      this.terminal.write(`${quest.completionMessage}\r\n`);
      
      if (rankUp) {
        const newRank = this.questManager.getRank();
        this.terminal.write(`\r\n\x1b[1;33m🎊 PARABÉNS! Você foi promovido(a) a: ${newRank.name}!\x1b[0m\r\n`);
      }

      const next = this.questManager.getCurrentQuest();
      if (next) {
        this.terminal.write(`\r\n\x1b[1;34m🚀 PRÓXIMA MISSÃO [${next.category}]: ${next.title}\x1b[0m\r\n`);
        this.terminal.write(`${next.description}\r\n`);
      } else {
        this.terminal.write(`\r\n\x1b[1;35m🏆 PARABÉNS! Você atingiu o ápice da carreira em Bioinformática!\x1b[0m\r\n`);
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
    let effectiveUser = this.currentUser;
    let commandLine = line;

    if (line.startsWith('sudo ')) {
      effectiveUser = 'root';
      commandLine = line.substring(5);
      this.terminal.write('[sudo] senha para dayhoff: *******\r\n');
    }

    // Suporte básico a Pipes
    if (commandLine.includes('|')) {
      const commands = commandLine.split('|').map(c => c.trim());
      let pipeData = '';

      for (let i = 0; i < commands.length; i++) {
        const parts = commands[i].split(/\s+/);
        const cmdName = parts[0];
        const args = [...parts.slice(1)];
        
        if (pipeData) {
          args.push(pipeData);
        }

        const command = this.registry.getCommand(cmdName);
        if (command) {
          let output = '';
          const context: CommandContext = {
            vfs: this.vfs,
            args,
            user: effectiveUser,
            setEnv: (name) => { this.currentEnv = name; },
            print: (text) => {
              output += text + '\n';
              if (i === commands.length - 1) {
                this.terminal.write(text.replace(/\n/g, '\r\n') + '\r\n');
              }
            },
            printError: (text) => this.terminal.write(`\x1b[31mErro: ${text}\x1b[0m\r\n`),
            clear: () => this.terminal.clear(),
          };
          await command.execute(context);
          pipeData = output.trim();
        } else {
          this.terminal.write(`zsh: comando não encontrado: ${cmdName}\r\n`);
          break;
        }
      }
      return;
    }

    const parts = commandLine.split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);

    if (cmdName === 'missao' || cmdName === 'quest') {
      if (args.includes('-h') || args.includes('--help')) {
        this.terminal.write(`\x1b[1;32mAJUDA: missao\x1b[0m\r\n`);
        this.terminal.write(`Mostra o objetivo atual da sua jornada de aprendizado.\r\n`);
        this.terminal.write(`\r\n\x1b[1;33mUSO:\x1b[0m\r\nmissao\r\n`);
        return;
      }
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
      if (args.includes('-h') || args.includes('--help')) {
        this.terminal.write(`\x1b[1;32mAJUDA: tema\x1b[0m\r\n`);
        this.terminal.write(`Muda o estilo visual do prompt do terminal.\r\n`);
        this.terminal.write(`\r\n\x1b[1;33mUSO:\x1b[0m\r\ntema [bash | zsh | minimal]\r\n`);
        return;
      }
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
      if (args.includes('-h') || args.includes('--help')) {
        this.terminal.write(`\x1b[1;32mAJUDA: ${command.name}\x1b[0m\r\n`);
        this.terminal.write(`${command.description}\r\n`);
        if (command.help) {
          this.terminal.write(`\r\n\x1b[1;33mUSO:\x1b[0m\r\n${command.help.replace(/\n/g, '\r\n')}\r\n`);
        } else {
          this.terminal.write(`\r\nUso: ${command.name} [argumentos]\r\n`);
        }
        return;
      }

      const context: CommandContext = {
        vfs: this.vfs,
        args,
        user: effectiveUser,
        setEnv: (name) => { this.currentEnv = name; },
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

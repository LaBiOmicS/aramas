import type { Command } from './types';
import { basicCommands } from './basicCommands';
import { focaCommands } from './focaCommands';
import { bioCommands } from './bioCommands';
import { extendedCommands } from './extendedCommands';
import { packageManagerCommands } from './packageManagerCommands';

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  constructor() {
    [...basicCommands, ...focaCommands, ...bioCommands, ...extendedCommands, ...packageManagerCommands].forEach(cmd => {
      this.commands.set(cmd.name, cmd);
    });

    // Adicionar comando ajuda
    const helpCommand: Command = {
      name: 'ajuda',
      description: 'Exibe informações sobre os comandos disponíveis',
      execute: async (ctx) => {
        ctx.print('\x1b[1;32mComandos disponíveis:\x1b[0m');
        const commands = Array.from(this.commands.values());
        const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name));
        
        for (const cmd of sortedCommands) {
          const name = cmd.name.padEnd(10);
          ctx.print(`  \x1b[1;36m${name}\x1b[0m - ${cmd.description}`);
        }
        
        ctx.print('\n\x1b[1;33mDicas de Uso:\x1b[0m');
        ctx.print('  \x1b[1;36mls -la\x1b[0m      - Lista tudo (incluindo ocultos) com detalhes');
        ctx.print('  \x1b[1;36mgrep -i "A"\x1b[0m  - Busca ignorando maiúsculas/minúsculas');
        ctx.print('  \x1b[1;36mdf -h\x1b[0m       - Mostra espaço em disco em formato legível');
        ctx.print('  \x1b[1;36mhead -n 5\x1b[0m   - Mostra as primeiras 5 linhas');
        ctx.print('  \x1b[1;36mhistory\x1b[0m     - Veja seus últimos comandos');
        ctx.print('  \x1b[1;36mmissao\x1b[0m      - Mostra o que você deve fazer agora');
      }
    };
    this.commands.set('ajuda', helpCommand);
    this.commands.set('help', helpCommand);

    // O comando 'tema' e 'missao' são tratados no TerminalEngine.ts
    // mas vamos registrar aqui para aparecerem no 'ajuda'
    this.commands.set('tema', { name: 'tema', description: 'Muda o estilo visual do terminal', execute: async () => {} });
    this.commands.set('missao', { name: 'missao', description: 'Mostra o objetivo atual', execute: async () => {} });
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}

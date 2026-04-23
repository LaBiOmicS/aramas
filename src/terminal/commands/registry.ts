import type { Command } from './types';
import { basicCommands } from './basicCommands';
import { focaCommands } from './focaCommands';
import { bioCommands } from './bioCommands';
import { extendedCommands } from './extendedCommands';

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  constructor() {
    [...basicCommands, ...focaCommands, ...bioCommands, ...extendedCommands].forEach(cmd => {
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
        
        ctx.print('\n\x1b[1;33mDicas:\x1b[0m');
        ctx.print('  \x1b[1;36mmissao\x1b[0m     - Mostra o que você deve fazer agora');
        ctx.print('  \x1b[1;36mtema\x1b[0m       - Muda o visual (bash, zsh, minimal)');
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

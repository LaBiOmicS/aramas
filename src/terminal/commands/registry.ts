import type { Command } from './types';
import { basicCommands } from './basicCommands';
import { focaCommands } from './focaCommands';
import { bioCommands } from './bioCommands';
import { extendedCommands } from './extendedCommands';
import { packageManagerCommands } from './packageManagerCommands';
import { funCommands } from './funCommands';

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  constructor() {
    [
      ...basicCommands, 
      ...focaCommands, 
      ...bioCommands, 
      ...extendedCommands, 
      ...packageManagerCommands,
      ...funCommands
    ].forEach(cmd => {
      this.commands.set(cmd.name, cmd);
    });

    // Adicionar comando ajuda
    const helpCommand: Command = {
      name: 'ajuda',
      description: 'Exibe informações sobre os comandos disponíveis',
      help: 'ajuda\n\nLista todos os comandos registrados e exibe informações sobre o ARAMAS.',
      execute: async (ctx) => {
        const uniqueCommands = new Map<string, Command>();
        this.commands.forEach((cmd) => {
          if (!uniqueCommands.has(cmd.name)) {
            uniqueCommands.set(cmd.name, cmd);
          }
        });

        const sortedCommands = Array.from(uniqueCommands.values()).sort((a, b) => a.name.localeCompare(b.name));
        
        ctx.print(`\x1b[1;32m=== ARAMAS - Ambiente Remoto para o Aprendizado e Manipulação de Arquivos e Sistemas ===\x1b[0m`);
        ctx.print(`\x1b[1mRecurso Pedagógico para o ensino de Linux e Bioinformática\x1b[0m`);
        ctx.print(`Desenvolvido por: \x1b[1;36mLaBiOmicS - Laboratório de Bioinformática e Ciências Ômicas\x1b[0m`);
        ctx.print(`Instituição: \x1b[1;36mUniversidade de Mogi das Cruzes (UMC)\x1b[0m`);
        ctx.print(`Licença: \x1b[1;33mMIT\x1b[0m`);
        ctx.print(`\nTotal de comandos disponíveis: \x1b[1;36m${sortedCommands.length}\x1b[0m`);
        ctx.print(`\nDigite \x1b[1;33mcomando --help\x1b[0m para detalhes de uso.\n`);

        for (const cmd of sortedCommands) {
          const name = cmd.name.padEnd(15);
          ctx.print(`  \x1b[1;36m${name}\x1b[0m - ${cmd.description}`);
        }
        
        ctx.print('\n\x1b[1;33mDicas Rápidas:\x1b[0m');
        ctx.print('  \x1b[1;36mmissao\x1b[0m      - Ver o objetivo educacional atual');
        ctx.print('  \x1b[1;36mcmatrix\x1b[0m     - Sair do sistema (virtualmente)');
        ctx.print('  \x1b[1;36mclear\x1b[0m       - Limpar a tela');
      }
    };
    this.commands.set('ajuda', helpCommand);
    this.commands.set('help', helpCommand);

    // Comandos internos tratados no TerminalEngine.ts
    this.commands.set('tema', { name: 'tema', description: 'Muda o estilo visual do terminal', execute: async () => {} });
    this.commands.set('missao', { name: 'missao', description: 'Mostra o objetivo atual', execute: async () => {} });
    this.commands.set('quest', { name: 'missao', description: 'Mostra o objetivo atual', execute: async () => {} });
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }
}

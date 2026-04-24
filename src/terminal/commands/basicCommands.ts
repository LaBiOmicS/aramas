import type { Command } from './types';

export const basicCommands: Command[] = [
  {
    name: 'pwd',
    description: 'Imprime o nome do diretório atual',
    help: 'pwd\n\nImprime o caminho absoluto do diretório de trabalho atual.',
    execute: async (ctx) => {
      ctx.print(ctx.vfs.getCwd());
    }
  },
  {
    name: 'ls',
    description: 'Lista o conteúdo do diretório',
    help: 'ls [OPÇÃO]... [DIRETÓRIO]...\n\nLista informações sobre os arquivos.\n\nOpções:\n  -a, --all    exibe arquivos ocultos\n  -l           formato de listagem longa\n  -h, --human  tamanhos em formato legível\n  -R           recursivo\n  -t           ordena por tempo de modificação',
    execute: async (ctx) => {
      const showHidden = ctx.args.some(a => (a.includes('a') || a === '--all') && a.startsWith('-'));
      const longFormat = ctx.args.some(a => a.includes('l') && a.startsWith('-'));
      const pathArg = ctx.args.find(a => !a.startsWith('-')) || ctx.vfs.getCwd();
      
      const childrenNames = ctx.vfs.listDirectory(pathArg, ctx.user);
      if (childrenNames) {
        const filtered = showHidden ? ['.', '..', ...childrenNames] : childrenNames.filter(n => !n.startsWith('.'));
        
        if (longFormat) {
          ctx.print('total ' + filtered.length * 4);
          for (const name of filtered) {
            let node;
            if (name === '.') node = ctx.vfs.getNode(pathArg);
            else if (name === '..') node = ctx.vfs.getNode(ctx.vfs.resolvePath(pathArg + '/..'));
            else node = ctx.vfs.getNode(ctx.vfs.resolvePath(pathArg + '/' + name));

            if (node) {
              const type = node.type === 'directory' ? 'd' : '-';
              const date = new Date(node.modifiedAt).toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
              const color = node.type === 'directory' ? '\x1b[1;34m' : '';
              const reset = color ? '\x1b[0m' : '';
              ctx.print(`${type}${node.permissions} 1 ${node.owner} ${node.group} 4096 ${date} ${color}${name}${reset}`);
            }
          }
        } else {
          const coloredNames = filtered.map(name => {
            let node;
            if (name === '.') node = ctx.vfs.getNode(pathArg);
            else if (name === '..') node = ctx.vfs.getNode(ctx.vfs.resolvePath(pathArg + '/..'));
            else node = ctx.vfs.getNode(ctx.vfs.resolvePath(pathArg + '/' + name));

            if (node && node.type === 'directory') {
              return `\x1b[1;34m${name}\x1b[0m`;
            }
            return name;
          });
          ctx.print(coloredNames.join('  '));
        }
      } else {
        ctx.printError(`ls: não foi possível acessar '${pathArg}': Permissão negada ou Diretório não encontrado`);
      }
    }
  },
  {
    name: 'cd',
    description: 'Muda o diretório de trabalho',
    help: 'cd [DIRETÓRIO]\n\nMuda o diretório atual para DIRETÓRIO. Se nenhum diretório for especificado, muda para o diretório home do usuário.',
    execute: async (ctx) => {
      const path = ctx.args[0] || '/home/dayhoff';
      if (!ctx.vfs.setCwd(path, ctx.user)) {
        ctx.printError(`cd: ${path}: Permissão negada ou Arquivo ou diretório não encontrado`);
      }
    }
  },
  {
    name: 'cat',
    description: 'Concatena arquivos e imprime na saída padrão',
    help: 'cat [ARQUIVO]...\n\nLê o conteúdo de ARQUIVO(s) e o exibe no terminal.',
    execute: async (ctx) => {
      if (ctx.args.length === 0) {
        ctx.printError('cat: operando de arquivo ausente');
        return;
      }
      for (const path of ctx.args) {
        const content = ctx.vfs.readFile(path, ctx.user);
        if (content !== null && content !== 'Permissão negada') {
          ctx.print(content);
        } else {
          ctx.printError(`cat: ${path}: Permissão negada ou Arquivo ou diretório não encontrado`);
        }
      }
    }
  },
  {
    name: 'mkdir',
    description: 'Cria diretórios',
    help: 'mkdir [OPÇÃO]... DIRETÓRIO...\n\nCria o(s) DIRETÓRIO(s), se ainda não existirem.\n\nOpções:\n  -p, --parents     cria diretórios pais, se necessário\n  -v, --verbose     exibe mensagem para cada diretório criado',
    execute: async (ctx) => {
      const createParents = ctx.args.includes('-p') || ctx.args.includes('--parents');
      const verbose = ctx.args.includes('-v') || ctx.args.includes('--verbose');
      const paths = ctx.args.filter(a => !a.startsWith('-'));
      
      if (paths.length === 0) {
        ctx.printError('mkdir: operando ausente');
        return;
      }
      
      for (const path of paths) {
        if (createParents) {
          const absolutePath = ctx.vfs.resolvePath(path);
          const parts = absolutePath.split('/').filter(Boolean);
          let current = '';
          for (const part of parts) {
            current += '/' + part;
            if (!ctx.vfs.getNode(current)) {
              ctx.vfs.mkdir(current, ctx.user);
              if (verbose) ctx.print(`mkdir: diretório criado '${current}'`);
            }
          }
        } else {
          if (ctx.vfs.mkdir(path, ctx.user)) {
            if (verbose) ctx.print(`mkdir: diretório criado '${path}'`);
          } else {
            ctx.printError(`mkdir: não foi possível criar o diretório '${path}': Permissão negada ou arquivo já existe`);
          }
        }
      }
    }
  },
  {
    name: 'rm',
    description: 'Remove arquivos ou diretórios',
    help: 'rm [OPÇÃO]... ARQUIVO...\n\nRemove (apaga) o(s) ARQUIVO(s).\n\nOpções:\n  -r, -R, --recursive   remove diretórios e seus conteúdos recursivamente\n  -f, --force           ignora arquivos inexistentes e nunca pergunta\n  -v, --verbose         explica o que está sendo feito',
    execute: async (ctx) => {
      let recursive = false;
      let force = false;
      let verbose = false;
      const paths: string[] = [];

      for (const arg of ctx.args) {
        if (arg.startsWith('-')) {
          if (arg.includes('r') || arg.includes('R')) recursive = true;
          if (arg.includes('f')) force = true;
          if (arg.includes('v')) verbose = true;
        } else {
          paths.push(arg);
        }
      }

      if (paths.length === 0) {
        if (!force) ctx.printError('rm: operando ausente');
        return;
      }

      for (const path of paths) {
        const node = ctx.vfs.getNode(path);
        
        if (!node) {
          if (!force) ctx.printError(`rm: não foi possível remover '${path}': Arquivo ou diretório inexistente`);
          continue;
        }

        if (node.type === 'directory' && !recursive) {
          ctx.printError(`rm: não foi possível remover '${path}': É um diretório`);
          continue;
        }

        if (ctx.vfs.rm(path, ctx.user, recursive)) {
          if (verbose) ctx.print(`removido '${path}'`);
        } else {
          if (!force) ctx.printError(`rm: não foi possível remover '${path}': Permissão negada`);
        }
      }
    }
  },
  {
    name: 'echo',
    description: 'Exibe uma linha de texto',
    help: 'echo [STRING]... [>|>> ARQUIVO]\n\nExibe a STRING na saída padrão ou a redireciona para um ARQUIVO.\n\nRedirecionamento:\n  >   sobrescreve o conteúdo do arquivo\n  >>  anexa ao final do arquivo',
    execute: async (ctx) => {
      const redirectIndex = ctx.args.indexOf('>');
      const appendIndex = ctx.args.indexOf('>>');
      
      if (redirectIndex !== -1 || appendIndex !== -1) {
        const isAppend = appendIndex !== -1;
        const index = isAppend ? appendIndex : redirectIndex;
        const content = ctx.args.slice(0, index).join(' ');
        const target = ctx.args[index + 1];
        
        if (!target) {
          ctx.printError('zsh: erro de sintaxe próximo ao token inesperado `newline\'');
          return;
        }
        
        if (!ctx.vfs.writeFile(target, content, ctx.user, isAppend)) {
          ctx.printError(`zsh: ${target}: Permissão negada ou Diretório não encontrado`);
        }
      } else {
        ctx.print(ctx.args.join(' '));
      }
    }
  },
  {
    name: 'clear',
    description: 'Limpa a tela do terminal',
    help: 'clear\n\nLimpa todo o conteúdo visível no terminal.',
    execute: async (ctx) => {
      ctx.clear();
    }
  },
  {
    name: 'whoami',
    description: 'Imprime o nome do usuário atual',
    help: 'whoami\n\nExibe o nome do usuário efetivo associado à sessão atual.',
    execute: async (ctx) => {
      ctx.print(ctx.user);
    }
  },
  {
    name: 'date',
    description: 'Exibe a data e hora do sistema',
    help: 'date\n\nExibe a data e hora atual do sistema no formato local.',
    execute: async (ctx) => {
      ctx.print(new Date().toLocaleString('pt-BR'));
    }
  },
  {
    name: 'cp',
    description: 'Copia arquivos e diretórios',
    help: 'cp ORIGEM DESTINO\n\nCopia o arquivo ORIGEM para o arquivo ou diretório DESTINO.',
    execute: async (ctx) => {
      if (ctx.args.length < 2) {
        ctx.printError('cp: operando de arquivo ausente');
        return;
      }
      const source = ctx.args[0];
      const dest = ctx.args[1];
      const content = ctx.vfs.readFile(source, ctx.user);
      if (content !== null && content !== 'Permissão negada') {
        if (!ctx.vfs.writeFile(dest, content, ctx.user)) {
          ctx.printError(`cp: não foi possível criar o arquivo '${dest}': Permissão negada`);
        }
      } else {
        ctx.printError(`cp: não foi possível obter estado de '${source}': Permissão negada ou Arquivo não encontrado`);
      }
    }
  },
  {
    name: 'touch',
    description: 'Cria um arquivo vazio ou atualiza a data de acesso e modificação',
    help: 'touch ARQUIVO...\n\nCria um ARQUIVO vazio se ele não existir, ou atualiza o timestamp se existir.',
    execute: async (ctx) => {
      if (ctx.args.length === 0) {
        ctx.printError('touch: operando de arquivo ausente');
        return;
      }
      for (const path of ctx.args) {
        const content = ctx.vfs.readFile(path, ctx.user);
        if (content === null) {
          ctx.vfs.writeFile(path, '', ctx.user);
        } else if (content !== 'Permissão negada') {
          ctx.vfs.writeFile(path, content, ctx.user);
        } else {
          ctx.printError(`touch: ${path}: Permissão negada`);
        }
      }
    }
  },
  {
    name: 'mv',
    description: 'Move (renomeia) arquivos',
    help: 'mv ORIGEM DESTINO\n\nRenomeia ORIGEM para DESTINO, ou move ORIGEM para o diretório DESTINO.',
    execute: async (ctx) => {
      if (ctx.args.length < 2) {
        ctx.printError('mv: operando de arquivo ausente');
        return;
      }
      const source = ctx.args[0];
      const dest = ctx.args[1];
      const content = ctx.vfs.readFile(source, ctx.user);
      if (content !== null && content !== 'Permissão negada') {
        if (ctx.vfs.writeFile(dest, content, ctx.user)) {
          ctx.vfs.rm(source, ctx.user);
        } else {
          ctx.printError(`mv: não foi possível mover '${source}' para '${dest}': Permissão negada`);
        }
      } else {
        ctx.printError(`mv: não foi possível obter estado de '${source}': Permissão negada ou Arquivo não encontrado`);
      }
    }
  }
];

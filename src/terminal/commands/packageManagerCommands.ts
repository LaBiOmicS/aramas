import type { Command } from './types';

// Helper para gerenciar ambientes persistentes
const getEnvs = () => JSON.parse(localStorage.getItem('terminal_envs') || '["base"]');
const addEnv = (name: string) => {
  const envs = getEnvs();
  if (!envs.includes(name)) {
    envs.push(name);
    localStorage.setItem('terminal_envs', JSON.stringify(envs));
  }
};

export const packageManagerCommands: Command[] = [
  {
    name: 'conda',
    description: 'Gerenciador de pacotes, ambientes e canais (Conda)',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      const nameIdx = ctx.args.indexOf('-n') !== -1 ? ctx.args.indexOf('-n') + 1 : ctx.args.indexOf('--name') + 1;
      const envName = nameIdx > 0 ? ctx.args[nameIdx] : ctx.args[1];

      if (sub === 'create') {
        if (!envName) { ctx.printError('conda create: erro: o nome do ambiente é necessário (-n NAME)'); return; }
        ctx.print(`Collecting package metadata (current_repodata.json): ...working... done`);
        ctx.print(`Solving environment: ...working... done`);
        ctx.print(`\n## Package Plan ##\n  environment location: /home/dayhoff/miniconda3/envs/${envName}\n`);
        ctx.print(`Proceed ([y]/n)? y\n`);
        ctx.print(`Preparing transaction: done\nVerifying transaction: done\nExecuting transaction: done`);
        addEnv(envName);
        ctx.print(`\n# To activate this environment, use\n#     $ conda activate ${envName}`);
      } else if (sub === 'activate') {
        const target = ctx.args[1] || 'base';
        if (getEnvs().includes(target)) {
          ctx.setEnv(target);
          ctx.print(`Ambiente '${target}' ativado.`);
        } else {
          ctx.printError(`conda activate: ambiente não encontrado: ${target}`);
        }
      } else if (sub === 'env' && ctx.args[1] === 'list') {
        ctx.print('# conda environments:\n#');
        getEnvs().forEach((e: string) => {
          ctx.print(`${e.padEnd(20)}  /home/dayhoff/miniconda3/envs/${e}`);
        });
      } else if (sub === 'install') {
        const pkg = ctx.args.find(a => !a.startsWith('-') && a !== 'install');
        ctx.print(`Collecting package metadata... done\nSolving environment... done`);
        ctx.print(`\nDownloading and Extracting Packages:\n${pkg?.padEnd(15)} | ########## | 100% \nPreparing transaction: done\nVerifying transaction: done\nExecuting transaction: done`);
      } else {
        ctx.print('usage: conda [install|create|list|activate|env list] [args]');
      }
    }
  },
  {
    name: 'mamba',
    description: 'Gerenciador de pacotes rápido (Mamba)',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      if (sub === 'install') {
        const pkg = ctx.args[1] || 'fastqc';
        ctx.print(`\x1b[1;36mbioconda/linux-64\x1b[0m                   \x1b[1;30m[] 0.0s\x1b[0m`);
        ctx.print(`\x1b[1;36mconda-forge/noarch\x1b[0m                   \x1b[1;30m[] 0.0s\x1b[0m`);
        ctx.print(`\n\x1b[1mTransaction\x1b[0m`);
        ctx.print(`  \x1b[1;32m+\x1b[0m ${pkg} 0.11.9 (bioconda)`);
        ctx.print(`\n\x1b[1;32mConfirm? [Y/n]\x1b[0m y`);
        ctx.print(`\r\x1b[1;32m${pkg}\x1b[0m [####################] 100%`);
        ctx.print(`\n\x1b[1;32mTransaction finished\x1b[0m`);
      } else if (sub === 'activate') {
        const target = ctx.args[1] || 'base';
        if (getEnvs().includes(target)) {
          ctx.setEnv(target);
          ctx.print(`Ambiente '${target}' ativado.`);
        } else {
          ctx.printError(`mamba activate: ambiente não encontrado: ${target}`);
        }
      } else {
        ctx.print('usage: mamba [install|create|activate|list]');
      }
    }
  },
  {
    name: 'micromamba',
    description: 'Versão mínima e rápida do mamba',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      if (sub === 'create') {
        const name = ctx.args[ctx.args.indexOf('-n') + 1] || 'env';
        ctx.print(`\x1b[1;34m- libgcc-ng 12.2.0\x1b[0m\n\x1b[1;34m- python 3.10.0\x1b[0m`);
        ctx.print(`\x1b[1;32mEnvironment created at /home/dayhoff/micromamba/envs/${name}\x1b[0m`);
        addEnv(name);
      } else if (sub === 'activate') {
        const target = ctx.args[1] || 'base';
        if (getEnvs().includes(target)) {
          ctx.setEnv(target);
        } else {
          ctx.printError(`micromamba activate: ambiente não encontrado: ${target}`);
        }
      } else {
        ctx.print(`micromamba 1.4.2\nlibmamba 1.4.2\nUsage: micromamba [create|activate|install|shell]`);
      }
    }
  },
  {
    name: 'pip',
    description: 'Instalador de pacotes para Python',
    execute: async (ctx) => {
      const pkg = ctx.args.find(a => !a.startsWith('-') && a !== 'install');
      if (ctx.args.includes('install') && pkg) {
        ctx.print(`Collecting ${pkg}\n  Downloading ${pkg}-2.4.1-py3-none-any.whl (156 kB)`);
        ctx.print(`\r\x1b[32m|████████████████████████████████| 156 kB 1.8 MB/s\x1b[0m`);
        ctx.print(`Installing collected packages: ${pkg}\nSuccessfully installed ${pkg}-2.4.1`);
      } else if (ctx.args.includes('list')) {
        ctx.print('Package    Version\n---------- -------\npip        23.0.1\nsetuptools 67.8.0');
      } else {
        ctx.print('Usage: pip install [package]');
      }
    }
  },
  {
    name: 'docker',
    description: 'Gerenciador de containers Docker',
    execute: async (ctx) => {
      const cmd = ctx.args[0];
      const img = ctx.args[1] || 'ubuntu';
      if (cmd === 'run' || cmd === 'pull') {
        ctx.print(`latest: Pulling from library/${img}`);
        ctx.print(`\x1b[32mae13e: Pull complete\x1b[0m\n\x1b[32m31a2e: Pull complete\x1b[0m`);
        ctx.print(`Digest: sha256:79a5...\nStatus: Downloaded newer image for ${img}:latest`);
        if (cmd === 'run') ctx.print(`\nroot@${Math.random().toString(36).substring(7)}:/# `);
      } else if (cmd === 'ps') {
        ctx.print('CONTAINER ID   IMAGE     COMMAND   CREATED         STATUS         NAMES');
        ctx.print('1a2b3c4d5e6f   nginx     "nginx"   2 minutes ago   Up 2 minutes   web-server');
      } else if (cmd === 'images') {
        ctx.print('REPOSITORY   TAG       IMAGE ID       CREATED       SIZE');
        ctx.print('ubuntu       latest    ba627c2e3661   2 weeks ago   72.8MB\nnginx        latest    605c77e624dd   3 weeks ago   141MB');
      } else {
        ctx.print('Usage: docker [pull|run|ps|images]');
      }
    }
  },
  {
    name: 'singularity',
    description: 'Gerenciador de containers para HPC (HPC Containers)',
    execute: async (ctx) => {
      const cmd = ctx.args[0];
      if (cmd === 'run' || cmd === 'pull') {
        ctx.print(`INFO:    Converting SIF file...\nINFO:    Singularity image verified.\nHello from Singularity!`);
      } else {
        ctx.print('Usage: singularity [pull|run|exec] <image>');
      }
    }
  },
  {
    name: 'pixi',
    description: 'Gerenciador de pacotes e ambientes multi-linguagem extremamente rápido',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      if (sub === 'init') {
        ctx.print(`\x1b[1;32m✔\x1b[0m Initialized project in ${ctx.vfs.getCwd()}/pixi.toml`);
      } else if (sub === 'add') {
        const pkg = ctx.args[1] || 'python';
        ctx.print(`\x1b[1;32m✔\x1b[0m \x1b[1mResolving\x1b[0m dependencies`);
        ctx.print(`\x1b[1;32m✔\x1b[0m \x1b[1mDownloaded\x1b[0m ${pkg}`);
        ctx.print(`\x1b[1;32m✔\x1b[0m \x1b[1mUpdated\x1b[0m pixi.lock`);
      } else if (sub === 'run') {
        ctx.print(`\x1b[1;32m✔\x1b[0m \x1b[1mExecuting\x1b[0m command: ${ctx.args.slice(1).join(' ')}`);
      } else if (sub === 'shell') {
        ctx.setEnv('pixi');
        ctx.print(`Shell ativado. Digite 'exit' para sair.`);
      } else {
        ctx.print('pixi 0.15.0\nUsage: pixi [init|add|run|shell|project]');
      }
    }
  }
];

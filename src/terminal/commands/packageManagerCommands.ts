import type { Command } from './types';

export const packageManagerCommands: Command[] = [
  {
    name: 'conda',
    description: 'Gerenciador de pacotes, ambientes e canais (Conda)',
    execute: async (ctx) => {
      const arg = ctx.args[0];
      const pkg = ctx.args.find(a => !a.startsWith('-') && a !== arg);
      
      if (arg === 'install' && pkg) {
        ctx.print(`Collecting package metadata (current_repodata.json): ...working... done`);
        ctx.print(`Solving environment: ...working... done`);
        ctx.print(`\n## Package Plan ##\n  environment location: /home/dayhoff/miniconda3\n`);
        ctx.print(`The following NEW packages will be INSTALLED:\n  ${pkg}  pkgs/main/linux-64`);
        ctx.print(`\nProceed ([y]/n)? y\n`);
        ctx.print(`Preparing transaction: done\nVerifying transaction: done\nExecuting transaction: done`);
      } else if (arg === 'create') {
        ctx.print(`Success. To activate this environment, use:\n  $ conda activate ${pkg || 'env_name'}`);
      } else {
        ctx.print('usage: conda [install|create|list|activate] [package/env]');
      }
    }
  },
  {
    name: 'mamba',
    description: 'Gerenciador de pacotes rápido (Mamba)',
    execute: async (ctx) => {
      const pkg = ctx.args[1];
      if (ctx.args[0] === 'install' && pkg) {
        ctx.print(`\x1b[1;36mTransaction started\x1b[0m`);
        ctx.print(`  + ${pkg} 2.3.4 (bioconda)`);
        ctx.print(`\x1b[1;32mConfirm? [Y/n]\x1b[0m y`);
        ctx.print(`\r[####################] 100% Extracting ${pkg}...`);
        ctx.print(`\x1b[1;32mDone!\x1b[0m`);
      } else {
        ctx.print('usage: mamba install [package]');
      }
    }
  },
  {
    name: 'micromamba',
    description: 'Versão mínima e rápida do mamba',
    execute: async (ctx) => {
      ctx.print(`micromamba 1.4.2\n\x1b[1;33mEnvironment validated.\x1b[0m`);
      if (ctx.args.includes('install')) ctx.print('Package installed successfully.');
    }
  },
  {
    name: 'pip',
    description: 'Instalador de pacotes para Python',
    execute: async (ctx) => {
      const pkg = ctx.args.find(a => !a.startsWith('-') && a !== 'install');
      if (ctx.args.includes('install') && pkg) {
        ctx.print(`Collecting ${pkg}`);
        ctx.print(`  Downloading ${pkg}-1.0.2-py3-none-any.whl (4.5 MB)`);
        ctx.print(`\r|████████████████████████████████| 4.5 MB 1.2 MB/s`);
        ctx.print(`Installing collected packages: ${pkg}`);
        ctx.print(`Successfully installed ${pkg}-1.0.2`);
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
      const img = ctx.args[1];
      if (cmd === 'run' || cmd === 'pull') {
        ctx.print(`Using default tag: latest`);
        ctx.print(`latest: Pulling from library/${img || 'ubuntu'}`);
        ctx.print(`\r\x1b[1;32mae13e: Pull complete\x1b[0m`);
        ctx.print(`\r\x1b[1;32m31a2e: Pull complete\x1b[0m`);
        ctx.print(`Digest: sha256:79a5...`);
        ctx.print(`Status: Downloaded newer image for ${img || 'ubuntu'}:latest`);
      } else if (cmd === 'ps') {
        ctx.print('CONTAINER ID   IMAGE     COMMAND   CREATED         STATUS         NAMES');
        ctx.print('1a2b3c4d5e6f   nginx     "nginx"   2 minutes ago   Up 2 minutes   web-server');
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
        ctx.print(`INFO:    Converting SIF file...`);
        ctx.print(`INFO:    Singularity image verified.`);
        ctx.print(`Hello from Singularity!`);
      } else {
        ctx.print('Usage: singularity [pull|run|exec] <image>');
      }
    }
  },
  {
    name: 'pixi',
    description: 'Gerenciador de pacotes e ambientes multi-linguagem extremamente rápido',
    execute: async (ctx) => {
      if (ctx.args.includes('add')) {
        ctx.print(`\x1b[1;32m✔\x1b[0m Resolved dependencies`);
        ctx.print(`\x1b[1;32m✔\x1b[0m Downloaded packages`);
        ctx.print(`\x1b[1;32m✔\x1b[0m Installed environment`);
      } else {
        ctx.print('Usage: pixi [add|run|shell|init]');
      }
    }
  }
];

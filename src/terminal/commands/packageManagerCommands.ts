import type { Command } from './types';

// Helpers para persistência de Ambientes e Pacotes
const getEnvs = () => JSON.parse(localStorage.getItem('terminal_envs') || '["base"]');
const addEnv = (name: string) => {
  const envs = getEnvs();
  if (!envs.includes(name)) {
    envs.push(name);
    localStorage.setItem('terminal_envs', JSON.stringify(envs));
  }
};

const getInstalledPkgs = (env: string) => JSON.parse(localStorage.getItem(`pkgs_${env}`) || '["python", "pip", "bash"]');
const installPkg = (env: string, pkg: string) => {
  const pkgs = getInstalledPkgs(env);
  if (!pkgs.includes(pkg)) {
    pkgs.push(pkg);
    localStorage.setItem(`pkgs_${env}`, JSON.stringify(pkgs));
  }
};
const removePkg = (env: string, pkg: string) => {
  const pkgs = getInstalledPkgs(env).filter((p: string) => p !== pkg);
  localStorage.setItem(`pkgs_${env}`, JSON.stringify(pkgs));
};

export const packageManagerCommands: Command[] = [
  {
    name: 'conda',
    description: 'Gerenciador de pacotes e ambientes (Conda)',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      const currentEnv = localStorage.getItem('current_env') || 'base';
      const channelIdx = ctx.args.indexOf('-c');
      const channel = channelIdx !== -1 ? ctx.args[channelIdx + 1] : 'defaults';

      if (sub === 'install') {
        const pkg = ctx.args.find(a => !a.startsWith('-') && a !== 'install');
        if (!pkg) { ctx.printError('conda install: erro: especifique o pacote'); return; }
        
        ctx.print(`Collecting package metadata (current_repodata.json): ...working... done`);
        ctx.print(`Solving environment: ...working... done`);
        ctx.print(`\n## Package Plan ##\n  environment location: /home/dayhoff/miniconda3/envs/${currentEnv}\n`);
        ctx.print(`  added / updated specs:\n    - ${pkg}\n`);
        ctx.print(`The following packages will be downloaded:\n\n    package                    |            build\n    ---------------------------|-----------------\n    ${pkg.padEnd(26)} |      h1234567_0   1.2 MB\n`);
        ctx.print(`Proceed ([y]/n)? y`);
        ctx.print(`Preparing transaction: done\nVerifying transaction: done\nExecuting transaction: done`);
        installPkg(currentEnv, pkg);
      } else if (sub === 'remove' || sub === 'uninstall') {
        const pkg = ctx.args.find(a => !a.startsWith('-') && a !== sub);
        if (!pkg) { ctx.printError('conda remove: erro: especifique o pacote'); return; }
        ctx.print(`Collecting package metadata... done\nSolving environment... done`);
        ctx.print(`\n## Package Plan ##\n\nThe following packages will be REMOVED:\n  ${pkg}`);
        ctx.print(`\nProceed ([y]/n)? y\nPreparing transaction: done\nExecuting transaction: done`);
        removePkg(currentEnv, pkg);
      } else if (sub === 'env' && ctx.args[1] === 'create') {
        const fileIdx = ctx.args.indexOf('-f');
        const fileName = fileIdx !== -1 ? ctx.args[fileIdx + 1] : null;
        if (fileName) {
          const content = ctx.vfs.readFile(fileName, ctx.user);
          if (content && content.includes('name:')) {
            const envName = content.match(/name:\s*(.+)/)?.[1].trim() || 'new_env';
            ctx.print(`\x1b[1;34mInstalando ambiente '${envName}' a partir de ${fileName}...\x1b[0m`);
            addEnv(envName);
            installPkg(envName, 'samtools'); installPkg(envName, 'bwa');
            ctx.print(`\x1b[1;32mAmbiente criado com sucesso.\x1b[0m`);
          }
        }
      } else if (sub === 'list') {
        ctx.print(`# packages in environment at /home/dayhoff/miniconda3/envs/${currentEnv}:\n#\n# Name                    Version                   Build  Channel`);
        getInstalledPkgs(currentEnv).forEach((p: string) => ctx.print(`${p.padEnd(25)} 1.2.3                py310_0  ${channel}`));
      } else if (sub === 'activate') {
        const target = ctx.args[1] || 'base';
        if (getEnvs().includes(target)) { ctx.setEnv(target); ctx.print(`Ambiente '${target}' ativado.`); }
        else ctx.printError(`conda activate: ambiente não encontrado: ${target}`);
      } else if (sub === 'deactivate') {
        ctx.setEnv('');
        ctx.print('Ambiente desativado.');
      } else if (sub === 'env' && ctx.args[1] === 'list') {
        ctx.print('# conda environments:\n#');
        getEnvs().forEach((e: string) => ctx.print(`${e.padEnd(20)} ${e === currentEnv ? '*' : ' '} /home/dayhoff/miniconda3/envs/${e}`));
      } else {
        ctx.print('Uso: conda [install|remove|activate|list|env list]');
      }
    }
  },
  {
    name: 'mamba',
    description: 'Gerenciador de pacotes rápido (Mamba)',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      const currentEnv = localStorage.getItem('current_env') || 'base';
      if (sub === 'install') {
        const pkg = ctx.args.find(a => !a.startsWith('-') && a !== 'install') || 'fastqc';
        ctx.print(`\x1b[1;36mbioconda/linux-64\x1b[0m                   \x1b[1;32m[OK]\x1b[0m`);
        ctx.print(`\x1b[1;36mconda-forge/noarch\x1b[0m                   \x1b[1;32m[OK]\x1b[0m`);
        ctx.print(`\n\x1b[1mTransaction\x1b[0m\n  \x1b[1;32m+\x1b[0m ${pkg} 0.11.9 (bioconda)\n\n\x1b[1;32mConfirm? [Y/n]\x1b[0m y`);
        ctx.print(`\r\x1b[32m${pkg}\x1b[0m [####################] 100%`);
        installPkg(currentEnv, pkg);
        ctx.print(`\n\x1b[1;32mTransaction finished\x1b[0m`);
      } else if (sub === 'remove') {
        const pkg = ctx.args.find(a => !a.startsWith('-') && a !== 'remove');
        if (pkg) { ctx.print(`Removing ${pkg}... \x1b[1;32mdone\x1b[0m`); removePkg(currentEnv, pkg); }
      } else if (sub === 'activate') {
        const target = ctx.args[1] || 'base';
        if (getEnvs().includes(target)) { ctx.setEnv(target); ctx.print(`Ambiente '${target}' ativado.`); }
        else ctx.printError(`mamba activate: ambiente não encontrado: ${target}`);
      } else {
        ctx.print('Uso: mamba [install|remove|activate|list]');
      }
    }
  },
  {
    name: 'pip',
    description: 'Instalador de pacotes para Python',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      if (sub === 'install') {
        const isFile = ctx.args.includes('-r');
        const pkg = isFile ? ctx.args[ctx.args.indexOf('-r') + 1] : ctx.args.find(a => !a.startsWith('-') && a !== 'install');
        if (!pkg) { ctx.printError('pip install: erro: especifique o pacote ou arquivo'); return; }
        
        if (isFile) ctx.print(`Installing from ${pkg}...`);
        ctx.print(`Collecting ${pkg}\n  Downloading ${pkg}-2.4.1.whl (156 kB)`);
        ctx.print(`\x1b[32m|████████████████████████████████| 156 kB 1.8 MB/s\x1b[0m`);
        ctx.print(`Successfully installed ${isFile ? 'requirements' : pkg}`);
      } else if (sub === 'uninstall') {
        const pkg = ctx.args.find(a => a !== 'uninstall');
        ctx.print(`Proceed (y/n)? y\n  Successfully uninstalled ${pkg}`);
      } else if (sub === 'list') {
        ctx.print('Package    Version\n---------- -------\npip        23.0.1\nsetuptools 67.8.0');
      } else {
        ctx.print('Usage: pip [install|uninstall|list]');
      }
    }
  },
  {
    name: 'apt',
    description: 'Gerenciador de pacotes do Debian/Ubuntu',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      const pkg = ctx.args[1];
      if (sub === 'install' && pkg) {
        ctx.print(`Lendo listas de pacotes... Pronto\nConstruindo árvore de dependências... Pronto`);
        ctx.print(`Os seguintes pacotes NOVOS serão instalados:\n  ${pkg}`);
        ctx.print(`0 atualizados, 1 novos instalados, 0 a serem removidos.\nInstalando ${pkg}... [OK]`);
        installPkg('system', pkg);
      } else if (sub === 'remove' && pkg) {
        ctx.print(`Removendo ${pkg}... [OK]\nLimpando base de dados... Pronto`);
        removePkg('system', pkg);
      } else if (sub === 'update') {
        ctx.print('Atingido:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nLendo listas de pacotes... Pronto');
      } else {
        ctx.print('Uso: apt [install|remove|update] [pacote]');
      }
    }
  },
  {
    name: 'docker',
    description: 'Gerenciador de containers Docker',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      
      const getImages = () => JSON.parse(localStorage.getItem('docker_images') || '["ubuntu:latest", "nginx:latest"]');
      const addImage = (name: string) => {
        const imgs = getImages();
        if (!imgs.includes(name)) { imgs.push(name); localStorage.setItem('docker_images', JSON.stringify(imgs)); }
      };
      
      const getContainers = () => JSON.parse(localStorage.getItem('docker_containers') || '[]');
      const addContainer = (img: string, name: string) => {
        const cnts = getContainers();
        cnts.push({ id: Math.random().toString(36).substring(2, 14), image: img, name, status: 'Up 2 minutes' });
        localStorage.setItem('docker_containers', JSON.stringify(cnts));
      };

      if (sub === 'pull') {
        const img = ctx.args[1];
        if (!img) { ctx.printError('docker pull: erro: imagem não especificada'); return; }
        ctx.print(`Using default tag: latest\nlatest: Pulling from library/${img}`);
        ctx.print(`\x1b[32m7b1a2: Pull complete\x1b[0m\n\x1b[32m5e44a: Pull complete\x1b[0m`);
        ctx.print(`Digest: sha256:88a5...\nStatus: Downloaded newer image for ${img}:latest`);
        addImage(img.includes(':') ? img : `${img}:latest`);
      } else if (sub === 'run') {
        const img = ctx.args.find(a => !a.startsWith('-') && a !== 'run');
        if (!img) { ctx.printError('docker run: erro: imagem não especificada'); return; }
        const it = ctx.args.includes('-it');
        const name = ctx.args.includes('--name') ? ctx.args[ctx.args.indexOf('--name') + 1] : `brave_${Math.random().toString(36).substring(7)}`;
        
        if (!getImages().includes(img) && !getImages().includes(`${img}:latest`)) {
          ctx.print(`Unable to find image '${img}' locally`);
          ctx.print(`latest: Pulling from library/${img}... done`);
          addImage(img.includes(':') ? img : `${img}:latest`);
        }
        
        addContainer(img, name);
        if (it) {
          ctx.print(`\nroot@${Math.random().toString(36).substring(7)}:/# `);
          ctx.print(`\x1b[1;30m(Simulando terminal interativo... digite 'exit' para sair)\x1b[0m`);
        } else {
          ctx.print(`Container started: ${name}`);
        }
      } else if (sub === 'build') {
        const tagIdx = ctx.args.indexOf('-t');
        const tag = tagIdx !== -1 ? ctx.args[tagIdx + 1] : 'latest';
        const hasDockerfile = ctx.vfs.readFile('Dockerfile', ctx.user);
        
        if (hasDockerfile) {
          ctx.print(`\x1b[1m[+] Building 5.2s (8/8) FINISHED\x1b[0m`);
          ctx.print(` => [internal] load build definition from Dockerfile       0.1s`);
          ctx.print(` => [internal] load .dockerignore                            0.0s`);
          ctx.print(` => [1/3] FROM ubuntu:22.04                                  2.1s`);
          ctx.print(` => [2/3] RUN apt-get update && apt-get install samtools     1.8s`);
          ctx.print(` => [3/3] CMD ["samtools"]                                   0.1s`);
          ctx.print(` => exporting to image                                       0.2s`);
          ctx.print(` => naming to docker.io/library/${tag}                       0.0s`);
          addImage(tag.includes(':') ? tag : `${tag}:latest`);
        } else {
          ctx.printError('docker build: erro: Dockerfile não encontrado no diretório atual');
        }
      } else if (sub === 'ps') {
        ctx.print('CONTAINER ID   IMAGE          COMMAND    CREATED         STATUS         NAMES');
        getContainers().forEach((c: any) => {
          ctx.print(`${c.id.padEnd(14)} ${c.image.padEnd(14)} "bash"     2 minutes ago   ${c.status.padEnd(14)} ${c.name}`);
        });
      } else if (sub === 'images') {
        ctx.print('REPOSITORY     TAG       IMAGE ID       CREATED       SIZE');
        getImages().forEach((img: string) => {
          const [repo, tag] = img.split(':');
          ctx.print(`${(repo || 'ubuntu').padEnd(14)} ${(tag || 'latest').padEnd(9)} ba627c2e3661   2 weeks ago   72.8MB`);
        });
      } else if (sub === 'rm') {
        const id = ctx.args[1];
        const cnts = getContainers().filter((c: any) => c.id !== id && c.name !== id);
        localStorage.setItem('docker_containers', JSON.stringify(cnts));
        ctx.print(id);
      } else if (sub === 'rmi') {
        const id = ctx.args[1];
        const imgs = getImages().filter((img: string) => img !== id);
        localStorage.setItem('docker_images', JSON.stringify(imgs));
        ctx.print(`Untagged: ${id}\nDeleted: sha256:ba627...`);
      } else {
        ctx.print('Usage: docker [pull|run|ps|images|build|rm|rmi]');
      }
    }
  },
  {
    name: 'pixi',
    description: 'Gerenciador moderno (Pixi)',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      if (sub === 'add') {
        const pkg = ctx.args[1] || 'python';
        ctx.print(`\x1b[1;32m✔\x1b[0m \x1b[1mResolving\x1b[0m dependencies\n\x1b[1;32m✔\x1b[0m \x1b[1mDownloaded\x1b[0m ${pkg}\n\x1b[1;32m✔\x1b[0m \x1b[1mUpdated\x1b[0m pixi.lock`);
      } else if (sub === 'remove') {
        ctx.print(`\x1b[1;32m✔\x1b[0m \x1b[1mRemoved\x1b[0m ${ctx.args[1]}`);
      } else if (sub === 'list') {
        ctx.print('Package    Version    Build\n---------- ---------- -------\npython     3.11.0     h123');
      } else {
        ctx.print('pixi 0.15.0\nUsage: pixi [init|add|remove|list|run|shell]');
      }
    }
  },
  {
    name: 'deactivate',
    description: 'Desativa o ambiente virtual atual',
    execute: async (ctx) => {
      ctx.setEnv('');
      ctx.print('Ambiente desativado.');
    }
  }
];

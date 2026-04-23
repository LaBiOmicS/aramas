import type { Command } from './types';

export const extendedCommands: Command[] = [
  {
    name: 'wget',
    description: 'O recuperador de arquivos não interativo',
    execute: async (ctx) => {
      const url = ctx.args[0];
      if (!url) { ctx.printError('wget: URL ausente'); return; }
      ctx.print(`--${new Date().toISOString()}--  ${url}`);
      ctx.print('Resolvendo host... OK');
      ctx.print('Conectando... OK');
      ctx.print('Requisição HTTP enviada, aguardando resposta... 200 OK');
      ctx.print('Comprimento: 1024000 (1000K) [application/octet-stream]');
      ctx.print(`Salvando em: '${url.split('/').pop() || 'index.html'}'\n`);
      ctx.print(' 0% [                                     ] 0          --.-K/s');
      await new Promise(r => setTimeout(r, 600));
      ctx.print('100% [====================================>] 1,024,000  2.5MB/s   em 0.4s');
    }
  },
  {
    name: 'curl',
    description: 'Transfere dados de ou para um servidor',
    execute: async (ctx) => {
      const showHeader = ctx.args.includes('-I') || ctx.args.includes('--head');
      const url = ctx.args.find(a => !a.startsWith('-'));
      if (!url) { ctx.printError('curl: use --help para mais informações'); return; }
      
      if (showHeader) {
        ctx.print('HTTP/1.1 200 OK\nDate: Thu, 23 Apr 2026 12:00:00 GMT\nContent-Type: text/html; charset=UTF-8\nServer: gws');
      } else {
        ctx.print(`  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`);
        ctx.print(`                                 Dload  Upload   Total   Spent    Left  Speed`);
        ctx.print(`100 1024k  100 1024k    0     0  2500k      0 --:--:-- --:--:-- --:--:-- 2500k`);
        ctx.print(`<html><body>Simulando resposta de ${url}</body></html>`);
      }
    }
  },
  {
    name: 'tar',
    description: 'Utilitário de arquivamento',
    execute: async (ctx) => {
      const verbose = ctx.args.some(a => a.includes('v'));
      const compress = ctx.args.some(a => a.includes('z'));
      const bzip2 = ctx.args.some(a => a.includes('j'));
      const extract = ctx.args.some(a => a.includes('x'));
      const create = ctx.args.some(a => a.includes('c'));
      
      const file = ctx.args.find(a => !a.startsWith('-')) || 'archive.tar';

      if (create) {
        if (verbose) ctx.print('a bin/\na etc/\na home/');
        ctx.print(`Arquivado com sucesso em ${file}${compress ? '.gz' : (bzip2 ? '.bz2' : '')}`);
      } else if (extract) {
        if (verbose) ctx.print('x bin/\nx etc/\nx home/');
        ctx.print(`Extraído com sucesso de ${file}`);
      } else {
        ctx.print('Uso: tar [-czjvf] [arquivo]');
      }
    }
  },
  {
    name: 'zip',
    description: 'Empacota e comprime (arquiva) arquivos',
    execute: async (ctx) => {
      const recursive = ctx.args.includes('-r');
      const target = ctx.args.find(a => !a.startsWith('-'));
      if (!target) { ctx.printError('zip error: Nothing to do!'); return; }
      ctx.print(`  adding: ${target} (deflated 15%)`);
    }
  },
  {
    name: 'unzip',
    description: 'Lista, testa e extrai arquivos compactados em um arquivo ZIP',
    execute: async (ctx) => {
      const file = ctx.args[0];
      if (!file) { ctx.print('UnZip 6.00 of 20 April 2009, by Info-ZIP.  Usage: unzip [-opts] zipfile'); return; }
      ctx.print(`Archive:  ${file}\n  inflating: ${file.replace('.zip', '')}`);
    }
  },
  {
    name: '7z',
    description: 'Arquivador de arquivos com alta taxa de compressão',
    execute: async (ctx) => {
      const cmd = ctx.args[0];
      if (cmd === 'a') ctx.print('Creating archive: backup.7z\nItems to compress: 5\nFiles read from disk: 5\nEverything is Ok');
      else if (cmd === 'x') ctx.print('Extracting archive: backup.7z\nEverything is Ok');
      else ctx.print('7-Zip 16.02 (x64) : Copyright (c) 1999-2016 Igor Pavlov : 2016-05-21\nUsage: 7z <command> [<switches>...] <archive_name>');
    }
  },
  {
    name: 'sed',
    description: 'Editor de fluxo para filtrar e transformar texto',
    execute: async (ctx) => { ctx.print('Simulando transformação de fluxo...'); }
  },
  {
    name: 'awk',
    description: 'Linguagem de busca e processamento de padrões',
    execute: async (ctx) => { ctx.print('Simulando processamento de colunas...'); }
  },
  {
    name: 'sort',
    description: 'Ordena linhas de arquivos de texto',
    execute: async (ctx) => {
      const reverse = ctx.args.includes('-r');
      const numeric = ctx.args.includes('-n');
      const path = ctx.args.find(a => !a.startsWith('-'));
      
      let content = path ? ctx.vfs.readFile(path, ctx.user) : ctx.stdin;
      if (content && content !== 'Permissão negada') {
        let lines = content.split('\n').filter(l => l.length > 0);
        if (numeric) {
          lines.sort((a, b) => parseFloat(a) - parseFloat(b));
        } else {
          lines.sort();
        }
        if (reverse) lines.reverse();
        ctx.print(lines.join('\n'));
      } else {
        ctx.print('Uso: sort [-rn] [arquivo]');
      }
    }
  },
  {
    name: 'uniq',
    description: 'Reporta ou omite linhas repetidas',
    execute: async (ctx) => {
      const count = ctx.args.includes('-c');
      const path = ctx.args.find(a => !a.startsWith('-'));
      let content = path ? ctx.vfs.readFile(path, ctx.user) : ctx.stdin;
      
      if (content && content !== 'Permissão negada') {
        const lines = content.split('\n').filter(l => l.length > 0);
        if (lines.length === 0) return;
        const result: string[] = [];
        let lastLine = lines[0];
        let lastCount = 0;
        
        lines.forEach((line) => {
          if (line === lastLine) {
            lastCount++;
          } else {
            result.push(count ? `${lastCount.toString().padStart(7)} ${lastLine}` : lastLine);
            lastLine = line;
            lastCount = 1;
          }
        });
        result.push(count ? `${lastCount.toString().padStart(7)} ${lastLine}` : lastLine);
        ctx.print(result.join('\n'));
      }
    }
  },
  {
    name: 'cut',
    description: 'Remove seções de cada linha de arquivos',
    execute: async (ctx) => { ctx.print('Simulando extração de campos...'); }
  },
  {
    name: 'uname',
    description: 'Imprime informações do sistema',
    execute: async (ctx) => {
      if (ctx.args.includes('-a') || ctx.args.includes('--all')) {
        ctx.print('Linux LaBiOmicS 5.15.0-generic #1 SMP x86_64 GNU/Linux');
      } else if (ctx.args.includes('-r')) {
        ctx.print('5.15.0-generic');
      } else if (ctx.args.includes('-n')) {
        ctx.print('LaBiOmicS');
      } else if (ctx.args.includes('-m')) {
        ctx.print('x86_64');
      } else {
        ctx.print('Linux');
      }
    }
  },
  {
    name: 'hostname',
    description: 'Exibe ou define o nome do host do sistema',
    execute: async (ctx) => { ctx.print('LaBiOmicS'); }
  },
  {
    name: 'kill',
    description: 'Envia um sinal para um processo',
    execute: async (ctx) => {
      if (!ctx.args[0]) { ctx.printError('kill: uso: kill [-s sinal | -n signum] pid'); return; }
      ctx.print(`Processo ${ctx.args[0]} encerrado.`);
    }
  },
  {
    name: 'pkill',
    description: 'Envia sinais para processos baseados no nome',
    execute: async (ctx) => { ctx.print(`Processos correspondentes a '${ctx.args[0]}' encerrados.`); }
  },
  {
    name: 'which',
    description: 'Localiza um comando',
    execute: async (ctx) => { ctx.print(`/bin/${ctx.args[0] || 'bash'}`); }
  },
  {
    name: 'whereis',
    description: 'Localiza os arquivos binários, fontes e manuais de um comando',
    execute: async (ctx) => { ctx.print(`${ctx.args[0]}: /bin/${ctx.args[0]} /usr/share/man/man1/${ctx.args[0]}.1.gz`); }
  },
  {
    name: 'alias',
    description: 'Define ou exibe apelidos de comandos',
    execute: async (ctx) => { ctx.print('alias ls=\'ls --color=auto\'\nalias ll=\'ls -la\''); }
  },
  {
    name: 'export',
    description: 'Define variáveis de ambiente',
    execute: async (ctx) => { ctx.print(`export ${ctx.args[0] || 'PATH=/usr/local/bin:/usr/bin:/bin'}`); }
  },
  {
    name: 'env',
    description: 'Executa um programa em um ambiente modificado',
    execute: async (ctx) => { ctx.print('USER=dayhoff\nSHELL=/bin/bash\nHOME=/home/dayhoff\nPATH=/usr/bin:/bin'); }
  },
  {
    name: 'sleep',
    description: 'Atrasa por uma quantidade de tempo especificada',
    execute: async (ctx) => {
      const sec = parseInt(ctx.args[0] || '1');
      ctx.print(`Aguardando ${sec} segundos...`);
      await new Promise(r => setTimeout(r, Math.min(sec * 1000, 5000))); // Limite de 5s para simulação
    }
  },
  {
    name: 'diff',
    description: 'Compara arquivos linha por linha',
    execute: async (ctx) => { ctx.print('--- arquivo1\n+++ arquivo2\n- antiga\n+ nova'); }
  },
  {
    name: 'file',
    description: 'Determina o tipo do arquivo',
    execute: async (ctx) => {
      const path = ctx.args[0];
      const node = path ? ctx.vfs.getNode(path) : null;
      if (node) {
        ctx.print(`${path}: ${node.type === 'directory' ? 'directory' : 'ASCII text'}`);
      } else {
        ctx.printError('file: Arquivo não encontrado');
      }
    }
  },
  {
    name: 'locate',
    description: 'Busca arquivos pelo nome em um banco de dados',
    execute: async (ctx) => { ctx.print(`/usr/bin/${ctx.args[0] || 'find'}\n/usr/share/man/man1/${ctx.args[0] || 'find'}.1.gz`); }
  },
  {
    name: 'xargs',
    description: 'Constrói e executa linhas de comando a partir da entrada padrão',
    execute: async (ctx) => { ctx.print('Simulando execução de comandos em lote...'); }
  },
  {
    name: 'mount',
    description: 'Monta um sistema de arquivos',
    execute: async (ctx) => { ctx.print('/dev/sda1 on / type ext4 (rw,relatime)\ntmpfs on /run type tmpfs (rw,nosuid,nodev,mode=755)'); }
  },
  {
    name: 'umount',
    description: 'Desmonta sistemas de arquivos',
    execute: async (ctx) => { ctx.print(`Desmontando ${ctx.args[0]}... OK`); }
  },
  {
    name: 'systemctl',
    description: 'Controla o sistema systemd e o gerenciador de serviços',
    execute: async (ctx) => { ctx.print('UNIT                            LOAD   ACTIVE SUB     DESCRIPTION\nnginx.service                   loaded active running The NGINX HTTP and reverse proxy server'); }
  },
  {
    name: 'service',
    description: 'Executa um script de iniciação do System V',
    execute: async (ctx) => { ctx.print(' [ + ]  apache2\n [ - ]  mysql'); }
  },
  {
    name: 'dmesg',
    description: 'Imprime ou controla o buffer de anéis do kernel',
    execute: async (ctx) => { ctx.print('[    0.000000] Linux version 5.15.0-generic\n[    0.000000] Command line: BOOT_IMAGE=/vmlinuz root=UUID=...'); }
  },
  {
    name: 'journalctl',
    description: 'Consulta o log do systemd',
    execute: async (ctx) => { ctx.print('-- Logs begin at Thu 2026-04-23 10:00:00 -03. --\nApr 23 12:00:01 LaBiOmics systemd[1]: Started Session 1.'); }
  },
  {
    name: 'crontab',
    description: 'Mantém arquivos crontab para usuários individuais',
    execute: async (ctx) => { ctx.print('# m h  dom mon dow   command\n0 5 * * * /usr/bin/backup.sh'); }
  },
  {
    name: 'ip',
    description: 'Exibe ou manipula roteamento, dispositivos de rede, interfaces e túneis',
    execute: async (ctx) => { ctx.print('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP'); }
  },
  {
    name: 'ifconfig',
    description: 'Configura uma interface de rede (legado)',
    execute: async (ctx) => { ctx.print('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255'); }
  },
  {
    name: 'netstat',
    description: 'Exibe conexões de rede, tabelas de roteamento e estatísticas de interface',
    execute: async (ctx) => { ctx.print('Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN'); }
  },
  {
    name: 'dig',
    description: 'Utilitário de busca DNS',
    execute: async (ctx) => { ctx.print('; <<>> DiG 9.18.12 <<>> google.com\n;; ANSWER SECTION:\ngoogle.com.             300     IN      A       142.250.191.46'); }
  },
  {
    name: 'nslookup',
    description: 'Consulta servidores de nomes de domínio interativamente',
    execute: async (ctx) => { ctx.print('Server:         127.0.0.53\nAddress:        127.0.0.53#53\n\nNon-authoritative answer:\nName:   google.com\nAddress: 142.250.191.46'); }
  },
  {
    name: 'nmap',
    description: 'Ferramenta de exploração de rede e scanner de segurança/portas',
    execute: async (ctx) => { ctx.print('Starting Nmap 7.93\nNmap scan report for localhost (127.0.0.1)\nPORT     STATE SERVICE\n80/tcp   open  http\n443/tcp  open  https'); }
  },
  {
    name: 'su',
    description: 'Muda o ID do usuário ou torna-se superusuário',
    execute: async (ctx) => { ctx.print('Senha: \nLogado como root.'); }
  },
  {
    name: 'passwd',
    description: 'Altera a senha do usuário',
    execute: async (ctx) => { ctx.print('Alterando senha para dayhoff.\n(atual) senha do UNIX: '); }
  },
  {
    name: 'scp',
    description: 'Cópia segura (cópia de arquivo remoto)',
    execute: async (ctx) => {
      const file = ctx.args[0];
      const dest = ctx.args[1];
      if (!file || !dest) { ctx.print('usage: scp [-346BCpqrTv] [[user@]host1:]file1 ... [[user@]host2:]file2'); return; }
      ctx.print(`${file}                                   0%    0     0.0KB/s   --:-- ETA`);
      await new Promise(r => setTimeout(r, 500));
      ctx.print(`${file}                                 100% 1024     1.0KB/s   00:00`);
    }
  },
  {
    name: 'rsync',
    description: 'Ferramenta de cópia de arquivos rápida, versátil e remota (e local)',
    execute: async (ctx) => {
      const archive = ctx.args.includes('-a');
      const verbose = ctx.args.includes('-v');
      if (ctx.args.length < 2) { ctx.print('rsync  version 3.2.3  protocol version 31\nUsage: rsync [OPTION]... SRC [SRC]... DEST'); return; }
      
      if (verbose) ctx.print('sending incremental file list');
      ctx.print('file1.txt\nfile2.txt');
      if (archive) ctx.print('sent 1,234 bytes  received 67 bytes  2,602.00 bytes/sec\ntotal size is 1,120  speedup is 0.86');
    }
  },
  {
    name: 'lscpu',
    description: 'Exibe informações sobre a arquitetura da CPU',
    execute: async (ctx) => { ctx.print('Architecture:            x86_64\nCPU op-mode(s):        32-bit, 64-bit\nModel name:              Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz'); }
  },
  {
    name: 'lsusb',
    description: 'Lista dispositivos USB',
    execute: async (ctx) => { ctx.print('Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub\nBus 001 Device 002: ID 046d:c52b Logitech, Inc. Unifying Receiver'); }
  },
  {
    name: 'lspci',
    description: 'Lista todos os dispositivos PCI',
    execute: async (ctx) => { ctx.print('00:00.0 Host bridge: Intel Corporation 10th Gen Core Processor Host Bridge\n01:00.0 VGA compatible controller: NVIDIA Corporation GA104 [GeForce RTX 3070]'); }
  },
  {
    name: 'bash',
    description: 'Interpretador de linguagem de comandos compatível com sh',
    execute: async (ctx) => { ctx.print('Iniciando uma nova instância do bash...'); }
  },
  {
    name: 'sh',
    description: 'Interpretador de comandos (shell) padrão',
    execute: async (ctx) => { ctx.print('Iniciando sh...'); }
  },
  {
    name: 'zsh',
    description: 'O shell Z (Zsh)',
    execute: async (ctx) => { ctx.print('Iniciando zsh...'); }
  },
  {
    name: 'exit',
    description: 'Encerra o shell',
    execute: async (ctx) => { ctx.print('logout\nSessão encerrada.'); }
  },
  {
    name: 'logout',
    description: 'Faz log out de um shell de login',
    execute: async (ctx) => { ctx.print('logout'); }
  },
  {
    name: 'shutdown',
    description: 'Desliga ou reinicia o sistema',
    execute: async (ctx) => { ctx.print('Shutdown scheduled for Thu 2026-04-23 13:00:00 -03, use \'shutdown -c\' to cancel.'); }
  },
  {
    name: 'reboot',
    description: 'Reinicia o sistema',
    execute: async (ctx) => { ctx.print('Reiniciando o sistema agora...'); }
  },
  {
    name: 'type',
    description: 'Indica como um nome seria interpretado se usado como um comando',
    execute: async (ctx) => { ctx.print(`${ctx.args[0] || 'ls'} is hashed (/usr/bin/${ctx.args[0] || 'ls'})`); }
  },
  {
    name: 'tee',
    description: 'Lê da entrada padrão e escreve na saída padrão e em arquivos',
    execute: async (ctx) => { ctx.print('Simulando bifurcação de saída...'); }
  },
  {
    name: 'less',
    description: 'Filtro para visualização de arquivos (um por vez)',
    execute: async (ctx) => { ctx.print('Simulando visualizador less...'); }
  },
  {
    name: 'more',
    description: 'Filtro para visualização de arquivos (um por vez)',
    execute: async (ctx) => { ctx.print('Simulando visualizador more...'); }
  },
  {
    name: 'chgrp',
    description: 'Altera a propriedade de grupo de arquivos',
    execute: async (ctx) => { ctx.print('Grupo alterado.'); }
  },
  {
    name: 'umask',
    description: 'Exibe ou define a máscara de criação de modo de arquivo',
    execute: async (ctx) => { ctx.print('0022'); }
  },
  {
    name: 'head',
    description: 'Saída da primeira parte de arquivos',
    execute: async (ctx) => {
      let n = 10;
      const nIdx = ctx.args.indexOf('-n');
      if (nIdx !== -1 && ctx.args[nIdx+1]) {
        n = parseInt(ctx.args[nIdx+1]);
      } else {
        const directN = ctx.args.find(a => a.startsWith('-') && /^\d+$/.test(a.slice(1)));
        if (directN) n = parseInt(directN.slice(1));
      }
      
      const path = ctx.args.find(a => !a.startsWith('-') && a !== String(n) && a !== '-n');
      const content = path ? ctx.vfs.readFile(path, ctx.user) : ctx.stdin;
      
      if (content !== null && content !== undefined && content !== 'Permissão negada') {
        ctx.print(content.split('\n').slice(0, n).join('\n'));
      } else if (content === 'Permissão negada') {
        ctx.printError(`head: ${path}: Permissão negada`);
      }
    }
  },
  {
    name: 'tail',
    description: 'Saída da última parte de arquivos',
    execute: async (ctx) => {
      let n = 10;
      const nIdx = ctx.args.indexOf('-n');
      if (nIdx !== -1 && ctx.args[nIdx+1]) {
        n = parseInt(ctx.args[nIdx+1]);
      } else {
        const directN = ctx.args.find(a => a.startsWith('-') && /^\d+$/.test(a.slice(1)));
        if (directN) n = parseInt(directN.slice(1));
      }
      
      const path = ctx.args.find(a => !a.startsWith('-') && a !== String(n) && a !== '-n');
      const content = path ? ctx.vfs.readFile(path, ctx.user) : ctx.stdin;
      
      if (content !== null && content !== undefined && content !== 'Permissão negada') {
        const lines = content.split('\n').filter(l => l.length > 0);
        ctx.print(lines.slice(Math.max(0, lines.length - n)).join('\n'));
      } else if (content === 'Permissão negada') {
        ctx.printError(`tail: ${path}: Permissão negada`);
      }
    }
  }
];

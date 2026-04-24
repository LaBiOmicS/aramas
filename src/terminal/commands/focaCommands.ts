import type { Command } from './types';

export const focaCommands: Command[] = [
  {
    name: 'man',
    description: 'Interface para os manuais de referência do sistema',
    help: 'man COMANDO\n\nExibe a página de manual do sistema para o COMANDO especificado.',
    execute: async (ctx) => {
      const page = ctx.args[0];
      if (!page) { ctx.print('Qual página de manual você deseja?'); return; }
      const manuals: Record<string, string> = {
        ls: 'LS(1) - lista o conteúdo do diretório\n\nSINOPSE: ls [ARQUIVO]...\nDESCRIÇÃO: Lista informações sobre os ARQUIVOS.',
        chmod: 'CHMOD(1) - altera permissões de acesso a arquivos\n\nSINOPSE: chmod [OPÇÃO]... MODO[,MODO]... ARQUIVO...',
        sbatch: 'SBATCH(1) - envia um script de lote para o Slurm\n\nSINOPSE: sbatch [OPÇÕES] SCRIPT'
      };
      ctx.print(manuals[page] || `Nenhuma entrada de manual para ${page}`);
    }
  },
  {
    name: 'du',
    description: 'Estima o uso de espaço de arquivos',
    help: 'du [OPÇÃO]... [ARQUIVO]...\n\nExibe o uso de disco de cada arquivo e diretório.\n\nOpções:\n  -h, --human-readable   tamanhos em formato legível (ex: 1K 234M 2G)\n  -s, --summarize        exibe apenas o total para cada argumento',
    execute: async (ctx) => {
      const h = ctx.args.includes('-h') || ctx.args.includes('--human-readable');
      const s = ctx.args.includes('-s') || ctx.args.includes('--summarize');
      const path = ctx.args.find(a => !a.startsWith('-')) || '.';
      
      if (s) {
        ctx.print(`${h ? '452M' : '462848'}\t${path}`);
      } else {
        ctx.print(`${h ? '12K' : '12'}\t${path}/config`);
        ctx.print(`${h ? '440M' : '450560'}\t${path}/data`);
        ctx.print(`${h ? '452M' : '462848'}\t${path}`);
      }
    }
  },
  {
    name: 'vim',
    description: 'Vi IMproved, um editor de texto para programadores',
    help: 'vim [ARQUIVO]\n\nInicia o editor de texto Vim. (Simulação visual)',
    execute: async (ctx) => {
      const file = ctx.args[0] || '[Novo Arquivo]';
      ctx.clear();
      const rows = 20;
      for (let i = 0; i < rows; i++) {
        if (i === 0) ctx.print(`\x1b[1;34m~   \x1b[0mBem-vindo ao Vim (Simulação)`);
        else if (i === 1) ctx.print(`\x1b[1;34m~   \x1b[0mArquivo: ${file}`);
        else if (i === 2) ctx.print(`\x1b[1;34m~\x1b[0m`);
        else ctx.print(`\x1b[1;34m~\x1b[0m`);
      }
      ctx.print(`\x1b[7m"${file}" 0L, 0C                              1,1           Tudo\x1b[0m`);
      ctx.print(`\x1b[1;30m(Pressione 'Ctrl+C' ou digite ':q' no prompt real para sair da simulação)\x1b[0m`);
    }
  },
  {
    name: 'sbatch',
    description: 'Envia um script de lote para o Slurm',
    help: 'sbatch [OPÇÕES] SCRIPT\n\nEnvia um script para execução no cluster.\n\nExemplo:\n  sbatch pipeline.sh',
    execute: async (ctx) => {
      const script = ctx.args[0];
      if (!script) { ctx.printError('sbatch: erro: nenhum script especificado'); return; }
      const jobId = Math.floor(Math.random() * 900000) + 100000;
      ctx.print(`Submitted batch job ${jobId}`);
    }
  },
  {
    name: 'squeue',
    description: 'Exibe a fila de jobs do Slurm',
    help: 'squeue [OPÇÕES]\n\nOpções:\n  -u [user]   Lista apenas jobs do usuário',
    execute: async (ctx) => {
      ctx.print('             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)');
      const jobId = Math.floor(Math.random() * 900000) + 100000;
      ctx.print(`${jobId}     batch   pipeline  dayhoff  R       0:15      1 node-01`);
      ctx.print(`${jobId+1}     batch   analysis  dayhoff  PD      0:00      1 (Resources)`);
    }
  },
  {
    name: 'sinfo',
    description: 'Exibe informações sobre os nós e partições do Slurm',
    help: 'sinfo\n\nExibe o estado dos recursos do cluster.',
    execute: async (ctx) => {
      ctx.print('PARTITION AVAIL  TIMELIMIT  NODES  STATE NODELIST');
      ctx.print('batch*       up   infinite      8   idle node-[01-08]');
      ctx.print('gpu          up   infinite      2   busy node-09,node-10');
    }
  },
  {
    name: 'scancel',
    description: 'Cancela jobs no Slurm',
    help: 'scancel JOBID\n\nExemplo:\n  scancel 123456',
    execute: async (ctx) => {
      const id = ctx.args[0];
      if (!id) { ctx.printError('scancel: erro: JOBID necessário'); return; }
      ctx.print(`Job ${id} cancelled.`);
    }
  },
  {
    name: 'chmod',
    description: 'Altera as permissões de acesso a arquivos',
    help: 'chmod [OPÇÃO]... MODO[,MODO]... ARQUIVO...\n\nModifica as permissões de cada ARQUIVO de acordo com MODO.\n\nOpções:\n  -R, --recursive        modifica arquivos e diretórios recursivamente\n  -v, --verbose          exibe um diagnóstico para cada arquivo processado\n\nExemplos:\n  chmod 755 script.sh\n  chmod u+x,g-w arquivo.txt',
    execute: async (ctx) => {
      if (ctx.args.length < 2) { ctx.printError('chmod: operando ausente'); return; }
      const mode = ctx.args.find(a => !a.startsWith('-'));
      const path = ctx.args.find(a => !a.startsWith('-') && a !== mode);
      if (path && ctx.vfs.chmod(path, mode || '644', ctx.user)) {
        if (ctx.args.includes('-v')) ctx.print(`o modo de '${path}' foi alterado para ${mode}`);
      } else {
        ctx.printError(`chmod: não foi possível acessar '${path}': Arquivo não encontrado`);
      }
    }
  },
  {
    name: 'chown',
    description: 'Altera o dono e o grupo de arquivos',
    help: 'chown [OPÇÃO]... [DONO][:[GRUPO]] ARQUIVO...\n\nAltera o proprietário e/ou grupo de cada ARQUIVO.\n\nOpções:\n  -R, --recursive        opera em arquivos e diretórios recursivamente\n\nExemplo:\n  chown root:root /etc/passwd',
    execute: async (ctx) => {
      if (ctx.args.length < 2) { ctx.printError('chown: operando ausente'); return; }
      const owner = ctx.args.find(a => !a.startsWith('-'));
      const path = ctx.args.find(a => !a.startsWith('-') && a !== owner);
      if (path && ctx.vfs.chown(path, owner?.split(':')[0] || 'root', ctx.user)) {
        ctx.print(`Propriedade de '${path}' alterada.`);
      } else {
        ctx.printError(`chown: alteração falhou para '${path}'`);
      }
    }
  },
  {
    name: 'ps',
    description: 'Relatório do status dos processos atuais',
    help: 'ps [OPÇÕES]\n\nExibe informações sobre os processos ativos.\n\nOpções:\n  aux      exibe todos os processos de todos os usuários\n  -ef      exibe todos os processos em formato completo\n  --tree   exibe processos em formato de árvore',
    execute: async (ctx) => {
      if (ctx.args.includes('aux')) {
        ctx.print('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND');
        ctx.print('root         1  0.0  0.1  168M  9612 ?        Ss   Apr22   0:02 /sbin/init');
        ctx.print('dayhoff    124  0.1  0.5  543M 42100 pts/0    Ss   12:00   0:01 /bin/bash');
        ctx.print('dayhoff    567  0.0  0.0  123M  2100 pts/0    R+   12:35   0:00 ps aux');
      } else if (ctx.args.includes('-ef')) {
        ctx.print('UID        PID  PPID  C STIME TTY          TIME CMD');
        ctx.print('root         1     0  0 Apr22 ?        00:00:02 /sbin/init');
        ctx.print('dayhoff    124     1  0 12:00 pts/0    00:00:01 /bin/bash');
      } else {
        ctx.print('  PID TTY          TIME CMD\n  124 pts/0    00:00:01 bash\n  568 pts/0    00:00:00 ps');
      }
    }
  },
  {
    name: 'top',
    description: 'Exibe processos do Linux de forma dinâmica',
    help: 'top\n\nExibe uma visão em tempo real dos processos do sistema.',
    execute: async (ctx) => {
      ctx.print('\x1b[H\x1b[Jtop - 12:35:42 up 1 day, 2:31,  1 user,  load average: 0.08, 0.03, 0.05');
      ctx.print('Tasks: 125 total,   1 running, 124 sleeping,   0 stopped,   0 zombie');
      ctx.print('%Cpu(s):  0.3 us,  0.3 sy,  0.0 ni, 99.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st');
      ctx.print('MiB Mem :   7956.1 total,   3124.5 free,   2456.8 used,   2374.8 buff/cache');
      ctx.print('\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND');
      ctx.print('  124 dayhoff   20   0  543200  42100  32400 S   0.3   0.5   0:01.45 bash');
      ctx.print('  569 dayhoff   20   0   12345   6789   1234 R   0.0   0.1   0:00.01 top');
    }
  },
  {
    name: 'free',
    description: 'Exibe quantidade de memória livre e usada',
    help: 'free [OPÇÃO]\n\nExibe a quantidade total de memória física e de swap livre e usada.\n\nOpções:\n  -h, --human   exibe em formato legível (GB, MB)\n  -m, --mega    exibe em megabytes',
    execute: async (ctx) => {
      const h = ctx.args.includes('-h');
      ctx.print('              total        used        free      shared  buff/cache   available');
      if (h) {
        ctx.print('Mem:           7.8G        2.4G        3.1G        100M        2.3G        5.1G');
        ctx.print('Swap:          2.0G          0B        2.0G');
      } else {
        ctx.print('Mem:        8192000     2048000     4096000      102400     2048000     6144000');
        ctx.print('Swap:       2048000           0     2048000');
      }
    }
  },
  {
    name: 'ip',
    description: 'Exibe ou manipula roteamento, dispositivos e interfaces',
    help: 'ip [OPÇÕES] OBJETO {COMANDO}\n\nObjetos:\n  address (a)    endereços IP nas interfaces\n  link (l)       dispositivos de rede\n  route (r)      tabela de roteamento\n\nExemplos:\n  ip addr show\n  ip link set eth0 up',
    execute: async (ctx) => {
      const sub = ctx.args[0];
      if (sub === 'addr' || sub === 'a') {
        ctx.print('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default\n    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global dynamic eth0');
      } else if (sub === 'link' || sub === 'l') {
        ctx.print('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP');
      } else {
        ctx.print('Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }');
      }
    }
  },
  {
    name: 'netstat',
    description: 'Exibe conexões de rede e estatísticas',
    help: 'netstat [OPÇÕES]\n\nOpções:\n  -a, --all        exibe todos os sockets\n  -t               exibe conexões TCP\n  -u               exibe conexões UDP\n  -l               exibe sockets em escuta\n  -p               exibe o PID/Nome do programa',
    execute: async (ctx) => {
      ctx.print('Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name');
      ctx.print('tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      842/nginx: master');
      ctx.print('tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      711/sshd');
      ctx.print('udp        0      0 0.0.0.0:68              0.0.0.0:*                           620/dhclient');
    }
  },
  {
    name: 'df',
    description: 'Relata o uso de espaço em disco',
    help: 'df [OPÇÃO]... [ARQUIVO]...\n\nOpções:\n  -h, --human-readable   exibe tamanhos em formato legível (ex: 1K 234M 2G)\n  -T, --print-type       exibe o tipo do sistema de arquivos',
    execute: async (ctx) => {
      const h = ctx.args.includes('-h');
      ctx.print('Sist. Arq.      Tam.   Usado  Disp. Uso% Montado em');
      if (h) {
        ctx.print('/dev/sda1        50G    12G    38G  24% /');
        ctx.print('tmpfs           3.9G     0G   3.9G   0% /dev/shm');
      } else {
        ctx.print('/dev/sda1   52428800 12582912 39845888  24% /');
        ctx.print('tmpfs        40894464        0 40894464   0% /dev/shm');
      }
    }
  },
  {
    name: 'nmap',
    description: 'Exploração de rede e scanner de segurança',
    help: 'nmap [Tipo de Scan] [Opções] {alvo}\n\nExemplos:\n  nmap localhost\n  nmap -p 80,443 192.168.1.1',
    execute: async (ctx) => {
      const host = ctx.args.find(a => !a.startsWith('-')) || 'localhost';
      ctx.print(`Starting Nmap 7.93 at ${new Date().toISOString()}`);
      ctx.print(`Nmap scan report for ${host} (127.0.0.1)\nHost is up (0.00004s latency).`);
      ctx.print('PORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n3306/tcp open  mysql');
      ctx.print('\nNmap done: 1 IP address (1 host up) scanned in 0.05 seconds');
    }
  },
  {
    name: 'mem',
    description: 'Alias para free -h',
    help: 'mem\n\nExibe informações de memória em formato legível.',
    execute: async (ctx) => {
      const free = focaCommands.find(c => c.name === 'free');
      if (free) await free.execute({...ctx, args: ['-h']});
    }
  },
  {
    name: 'nslookup',
    description: 'Consulta servidores de nomes de domínio interativamente',
    help: 'nslookup [HOST]\n\nExemplo:\n  nslookup google.com',
    execute: async (ctx) => {
      const host = ctx.args[0] || 'google.com';
      ctx.print(`Server:         127.0.0.53\nAddress:        127.0.0.53#53\n\nNon-authoritative answer:\nName:   ${host}\nAddress: 142.250.191.46`);
    }
  },
  {
    name: 'dig',
    description: 'Utilitário de busca DNS',
    help: 'dig [HOST]\n\nExemplo:\n  dig labiomics.com',
    execute: async (ctx) => {
      const host = ctx.args[0] || 'example.com';
      ctx.print(`; <<>> DiG 9.18.12 <<>> ${host}\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n\n;; ANSWER SECTION:\n${host}.   300 IN  A   93.184.216.34`);
    }
  },
  {
    name: 'lsblk',
    description: 'Lista dispositivos de bloco',
    help: 'lsblk [OPÇÕES]\n\nLista informações sobre todos os dispositivos de bloco disponíveis.',
    execute: async (ctx) => {
      ctx.print('NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS');
      ctx.print('sda      8:0    0    50G  0 disk \n└─sda1   8:1    0    50G  0 part /');
      ctx.print('sr0     11:0    1  1024M  0 rom');
    }
  }
];

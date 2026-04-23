import type { VFSNode, VFSState, FileNode, DirectoryNode } from './types';

export class VFSManager {
  private state: VFSState;

  constructor(initialState?: VFSState) {
    this.state = initialState || {
      nodes: {
        '/': {
          name: '',
          type: 'directory',
          parent: null,
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          children: ['home', 'bin', 'etc', 'tmp', 'var', 'usr', 'root'],
        },
        '/home': this.createDirNode('home', '/'),
        '/bin': this.createDirNode('bin', '/'),
        '/etc': this.createDirNode('etc', '/'),
        '/tmp': this.createDirNode('tmp', '/'),
        '/var': this.createDirNode('var', '/'),
        '/usr': this.createDirNode('usr', '/'),
        '/root': this.createDirNode('root', '/', 'rwx------'),
        '/home/dayhoff': this.createDirNode('dayhoff', '/home'),
        '/home/dayhoff/projetos': this.createDirNode('projetos', '/home/dayhoff'),
        '/home/dayhoff/projetos/sequencia.fasta': {
          name: 'sequencia.fasta',
          type: 'file',
          parent: '/home/dayhoff/projetos',
          permissions: 'rw-r--r--',
          owner: 'dayhoff',
          group: 'dayhoff',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          content: '>seq1\nATGCATGCATGC\n>seq2\nGGGGCCCCAAAA\nTTTT',
        },
        '/home/dayhoff/projetos/genoma_curto.seq': {
          name: 'genoma_curto.seq',
          type: 'file',
          parent: '/home/dayhoff/projetos',
          permissions: 'rw-r--r--',
          owner: 'dayhoff',
          group: 'dayhoff',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          content: 'ATGCCCCGTAGTCGTA',
        },
        '/home/dayhoff/environment.yml': {
          name: 'environment.yml',
          type: 'file',
          parent: '/home/dayhoff',
          permissions: 'rw-r--r--',
          owner: 'dayhoff',
          group: 'dayhoff',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          content: 'name: bioinfo_toolset\nchannels:\n  - bioconda\n  - conda-forge\ndependencies:\n  - samtools\n  - bwa\n  - fastqc',
        },
        '/home/dayhoff/Dockerfile': {
          name: 'Dockerfile',
          type: 'file',
          parent: '/home/dayhoff',
          permissions: 'rw-r--r--',
          owner: 'dayhoff',
          group: 'dayhoff',
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          content: 'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y samtools\nCMD ["samtools"]',
        },
      },
      cwd: '/home/dayhoff',
    };
    
    // Ensure children are correctly linked - Defensivo para evitar crash com localStorage antigo
    const homeDayhoff = this.state.nodes['/home/dayhoff'] as DirectoryNode;
    if (homeDayhoff && homeDayhoff.children) {
      if (!homeDayhoff.children.includes('projetos')) {
        homeDayhoff.children.push('projetos');
      }
    }
    
    const projetos = this.state.nodes['/home/dayhoff/projetos'] as DirectoryNode;
    if (projetos) {
      projetos.children = ['sequencia.fasta', 'genoma_curto.seq'];
    }

    const home = this.state.nodes['/home'] as DirectoryNode;
    if (home && home.children) {
      if (!home.children.includes('dayhoff')) {
        home.children.push('dayhoff');
      }
    }
  }

  private createDirNode(name: string, parent: string, permissions = 'rwxr-xr-x'): DirectoryNode {
    return {
      name,
      type: 'directory',
      parent,
      permissions,
      owner: name === 'root' ? 'root' : 'dayhoff',
      group: name === 'root' ? 'root' : 'dayhoff',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      children: [],
    };
  }

  public findNodes(path: string, namePattern?: string): string[] {
    const startPath = this.resolvePath(path);
    const results: string[] = [];
    const allPaths = Object.keys(this.state.nodes);

    for (const p of allPaths) {
      if (p.startsWith(startPath)) {
        if (!namePattern || p.includes(namePattern)) {
          results.push(p);
        }
      }
    }
    return results;
  }

  public getState(): VFSState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getNodes(): Record<string, VFSNode> {
    return this.state.nodes;
  }

  public getCwd(): string {
    return this.state.cwd;
  }

  public resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return this.normalizePath(path);
    }
    const fullPath = this.state.cwd === '/' ? `/${path}` : `${this.state.cwd}/${path}`;
    return this.normalizePath(fullPath);
  }

  private normalizePath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    const stack: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }

    return '/' + stack.join('/');
  }

  public getNode(path: string): VFSNode | null {
    const normalized = this.normalizePath(path);
    return this.state.nodes[normalized] || null;
  }

  public checkPermission(path: string, user: string, action: 'r' | 'w' | 'x'): boolean {
    if (user === 'root') return true;
    const node = this.getNode(path);
    if (!node) return false;

    const perms = node.permissions;
    if (node.owner === user) {
      if (action === 'r') return perms[0] === 'r';
      if (action === 'w') return perms[1] === 'w';
      if (action === 'x') return perms[2] === 'x';
    } else {
      // Simplificado: permissões de 'outros'
      if (action === 'r') return perms[6] === 'r';
      if (action === 'w') return perms[7] === 'w';
      if (action === 'x') return perms[8] === 'x';
    }
    return false;
  }

  public setCwd(path: string, user: string = 'dayhoff'): boolean {
    const normalized = this.resolvePath(path);
    const node = this.getNode(normalized);
    if (node && node.type === 'directory') {
      if (!this.checkPermission(normalized, user, 'x')) return false;
      this.state.cwd = normalized;
      return true;
    }
    return false;
  }

  public listDirectory(path?: string, user: string = 'dayhoff'): string[] | null {
    const normalized = path ? this.resolvePath(path) : this.state.cwd;
    const node = this.getNode(normalized);
    if (node && node.type === 'directory') {
      if (!this.checkPermission(normalized, user, 'r')) return null;
      return node.children;
    }
    return null;
  }

  public readFile(path: string, user: string = 'dayhoff'): string | null {
    const normalized = this.resolvePath(path);
    const node = this.getNode(normalized);
    if (node && node.type === 'file') {
      if (!this.checkPermission(normalized, user, 'r')) return 'Permissão negada';
      return node.content;
    }
    return null;
  }

  public writeFile(path: string, content: string, user: string = 'dayhoff', append = false): boolean {
    const normalized = this.resolvePath(path);
    const node = this.getNode(normalized);
    
    if (node) {
      if (node.type === 'directory') return false;
      if (!this.checkPermission(normalized, user, 'w')) return false;
      const fileNode = node as FileNode;
      fileNode.content = append ? fileNode.content + content : content;
      fileNode.modifiedAt = Date.now();
      return true;
    } else {
      const parts = normalized.split('/');
      const fileName = parts.pop()!;
      const parentPath = '/' + parts.filter(Boolean).join('/');
      const parentNode = this.getNode(parentPath);

      if (parentNode && parentNode.type === 'directory') {
        if (!this.checkPermission(parentPath, user, 'w')) return false;
        const newNode: FileNode = {
          name: fileName,
          type: 'file',
          parent: parentPath,
          permissions: 'rw-r--r--',
          owner: user,
          group: user,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          content: content,
        };
        this.state.nodes[normalized] = newNode;
        parentNode.children.push(fileName);
        return true;
      }
    }
    return false;
  }

  public mkdir(path: string, user: string = 'dayhoff'): boolean {
    const normalized = this.resolvePath(path);
    if (this.getNode(normalized)) return false;

    const parts = normalized.split('/');
    const dirName = parts.pop()!;
    const parentPath = '/' + parts.filter(Boolean).join('/');
    const parentNode = this.getNode(parentPath);

    if (parentNode && parentNode.type === 'directory') {
      if (!this.checkPermission(parentPath, user, 'w')) return false;
      const newNode = this.createDirNode(dirName, parentPath);
      newNode.owner = user;
      newNode.group = user;
      this.state.nodes[normalized] = newNode;
      parentNode.children.push(dirName);
      return true;
    }
    return false;
  }

  public rm(path: string, user: string = 'dayhoff', recursive = false): boolean {
    const normalized = this.resolvePath(path);
    if (normalized === '/') return false;
    
    const node = this.getNode(normalized);
    if (!node) return false;

    // Precisa de permissão de escrita no diretório pai para remover
    const parentPath = node.parent || '/';
    if (!this.checkPermission(parentPath, user, 'w')) return false;

    if (node.type === 'directory' && !recursive && node.children.length > 0) {
      return false;
    }

    if (node.type === 'directory' && recursive) {
      const children = [...node.children];
      for (const childName of children) {
        this.rm(`${normalized}/${childName}`, user, true);
      }
    }

    const parentNode = this.getNode(parentPath);
    if (parentNode && parentNode.type === 'directory') {
      parentNode.children = parentNode.children.filter(c => c !== node.name);
    }

    delete this.state.nodes[normalized];
    return true;
  }

  public chmod(path: string, mode: string, user: string = 'dayhoff'): boolean {
    const normalized = this.resolvePath(path);
    const node = this.state.nodes[normalized];
    if (node) {
      if (user !== 'root' && node.owner !== user) return false;
      node.permissions = mode;
      node.modifiedAt = Date.now();
      return true;
    }
    return false;
  }

  public chown(path: string, owner: string, user: string = 'dayhoff'): boolean {
    const normalized = this.resolvePath(path);
    const node = this.state.nodes[normalized];
    if (node) {
      if (user !== 'root') return false; // Apenas root pode mudar dono no Linux real
      node.owner = owner;
      node.modifiedAt = Date.now();
      return true;
    }
    return false;
  }
}

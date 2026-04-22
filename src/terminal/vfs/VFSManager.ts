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
      },
      cwd: '/home/dayhoff',
    };
    
    // Ensure home/dayhoff is in home's children if not already
    const home = this.state.nodes['/home'] as DirectoryNode;
    if (!home.children.includes('dayhoff')) {
      home.children.push('dayhoff');
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

  public setCwd(path: string): boolean {
    const normalized = this.resolvePath(path);
    const node = this.getNode(normalized);
    if (node && node.type === 'directory') {
      this.state.cwd = normalized;
      return true;
    }
    return false;
  }

  public listDirectory(path?: string): string[] | null {
    const normalized = path ? this.resolvePath(path) : this.state.cwd;
    const node = this.getNode(normalized);
    if (node && node.type === 'directory') {
      return node.children;
    }
    return null;
  }

  public readFile(path: string): string | null {
    const normalized = this.resolvePath(path);
    const node = this.getNode(normalized);
    if (node && node.type === 'file') {
      return node.content;
    }
    return null;
  }

  public writeFile(path: string, content: string, append = false): boolean {
    const normalized = this.resolvePath(path);
    const node = this.getNode(normalized);
    
    if (node) {
      if (node.type === 'directory') return false;
      const fileNode = node as FileNode;
      fileNode.content = append ? fileNode.content + content : content;
      fileNode.modifiedAt = Date.now();
      return true;
    } else {
      // Create new file
      const parts = normalized.split('/');
      const fileName = parts.pop()!;
      const parentPath = '/' + parts.filter(Boolean).join('/');
      const parentNode = this.getNode(parentPath);

      if (parentNode && parentNode.type === 'directory') {
        const newNode: FileNode = {
          name: fileName,
          type: 'file',
          parent: parentPath,
          permissions: 'rw-r--r--',
          owner: 'dayhoff',
          group: 'dayhoff',
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

  public mkdir(path: string): boolean {
    const normalized = this.resolvePath(path);
    if (this.getNode(normalized)) return false;

    const parts = normalized.split('/');
    const dirName = parts.pop()!;
    const parentPath = '/' + parts.filter(Boolean).join('/');
    const parentNode = this.getNode(parentPath);

    if (parentNode && parentNode.type === 'directory') {
      const newNode = this.createDirNode(dirName, parentPath);
      this.state.nodes[normalized] = newNode;
      parentNode.children.push(dirName);
      return true;
    }
    return false;
  }

  public rm(path: string, recursive = false): boolean {
    const normalized = this.resolvePath(path);
    if (normalized === '/') return false;
    
    const node = this.getNode(normalized);
    if (!node) return false;

    if (node.type === 'directory' && !recursive && node.children.length > 0) {
      return false;
    }

    // Remove children if recursive
    if (node.type === 'directory' && recursive) {
      const children = [...node.children];
      for (const childName of children) {
        this.rm(`${normalized}/${childName}`, true);
      }
    }

    // Remove from parent
    const parentNode = this.getNode(node.parent || '/');
    if (parentNode && parentNode.type === 'directory') {
      parentNode.children = parentNode.children.filter(c => c !== node.name);
    }

    delete this.state.nodes[normalized];
    return true;
  }

  public chmod(path: string, mode: string): boolean {
    const normalized = this.resolvePath(path);
    const node = this.state.nodes[normalized];
    if (node) {
      node.permissions = mode;
      node.modifiedAt = Date.now();
      return true;
    }
    return false;
  }

  public chown(path: string, owner: string): boolean {
    const normalized = this.resolvePath(path);
    const node = this.state.nodes[normalized];
    if (node) {
      node.owner = owner;
      node.modifiedAt = Date.now();
      return true;
    }
    return false;
  }
}

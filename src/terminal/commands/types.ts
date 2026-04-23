import { VFSManager } from '../vfs/VFSManager';

export interface CommandContext {
  vfs: VFSManager;
  args: string[];
  user: string;
  stdin?: string;
  print: (text: string) => void;
  printError: (text: string) => void;
  clear: () => void;
  setEnv: (envName: string) => void;
}

export interface Command {
  name: string;
  description: string;
  execute: (ctx: CommandContext) => Promise<void>;
  help?: string;
}

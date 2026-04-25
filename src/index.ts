// Main entry point for the ARAMAS library

// Components
export { default as AramasTerminal } from './components/Terminal';

// Core Engines
export { TerminalEngine } from './terminal/engine/TerminalEngine';
export { VFSManager } from './terminal/vfs/VFSManager';
export { QuestManager, RANKS } from './terminal/engine/QuestManager';

// Types
export type { Command, CommandContext } from './terminal/commands/types';
export type { VFSNode, VFSState, FileNode, DirectoryNode } from './terminal/vfs/types';
export type { Quest, Achievement, Rank } from './terminal/engine/QuestManager';

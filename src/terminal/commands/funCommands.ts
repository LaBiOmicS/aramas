import type { Command } from './types';

export const funCommands: Command[] = [
  {
    name: 'cmatrix',
    description: 'Simula o terminal do Matrix',
    help: 'cmatrix\n\nExibe o famoso efeito de cascata de caracteres verdes do filme Matrix.',
    execute: async (ctx) => {
      const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*";
      ctx.clear();
      for (let i = 0; i < 20; i++) {
        let line = "";
        for (let j = 0; j < 60; j++) {
          line += Math.random() > 0.9 ? `\x1b[1;32m${chars[Math.floor(Math.random() * chars.length)]}\x1b[0m` : " ";
        }
        ctx.print(line);
        await new Promise(r => setTimeout(r, 80));
      }
      ctx.print("\n\x1b[1;32m[SISTEMA INVADIDO POR: DAYHOFF]\x1b[0m\n");
    }
  },
  {
    name: 'foca-bio',
    description: 'Um segredo da evolução molecular',
    help: 'foca-bio\n\nRevela o elo perdido entre o DNA e a Foca da Bioinformática.',
    execute: async (ctx) => {
      ctx.print("\x1b[1;34mSequenciando Genoma da Foca...\x1b[0m");
      await new Promise(r => setTimeout(r, 600));
      ctx.print("  A-T\n   G-C\n    T-A\n     C-G\n    A-T\n   G-C\n  T-A");
      await new Promise(r => setTimeout(r, 600));
      ctx.print("\x1b[1;33m\n       .---. \n      /     \\ \n     (  o o  )  <-- Foca da Bioinfo detectada!\n      )  L  ( \n     /       \\ \n    /         \\ \n   /            \\ \n\x1b[0m");
      ctx.print("\x1b[1;32mDogma Central: DNA -> RNA -> Proteína -> FOCA\x1b[0m");
    }
  },
  {
    name: 'samara',
    description: 'Não digite este comando...',
    help: 'samara\n\nUma experiência gótica inspirada no VHS proibido.',
    execute: async (ctx) => {
      ctx.clear();
      await new Promise(r => setTimeout(r, 1000));
      ctx.print("\x1b[1;30m       ______________________\x1b[0m");
      ctx.print("\x1b[1;30m      /                      \\\x1b[0m");
      ctx.print("\x1b[1;30m     /        ________        \\\x1b[0m");
      ctx.print("\x1b[1;30m    |        /        \\        |\x1b[0m");
      ctx.print("\x1b[1;30m    |       |  O POÇO  |       |\x1b[0m");
      await new Promise(r => setTimeout(r, 1000));
      ctx.print("\x1b[1;37m    |       |    ||    |       |\x1b[0m");
      ctx.print("\x1b[1;37m    |       |  --||--  |       |\x1b[0m");
      ctx.print("\x1b[1;37m    |       |  / || \\  |       |\x1b[0m");
      ctx.print("\x1b[1;37m    |        \\_SAMARA_/        |\x1b[0m");
      await new Promise(r => setTimeout(r, 800));
      ctx.print("\x1b[1;31m\n         SETE DIAS...\x1b[0m");
      ctx.print("\x1b[1;30m\n[CONEXÃO INTERROMPIDA POR FORÇAS SOBRENATURAIS]\x1b[0m");
    }
  }
];

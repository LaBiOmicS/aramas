# ARAMAS v1.0.2
### Ambiente Remoto para o Aprendizado e Manipulação de Arquivos e Sistemas

<p align="center">
  <img src="icon.png" alt="ARAMAS Logo" width="70%">
</p>

[![DOI](https://zenodo.org/badge/1218430102.svg)](https://doi.org/10.5281/zenodo.19768374)
[![University: UMC](https://img.shields.io/badge/University-UMC-0D47A1.svg)](https://www.umc.br/)
[![Laboratory: LaBiOmicS](https://img.shields.io/badge/Laboratory-LaBiOmicS-7B1FA2.svg)](https://github.com/LaBiOmicS)

[![NPM Version](https://img.shields.io/npm/v/@labiomics/aramas.svg)](https://www.npmjs.com/package/@labiomics/aramas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v22.22.2-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.19768375.svg)](https://doi.org/10.5281/zenodo.19768375)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![GitHub issues](https://img.shields.io/github/issues/LaBiOmicS/aramas)](https://github.com/LaBiOmicS/aramas/issues)
[![GitHub stars](https://img.shields.io/github/stars/LaBiOmicS/aramas)](https://github.com/LaBiOmicS/aramas/stargazers)

O **ARAMAS** é uma plataforma educacional imersiva e gamificada projetada para o ensino de **Linux** e **Bioinformática**. Ele oferece um ambiente de terminal simulado onde estudantes podem praticar comandos reais, gerenciar sistemas de arquivos e executar pipelines de análise genômica em uma jornada baseada em missões, XP e progressão de ranks.

---

<p align="center">
  <img src="infografico.png" alt="ARAMAS Infographic" width="100%">
</p>

---

## 📋 Sumário
- [🚀 Demonstração Online](#-demonstração-online)
- [📦 Registro NPM](#-registro-npm)
- [🧬 Principais Funcionalidades](#-principais-funcionalidades)
- [📚 Estrutura Educacional](#-estrutura-educacional-módulos)
- [🛠️ Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📦 Integração via NPM](#-integração-via-npm)
- [📂 Estrutura do Projeto](#-estrutura-do-projeto)
- [⚙️ Desenvolvimento e Instalação](#-desenvolvimento-e-instalação-local)
- [🤝 Contribuição](#-contribuição)
- [👤 Coordenação e Créditos](#-coordenação-e-créditos)
- [📝 Citação](#-citação)
- [📄 Licença](#-licença)

---

## 🚀 Demonstração Online
Acesse a plataforma agora: [https://labiomics.github.io/aramas/](https://labiomics.github.io/aramas/)

---

## 📦 Registro NPM
O pacote oficial está disponível em: [https://www.npmjs.com/package/@labiomics/aramas](https://www.npmjs.com/package/@labiomics/aramas)

---

## 🧬 Principais Funcionalidades

### 🎮 Gamificação Ativa
- **Sistema de XP e Ranks:** Evolua de *Novato(a)* até *Mestre da Bioinformática*.
- **Missões Estruturadas:** 50+ missões divididas em 3 módulos de complexidade crescente.
- **Conquistas:** Desbloqueie insígnias como "Mestre dos Pipes" e "Administrador(a)".
- **Persistência Local:** Seu progresso e arquivos são salvos automaticamente no navegador.

### 💻 Terminal de Alta Performance
- **Simulação Fiel:** Baseado em XTerm.js com suporte a cores ANSI, histórico e auto-complete.
- **VFS (Virtual File System):** Sistema de arquivos em memória com suporte a permissões (chmod/chown), usuários (root/dayhoff) e diretórios padrão Linux.
- **Suporte a Pipes:** Encadeamento de comandos complexos (ex: `grep | sort | uniq -c`).

### 🔬 Foco em Bioinformática
- **Bio-Commands:** Simulação de ferramentas essenciais: `samtools`, `bwa`, `fastqc`, `bcftools`, `snakemake`, etc.
- **Ciência de Dados:** Suporte robusto a `awk`, `sed`, `grep` e editores como `vim`.
- **Ambientes e Containers:** Gerenciamento virtual via `mamba`, `conda`, `docker` e `singularity`.

---

## 🎯 Statement of Need

Modern bioinformatics relies heavily on command-line proficiency. However, the initial learning curve for the Linux terminal can be steep for students from life sciences backgrounds. Existing educational resources often fall into two categories: static tutorials that lack interactivity, or full virtual machines that require complex setup and resources.

`ARAMAS` fills this gap by offering a zero-install, lightweight simulation that runs entirely in the browser. It is specifically tailored for bioinformatics, simulating the behavior of industry-standard tools and providing an integrated gamification engine that rewards progress, increasing student engagement and retention.

---

## 📚 Estrutura Educacional (Módulos)

1.  **Sistemas Operacionais:** Navegação, manipulação de arquivos, permissões e administração básica.
2.  **Manipulação de Dados:** Filtros, fluxos de texto, ordenação e automação com xargs.
3.  **Computação Científica:** Ferramentas de Bioinfo, automação de pipelines e computação em cluster (HPC).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19 + TypeScript
- **Terminal:** [XTerm.js](https://xtermjs.org/)
- **Roteamento:** React Router Dom (HashRouter)
- **Engine de Build:** Vite + Rolldown
- **Estilização:** Vanilla CSS3 com variáveis dinâmicas

---

## 📦 Integração via NPM

O **ARAMAS** pode ser integrado em outros projetos como um componente React ou através de seus motores lógicos.

### Instalação
```bash
npm install @labiomics/aramas
```

### Uso como Componente (React)
```tsx
import { AramasTerminal } from '@labiomics/aramas';
import '@labiomics/aramas/dist/style.css';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AramasTerminal />
    </div>
  );
}
```

### Uso de Motores (Headless)
Você também pode acessar as classes de lógica diretamente:
```typescript
import { TerminalEngine, VFSManager, QuestManager } from '@labiomics/aramas';
```

---

## 📂 Estrutura do Projeto

```text
gamified-terminal/
├── .github/              # Configurações do GitHub (workflows, templates)
├── public/               # Ativos estáticos públicos
├── src/
│   ├── assets/           # Imagens e recursos visuais
│   ├── components/       # Componentes React (Terminal, UI)
│   ├── terminal/
│   │   ├── commands/     # Implementação dos comandos (Bash, Bioinfo, etc)
│   │   ├── engine/       # Lógica central (QuestManager, TerminalEngine)
│   │   └── vfs/          # Virtual File System (Gerenciamento de arquivos)
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Ponto de entrada
├── index.html            # Template HTML
└── package.json          # Dependências e scripts
```

---

## ⚙️ Desenvolvimento e Instalação Local

### Pré-requisitos
- **Node.js:** v22.22.2 (Recomendado utilizar NVM)
- **NPM:** v10.x ou superior

### Passo a Passo
1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/LaBiOmicS/aramas.git
    cd aramas/gamified-terminal
    ```
2.  **Instalar dependências:**
    ```bash
    npm install
    ```
3.  **Executar em modo desenvolvimento:**
    ```bash
    npm run dev
    ```
4.  **Gerar Build de Produção:**
    ```bash
    npm run build
    ```

---

<p align="center">
  <img src="poster.png" alt="ARAMAS Infographic" width="100%">
</p>

---

## 🤝 Contribuição

Contribuições são muito bem-vindas! Se você tem uma ideia de nova missão, novo comando ou encontrou um bug, por favor, leia nosso [Guia de Contribuição](CONTRIBUTING.md) antes de enviar um Pull Request.

---

## 👤 Coordenação e Créditos

O projeto **ARAMAS** é uma iniciativa acadêmica desenvolvida no âmbito da Bioinformática.

- **Coordenador do Projeto:** Prof. Dr. Fabiano B. Menegidio
- **Laboratório:** [LaBiOmics](https://github.com/LaBiOmicS) - Laboratório de Bioinformática e Ciências Ômicas
- **Instituição:** Universidade de Mogi das Cruzes (UMC)

---

## 📝 Citação

Se você utilizar o **ARAMAS** em seu trabalho acadêmico ou pedagógico, por favor, cite-o utilizando o DOI do Zenodo:

> Menegidio, F. B. (2026). ARAMAS: Ambiente Remoto para o Aprendizado e Manipulação de Arquivos e Sistemas (v1.0.2). Zenodo. https://doi.org/10.5281/zenodo.19768375

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---
*ARAMAS - Dominando o Terminal, Conquistando a Ciência.*

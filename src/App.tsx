import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Terminal from './components/Terminal';
import './App.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const repoUrl = "https://github.com/LaBiOmicS/aramas";

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="glitch-text" data-text="ARAMAS">ARAMAS</h1>
            <p className="subtitle">
              Ambiente Remoto para o Aprendizado e Manipulação de Arquivos e Sistemas
            </p>
            <div className="badges">
              <span className="badge">Linux</span>
              <span className="badge">Bioinformática</span>
              <span className="badge">Gamificado</span>
            </div>
            <div className="cta-group">
              <button className="cta-button" onClick={() => navigate('/terminal')}>
                <span className="icon">💻</span> ACESSAR TERMINAL <span className="arrow">→</span>
              </button>
              <button className="cta-button secondary" onClick={() => window.open(repoUrl, '_blank')}>
                <span className="icon">📂</span> REPOSITÓRIO GITHUB
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="terminal-mockup">
              <div className="terminal-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="terminal-body">
                <p><span className="t-green">dayhoff@ARAMAS</span>:<span className="t-blue">~</span>$ missao</p>
                <p className="t-yellow">🎯 MISSÃO: Exploração Inicial</p>
                <p>Liste os arquivos para começar...</p>
                <p><span className="t-green">dayhoff@ARAMAS</span>:<span className="t-blue">~</span>$ ls _</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Domine a Bioinformática através da prática</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon">🧬</div>
              <h3>Módulos Especializados</h3>
              <p>Do básico de Sistemas Operacionais até pipelines complexos de Genômica e HPC.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🎮</div>
              <h3>Gamificação Ativa</h3>
              <p>Ganhe XP, complete conquistas e suba de rank enquanto aprende comandos reais.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🐳</div>
              <h3>Ferramentas Reais</h3>
              <p>Simulação fiel de comandos como Samtools, BWA, Snakemake, Docker e Singularity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commands Section */}
      <section className="commands-preview">
        <div className="container">
          <div className="section-header">
            <h2>Arsenal de Comandos</h2>
            <p>Mais de 50 comandos simulados para seu treinamento</p>
          </div>
          <div className="command-categories">
            <div className="cat-box">
              <h4>📂 Navegação</h4>
              <ul><li>ls</li><li>cd</li><li>pwd</li><li>mkdir</li><li>rm</li></ul>
            </div>
            <div className="cat-box">
              <h4>🧬 Bioinfo</h4>
              <ul><li>fastqc</li><li>bwa</li><li>samtools</li><li>bcftools</li><li>snakemake</li></ul>
            </div>
            <div className="cat-box">
              <h4>🛠️ Processamento</h4>
              <ul><li>grep</li><li>sed</li><li>awk</li><li>sort</li><li>xargs</li></ul>
            </div>
            <div className="cat-box">
              <h4>📦 Ambientes</h4>
              <ul><li>mamba</li><li>conda</li><li>docker</li><li>singularity</li><li>pip</li></ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ranks Section */}
      <section className="ranks-info">
        <div className="container">
          <h2>Plano de Carreira</h2>
          <div className="rank-list">
            <div className="rank-item">
              <span className="rank-xp">0 XP</span>
              <span className="rank-name">Novato(a)</span>
            </div>
            <div className="rank-item highlight">
              <span className="rank-xp">7k XP</span>
              <span className="rank-name">Avançado(a)</span>
            </div>
            <div className="rank-item mestre">
              <span className="rank-xp">30k XP</span>
              <span className="rank-name">Mestre da Bioinformática</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <strong>ARAMAS</strong> | v1.0.0
            </div>
            <div className="footer-credits">
              Coordenado por <strong>Prof. Dr. Fabiano B. Menegidio</strong><br/>
              Desenvolvido por <strong>LaBiOmics</strong><br/>
              Laboratório de Bioinformática e Ciências Ômicas<br/>
              <strong>Universidade de Mogi das Cruzes (UMC)</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terminal" element={<Terminal />} />
      </Routes>
    </Router>
  );
};

export default App;

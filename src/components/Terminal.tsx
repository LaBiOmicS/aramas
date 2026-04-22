import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalEngine } from '../terminal/engine/TerminalEngine';
import type { VFSNode } from '../terminal/vfs/types';

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TerminalEngine | null>(null);
  const [vfsNodes, setVfsNodes] = useState<Record<string, VFSNode>>({});
  const [currentQuest, setCurrentQuest] = useState<{title: string, progress: string} | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selectionBackground: '#5c5c5c',
      },
      fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    
    xterm.open(terminalRef.current);
    fitAddon.fit();

    const updateUI = () => {
      if (engineRef.current) {
        setVfsNodes({...engineRef.current.getVFS().getNodes()});
        const qm = engineRef.current.getQuestManager();
        const q = qm.getCurrentQuest();
        if (q) {
          setCurrentQuest({ title: q.title, progress: qm.getProgress() });
        } else {
          setCurrentQuest(null);
        }
      }
    };

    engineRef.current = new TerminalEngine(xterm, updateUI);
    updateUI();

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, []);

  const renderFileTree = (path: string = '/') => {
    const node = vfsNodes[path];
    if (!node) return null;

    if (node.type === 'directory') {
      return (
        <div key={path} style={{ marginLeft: '12px' }}>
          <div style={{ color: '#cccccc', padding: '2px 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '5px', fontSize: '10px' }}>📁</span>
            {node.name || '/'}
          </div>
          {node.children.map(child => renderFileTree(path === '/' ? `/${child}` : `${path}/${child}`))}
        </div>
      );
    }

    return (
      <div key={path} style={{ marginLeft: '24px', color: '#888888', padding: '2px 0', fontSize: '0.9em' }}>
        <span style={{ marginRight: '5px' }}>📄</span>
        {node.name}
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Sidebar / Explorer */}
      <div style={{ 
        width: '260px', 
        height: '100%', 
        backgroundColor: '#252526', 
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '10px', fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Explorador de Arquivos
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '5px' }}>
          {renderFileTree()}
        </div>
        
        {/* Quest Status Area */}
        {currentQuest && (
          <div style={{ padding: '15px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333' }}>
            <div style={{ fontSize: '11px', color: '#007acc', fontWeight: 'bold', marginBottom: '5px' }}>
              MISSÃO ATUAL ({currentQuest.progress})
            </div>
            <div style={{ fontSize: '13px', color: '#eee' }}>
              {currentQuest.title}
            </div>
          </div>
        )}
      </div>

      {/* Main Terminal Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%' 
      }}>
        <div style={{ 
          height: '35px', 
          backgroundColor: '#2d2d2d', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 15px',
          fontSize: '12px',
          borderBottom: '1px solid #1e1e1e'
        }}>
          <span style={{ color: '#0dbc79', marginRight: '5px' }}>●</span>
          bash — dayhoff@LaBiOmicS
        </div>
        <div 
          ref={terminalRef} 
          style={{ 
            flex: 1, 
            width: '100%',
            padding: '5px',
            boxSizing: 'border-box'
          }} 
        />
      </div>
    </div>
  );
};

export default Terminal;

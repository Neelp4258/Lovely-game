export class DebugPanel {
  constructor() {
    this.logs = [];
    this.maxLogs = 50;
    this.isVisible = false;
    this.createPanel();
    this.captureConsole();
    this.checkGameState();
  }

  createPanel() {
    // Create debug panel HTML
    const panelHTML = `
      <div id="debug-panel" style="display: none;">
        <div class="debug-header">
          <h3>🔧 Debug Console</h3>
          <button id="debug-copy-btn" class="debug-btn">📋 Copy</button>
          <button id="debug-close-btn" class="debug-btn">✕</button>
        </div>
        <div class="debug-status">
          <div id="debug-status-content">Checking...</div>
        </div>
        <div class="debug-logs" id="debug-logs">
          <div class="debug-log">Debug panel initialized...</div>
        </div>
      </div>
      <button id="debug-toggle-btn" class="debug-toggle">🐛 Debug</button>
    `;

    // Add to body
    const container = document.createElement('div');
    container.innerHTML = panelHTML;
    document.body.appendChild(container);

    // Setup event listeners
    this.setupListeners();

    // Add styles
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #debug-panel {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 90%;
        max-width: 400px;
        height: 80vh;
        background: rgba(0, 0, 0, 0.95);
        color: #0f0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 99999;
        border: 2px solid #0f0;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
      }

      .debug-header {
        background: #0a0a0a;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #0f0;
      }

      .debug-header h3 {
        margin: 0;
        font-size: 16px;
        color: #0f0;
      }

      .debug-btn {
        background: #0f0;
        color: #000;
        border: none;
        padding: 5px 10px;
        margin-left: 5px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
      }

      .debug-btn:active {
        background: #0a0;
      }

      .debug-status {
        background: #1a1a1a;
        padding: 10px;
        border-bottom: 1px solid #0f0;
        max-height: 150px;
        overflow-y: auto;
      }

      .debug-status-item {
        margin: 3px 0;
        padding: 3px;
        border-left: 3px solid #0f0;
        padding-left: 8px;
      }

      .debug-status-item.error {
        border-left-color: #f00;
        color: #f00;
      }

      .debug-status-item.success {
        border-left-color: #0f0;
        color: #0f0;
      }

      .debug-status-item.warning {
        border-left-color: #ff0;
        color: #ff0;
      }

      .debug-logs {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
      }

      .debug-log {
        margin: 3px 0;
        padding: 4px;
        border-bottom: 1px solid #333;
        word-wrap: break-word;
      }

      .debug-log.error {
        color: #f00;
        background: rgba(255, 0, 0, 0.1);
        border-left: 3px solid #f00;
        padding-left: 8px;
      }

      .debug-log.warn {
        color: #ff0;
        background: rgba(255, 255, 0, 0.1);
        border-left: 3px solid #ff0;
        padding-left: 8px;
      }

      .debug-log.info {
        color: #0af;
        border-left: 3px solid #0af;
        padding-left: 8px;
      }

      .debug-toggle {
        position: fixed;
        bottom: 80px;
        right: 10px;
        background: rgba(0, 255, 0, 0.9);
        color: #000;
        border: 2px solid #0f0;
        padding: 12px 16px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 99998;
        box-shadow: 0 4px 15px rgba(0, 255, 0, 0.5);
        font-weight: bold;
      }

      .debug-toggle:active {
        background: rgba(0, 200, 0, 0.9);
      }

      @media (max-width: 768px) {
        #debug-panel {
          width: 95%;
          max-width: none;
          right: 2.5%;
          top: 5px;
          height: 85vh;
        }

        .debug-toggle {
          bottom: 90px;
          right: 10px;
          padding: 10px 14px;
          font-size: 18px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupListeners() {
    // Toggle button
    document.getElementById('debug-toggle-btn').addEventListener('click', () => {
      this.toggle();
    });

    // Close button
    document.getElementById('debug-close-btn').addEventListener('click', () => {
      this.hide();
    });

    // Copy button
    document.getElementById('debug-copy-btn').addEventListener('click', () => {
      this.copyToClipboard();
    });
  }

  captureConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      originalLog.apply(console, args);
      this.addLog('log', args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      this.addLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      this.addLog('warn', args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      this.addLog('info', args);
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.addLog('error', ['Uncaught Error:', event.message, 'at', event.filename, event.lineno]);
    });

    // Capture promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addLog('error', ['Unhandled Promise Rejection:', event.reason]);
    });
  }

  addLog(type, args) {
    const timestamp = new Date().toLocaleTimeString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    this.logs.push({ type, message, timestamp });

    // Keep only last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.updateLogDisplay();
  }

  updateLogDisplay() {
    const logsContainer = document.getElementById('debug-logs');
    if (!logsContainer) return;

    logsContainer.innerHTML = this.logs.map(log => {
      return `<div class="debug-log ${log.type}">
        [${log.timestamp}] ${log.message}
      </div>`;
    }).join('');

    // Auto-scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  checkGameState() {
    const updateStatus = () => {
      const status = {
        timestamp: new Date().toLocaleTimeString(),
        threeJS: !!window.THREE,
        game: !!window.game,
        scene: !!window.game?.scene,
        player: !!window.game?.player,
        city: !!window.game?.city,
        running: !!window.game?.isRunning,
        sceneObjects: window.game?.scene?.getScene()?.children?.length || 0,
        currentUser: !!window.currentUser,
        networkConnected: !!window.game?.networkManager?.socket?.connected,
      };

      const statusHTML = `
        <div class="debug-status-item ${status.threeJS ? 'success' : 'error'}">
          Three.js: ${status.threeJS ? '✅' : '❌'}
        </div>
        <div class="debug-status-item ${status.game ? 'success' : 'error'}">
          Game: ${status.game ? '✅' : '❌'}
        </div>
        <div class="debug-status-item ${status.scene ? 'success' : 'error'}">
          Scene: ${status.scene ? '✅' : '❌'}
        </div>
        <div class="debug-status-item ${status.player ? 'success' : 'error'}">
          Player: ${status.player ? '✅' : '❌'}
        </div>
        <div class="debug-status-item ${status.city ? 'success' : 'error'}">
          City: ${status.city ? '✅' : '❌'}
        </div>
        <div class="debug-status-item ${status.running ? 'success' : 'warning'}">
          Running: ${status.running ? '✅' : '⏸️'}
        </div>
        <div class="debug-status-item info">
          Scene Objects: ${status.sceneObjects}
        </div>
        <div class="debug-status-item ${status.currentUser ? 'success' : 'warning'}">
          User: ${status.currentUser ? '✅' : '❌'}
        </div>
        <div class="debug-status-item ${status.networkConnected ? 'success' : 'warning'}">
          Network: ${status.networkConnected ? '✅ Connected' : '⚠️ Disconnected'}
        </div>
        <div class="debug-status-item info">
          Updated: ${status.timestamp}
        </div>
      `;

      const statusContainer = document.getElementById('debug-status-content');
      if (statusContainer) {
        statusContainer.innerHTML = statusHTML;
      }
    };

    // Update immediately
    updateStatus();

    // Update every 2 seconds
    setInterval(updateStatus, 2000);
  }

  toggle() {
    this.isVisible = !this.isVisible;
    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.style.display = this.isVisible ? 'flex' : 'none';
    }
  }

  show() {
    this.isVisible = true;
    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.style.display = 'flex';
    }
  }

  hide() {
    this.isVisible = false;
    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  async copyToClipboard() {
    const debugInfo = this.generateDebugReport();

    try {
      // Try modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(debugInfo);
        this.showCopySuccess();
      } else {
        // Fallback for older browsers/mobile
        const textarea = document.createElement('textarea');
        textarea.value = debugInfo;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showCopySuccess();
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Show debug info in alert as fallback
      alert('Copy this debug info:\n\n' + debugInfo.substring(0, 500) + '...');
    }
  }

  showCopySuccess() {
    const btn = document.getElementById('debug-copy-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✅ Copied!';
      btn.style.background = '#0f0';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#0f0';
      }, 2000);
    }
  }

  generateDebugReport() {
    const status = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      threeJS: !!window.THREE,
      threeVersion: window.THREE?.REVISION || 'N/A',
      game: !!window.game,
      scene: !!window.game?.scene,
      player: !!window.game?.player,
      city: !!window.game?.city,
      running: !!window.game?.isRunning,
      sceneObjects: window.game?.scene?.getScene()?.children?.length || 0,
      currentUser: !!window.currentUser,
      networkConnected: !!window.game?.networkManager?.socket?.connected,
      playerPosition: window.game?.player?.position ?
        `${window.game.player.position.x.toFixed(2)}, ${window.game.player.position.y.toFixed(2)}, ${window.game.player.position.z.toFixed(2)}` :
        'N/A',
      cameraPosition: window.game?.renderer?.getCamera()?.position ?
        `${window.game.renderer.getCamera().position.x.toFixed(2)}, ${window.game.renderer.getCamera().position.y.toFixed(2)}, ${window.game.renderer.getCamera().position.z.toFixed(2)}` :
        'N/A',
    };

    let report = '=== LOVELY CITY DEBUG REPORT ===\n\n';
    report += `Generated: ${status.timestamp}\n`;
    report += `User Agent: ${status.userAgent}\n`;
    report += `Screen: ${status.screenSize}\n\n`;
    report += '=== GAME STATE ===\n';
    report += `Three.js: ${status.threeJS ? '✅' : '❌'} (v${status.threeVersion})\n`;
    report += `Game: ${status.game ? '✅' : '❌'}\n`;
    report += `Scene: ${status.scene ? '✅' : '❌'}\n`;
    report += `Player: ${status.player ? '✅' : '❌'}\n`;
    report += `City: ${status.city ? '✅' : '❌'}\n`;
    report += `Running: ${status.running ? '✅' : '❌'}\n`;
    report += `Scene Objects: ${status.sceneObjects}\n`;
    report += `User Authenticated: ${status.currentUser ? '✅' : '❌'}\n`;
    report += `Network: ${status.networkConnected ? '✅' : '❌'}\n`;
    report += `Player Position: ${status.playerPosition}\n`;
    report += `Camera Position: ${status.cameraPosition}\n\n`;
    report += '=== RECENT LOGS ===\n';
    report += this.logs.slice(-20).map(log => {
      return `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`;
    }).join('\n');

    return report;
  }
}

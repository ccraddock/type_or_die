import { useEffect } from 'react';

export default function GameOver({ stats, wave, onRestart }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  // Accuracy = correctly typed characters / (correct chars + error keystrokes)
  const totalAttempted = (stats.totalChars || 0) + stats.errors;
  const accuracy = totalAttempted > 0 ? Math.round(((stats.totalChars || 0) / totalAttempted) * 100) : 0;

  return (
    <div className="screen gameover-screen">
      <div className="skull-icon">💀</div>
      <h1 className="gameover-title">YOU DIED</h1>
      <p className="gameover-subtitle">The horde got you on Wave {wave}</p>

      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">ZOMBIES KILLED</span>
          <span className="stat-value">{stats.kills}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">TYPING SPEED</span>
          <span className="stat-value">
            {stats.wpm} <small>WPM</small>
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">ACCURACY</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">ERRORS</span>
          <span className="stat-value error-value">{stats.errors}</span>
        </div>
      </div>

      <button className="start-btn" onClick={onRestart}>
        TRY AGAIN
      </button>
      <p className="start-hint">Press ENTER or SPACE to restart</p>
    </div>
  );
}

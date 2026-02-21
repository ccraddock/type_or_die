import { useEffect } from 'react';

export default function StartScreen({ onStart }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onStart]);

  return (
    <div className="screen start-screen">
      <div className="title-container">
        <h1 className="game-title">TYPE OR DIE</h1>
        <p className="game-subtitle">Post-Apocalyptic Typing Game</p>
      </div>

      <div className="instructions">
        <h2 className="instructions-title">HOW TO SURVIVE</h2>
        <ul className="instructions-list">
          <li>🧟 Zombies are approaching — each one carries a word</li>
          <li>⌨️ Type the word to kill the zombie before it reaches you</li>
          <li>🎯 Start typing to automatically target the closest match</li>
          <li>⌫ Backspace clears current input &bull; ESC cancels target</li>
          <li>💀 A single touch from a zombie ends the game</li>
          <li>📈 Speed and numbers increase every 30 seconds</li>
        </ul>
      </div>

      <button className="start-btn" onClick={onStart}>
        SURVIVE
      </button>
      <p className="start-hint">Press ENTER or SPACE to start</p>
    </div>
  );
}

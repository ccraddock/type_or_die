export default function HUD({ wave, stats, typedText }) {
  return (
    <div className="hud">
      <div className="hud-group">
        <div className="hud-item">
          <span className="hud-label">WAVE</span>
          <span className="hud-value wave-value">{wave}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">KILLS</span>
          <span className="hud-value">{stats.kills}</span>
        </div>
      </div>

      <div className="hud-center">
        <div className="hud-typed">{typedText || <span className="hud-cursor">_</span>}</div>
        <div className="hud-label">TYPE TO KILL</div>
      </div>

      <div className="hud-group hud-right">
        <div className="hud-item">
          <span className="hud-label">WPM</span>
          <span className="hud-value">{stats.wpm}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">ERRORS</span>
          <span className="hud-value error-value">{stats.errors}</span>
        </div>
      </div>
    </div>
  );
}

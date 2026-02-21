export default function Zombie({ zombie, targeted, typedText, dying }) {
  const { word, x, y } = zombie;
  const typed = targeted ? typedText : '';
  const remaining = word.slice(typed.length);

  return (
    <div
      className={`zombie${targeted ? ' targeted' : ''}${dying ? ' dying' : ''}`}
      style={{ left: x, top: y }}
    >
      <div className="zombie-word">
        <span className="typed-chars">{typed}</span>
        <span className="remaining-chars">{remaining}</span>
      </div>
      <div className="zombie-figure">🧟</div>
    </div>
  );
}

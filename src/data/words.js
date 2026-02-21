const WORDS_EASY = [
  'flee', 'hide', 'bite', 'hunt', 'rots', 'dead', 'kill', 'moan', 'howl',
  'claw', 'gore', 'bone', 'loot', 'shot', 'fire', 'trap', 'limp', 'gash',
  'haze', 'dusk', 'rust', 'fear', 'dark', 'guts', 'foul', 'grim', 'club',
  'axe', 'run', 'dig', 'rot', 'gut', 'raw', 'cut',
];

const WORDS_MEDIUM = [
  'zombie', 'plague', 'hunter', 'corpse', 'terror', 'hunger', 'escape',
  'bunker', 'supply', 'danger', 'attack', 'defend', 'rescue', 'reload',
  'shelter', 'menace', 'ravage', 'devour', 'undead', 'infect', 'stench',
  'gallop', 'frenzy', 'groans', 'barrel', 'thrash', 'putrid', 'lurch',
  'gnarly', 'shiver', 'cringe', 'stumble', 'lurking', 'creeper',
];

const WORDS_HARD = [
  'outbreak', 'infected', 'barricade', 'survivor', 'shambling', 'carnivore',
  'decompose', 'bloodlust', 'predator', 'quarantine', 'desperate', 'apocalypse',
  'fortified', 'sanctuary', 'desolate', 'overrun', 'decimated', 'reanimated',
  'pestilence', 'onslaught', 'cadaverous', 'devastate', 'rampage', 'undying',
  'scavenger', 'marauder', 'fortitude', 'hunkering',
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getWordForWave(wave) {
  if (wave === 1) {
    return randomFrom(WORDS_EASY);
  } else if (wave <= 3) {
    return randomFrom([...WORDS_EASY, ...WORDS_MEDIUM]);
  } else if (wave <= 6) {
    return randomFrom([...WORDS_MEDIUM, ...WORDS_HARD]);
  } else {
    return randomFrom(WORDS_HARD);
  }
}

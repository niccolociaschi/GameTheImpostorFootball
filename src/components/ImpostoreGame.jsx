import React, { useState, useEffect } from 'react';
import { Play, Plus, ChevronRight, Clock, EyeOff, Settings, Trash2 } from 'lucide-react';

const STORAGE_KEY = “impostore_database”;

const defaultCategories = {
‘Serie A (2024-2025)’: [
{ name: ‘Lautaro Martínez’, clues: [‘Attaccante con velocità esplosiva’, ‘Capitano della nazionale argentina’] },
{ name: ‘Alessandro Bastoni’, clues: [‘Difensore centrale mancino’, ‘Noto per la costruzione dal basso’] },
{ name: ‘Álvaro Morata’, clues: [‘Attaccante spagnolo’, ‘Letale nei duelli aerei’] },
{ name: ‘Juan Cabal’, clues: [‘Terzino sinistro colombiano’, ‘Ha una spinta offensiva impressionante’] },
{ name: ‘Sandro Tonali’, clues: [‘Centrocampista con inserimenti offensivi’, ‘Ha recuperato dopo problemi personali importanti’] },
{ name: ‘Nicolò Barella’, clues: [‘Centrocampista con tecnica raffinata’, ‘Elemento motore del centrocampo’] },
{ name: ‘Khvicha Kvaratskhelia’, clues: [‘Esterno sinistro georgiano’, ‘Dribbler tecnico con velocità eccezionale’] },
{ name: ‘Victor Osimhen’, clues: [‘Attaccante dominante nel gioco aereo’, ‘Ha segnato molti gol in Serie A’] },
{ name: ‘Paulo Dybala’, clues: [‘Trequartista argentino con tocco raffinato’, ‘Esperto di tiri dai 25 metri’] },
{ name: ‘Mateo Retegui’, clues: [‘Attaccante con senso della posizione’, ‘Finalizzatore con entrambi i piedi’] },
{ name: ‘Danilo’, clues: [‘Difensore centrale brasiliano’, ‘Bravo nella lettura del gioco’] },
{ name: ‘Atalanta Lookman’, clues: [‘Esterno nigeriano atalantino’, ‘Letale negli spazi larghi’] },
],
‘Ex Campioni’: [
{ name: ‘Gianluigi Buffon’, clues: [‘Leggendario portiere’, ‘Ha vinto praticamente tutti i trofei calcistici’] },
{ name: ‘Francesco Totti’, clues: [‘Fantasista con visione di gioco eccezionale’, ‘Maestro dei tiri dalla distanza’] },
{ name: ‘Andrea Pirlo’, clues: [‘Centrocampista con lancio lungo chirurgico’, ‘Ha dominato il calcio tattico del suo tempo’] },
{ name: ‘Gianluigi Donnarumma’, clues: [‘Portiere italiano con riflessi straordinari’, ‘Diventato titolare giovanissimo’] },
{ name: ‘Fabio Cannavaro’, clues: [‘Difensore centrale italiano dalle spalle larghe’, ‘Vinto il Pallone d'Oro come difensore’] },
{ name: ‘Roberto Baggio’, clues: [‘Trequartista italiano con raffinatezza tecnica’, ‘Protagonista principale ai Mondiali del 1994’] },
],
‘Allenatori Leggendari’: [
{ name: ‘Carlo Ancelotti’, clues: [‘Ha vinto tre Champions League’, ‘Noto per la serenità in panchina’] },
{ name: ‘Pep Guardiola’, clues: [‘Ha rivoluzionato il calcio tattico’, ‘Vinto moltissimi titoli con diverse squadre’] },
{ name: ‘Sir Alex Ferguson’, clues: [‘Allenatore leggendario che ha dominato un decennio’, ‘Ha creato una vera dinastia calcistica’] },
{ name: ‘José Mourinho’, clues: [‘Allenatore portoghese con grande personalità’, ‘Ha vinto Champions con due squadre europee’] },
{ name: ‘Zinedine Zidane’, clues: [‘Ha vinto tre Champions consecutive’, ‘Ha avuto una carriera da calciatore straordinaria’] },
],
‘Leggende Mondiali’: [
{ name: ‘Diego Maradona’, clues: [‘Numero 10 con dribbling ineguagliabile’, ‘Trascinò da solo il suo paese al titolo mondiale’] },
{ name: ‘Pelé’, clues: [‘Attaccante brasiliano con incredibile prolificità’, ‘Vinto tre Mondiali per il suo paese’] },
{ name: ‘Ronaldo (Fenômeno)’, clues: [‘Attaccante brasiliano con velocità e potenza fisica’, ‘Due volte campione del mondo’] },
{ name: ‘Ronaldinho’, clues: [‘Fantasista brasiliano con dribbling spettacolare’, ‘Ha illuminato il calcio mondiale con la sua arte’] },
{ name: ‘Johan Cruyff’, clues: [‘Ala olandese rivoluzionaria’, ‘Fondatore della scuola calcistica olandese moderna’] },
],
};

export default function ImpostoreGame() {
// ============ CARICAMENTO DATABASE ============
const [categories, setCategories] = useState(() => {
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
try {
return JSON.parse(saved);
} catch {
return defaultCategories;
}
}
return defaultCategories;
});

// ============ SALVATAGGIO AUTOMATICO ============
useEffect(() => {
localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}, [categories]);

// ============ STATE ============
const [gamePhase, setGamePhase] = useState(‘setup’);
const [players, setPlayers] = useState([]);
const [newPlayerName, setNewPlayerName] = useState(’’);
const [editingPlayer, setEditingPlayer] = useState(null);
const [selectedCategory, setSelectedCategory] = useState(null);
const [selectedPlayer, setSelectedPlayer] = useState(null);
const [impostor, setImpostor] = useState(null);
const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
const [revealed, setRevealed] = useState(null);
const [timerStarted, setTimerStarted] = useState(false);
const [elapsedTime, setElapsedTime] = useState(0);
const [playerColors, setPlayerColors] = useState({});
const [newCustomPlayer, setNewCustomPlayer] = useState({ name: ‘’, clue1: ‘’, clue2: ‘’ });
const [showCustomInput, setShowCustomInput] = useState(false);
const [customCategory, setCustomCategory] = useState(’’);
const [newCategoryName, setNewCategoryName] = useState(’’);
const [playerImages, setPlayerImages] = useState({});

const fetchPlayerImage = async (playerName) => {
if (playerImages[playerName]) return playerImages[playerName];
try {
const response = await fetch(
`https://www.wikidata.org/w/api.php?action=query&format=json&search=${encodeURIComponent(playerName)}&srsort=relevance&srprop=snippet&srlimit=1`
);
const data = await response.json();
if (data.query.search.length > 0) {
const entityId = data.query.search[0].title;
const entityResponse = await fetch(
`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&format=json&props=claims`
);
const entityData = await entityResponse.json();
const entity = entityData.entities[entityId];
if (entity.claims.P18 && entity.claims.P18[0]) {
const imageTitle = entity.claims.P18[0].mainsnak.datavalue.value;
const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${imageTitle}&prop=imageinfo&iiprop=url&format=json`;
const imageResponse = await fetch(imageUrl);
const imageData = await imageResponse.json();
for (const page of Object.values(imageData.query.pages)) {
if (page.imageinfo) {
const url = page.imageinfo[0].url;
setPlayerImages(prev => ({ …prev, [playerName]: url }));
return url;
}
}
}
}
} catch (error) {
console.error(‘Errore:’, error);
}
return null;
};

useEffect(() => {
if (!timerStarted) return;
const interval = setInterval(() => {
setElapsedTime(prev => prev + 1);
}, 1000);
return () => clearInterval(interval);
}, [timerStarted]);

const generateColor = (playerName) => {
if (playerColors[playerName]) return playerColors[playerName];
const colors = [’#FF6B6B’, ‘#4ECDC4’, ‘#45B7D1’, ‘#FFA07A’, ‘#98D8C8’, ‘#F7DC6F’, ‘#BB8FCE’, ‘#85C1E2’, ‘#F8B88B’, ‘#52C41A’];
const color = colors[Object.keys(playerColors).length % colors.length];
setPlayerColors(prev => ({ …prev, [playerName]: color }));
return color;
};

const formatTime = (seconds) => {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const startGame = () => {
if (players.length < 2) {
alert(‘Aggiungi almeno 2 giocatori!’);
return;
}
setGamePhase(‘categorySelect’);
};

const selectCategory = (categoryName) => {
const categoryPlayers = categories[categoryName];
const randomPlayer = categoryPlayers[Math.floor(Math.random() * categoryPlayers.length)];
setSelectedPlayer(randomPlayer);
setSelectedCategory(categoryName);
setImpostor(Math.floor(Math.random() * players.length));
setCurrentPlayerIndex(0);
setGamePhase(‘gameDisplay’);
players.forEach(p => generateColor(p));
fetchPlayerImage(randomPlayer.name);
};

const nextPlayer = () => {
if (currentPlayerIndex < players.length - 1) {
setCurrentPlayerIndex(prev => prev + 1);
} else {
setTimerStarted(true);
setGamePhase(‘lobby’);
}
};

const addPlayer = () => {
if (newPlayerName.trim()) {
setPlayers([…players, newPlayerName.trim()]);
setNewPlayerName(’’);
}
};

const removePlayer = (index) => {
setPlayers(players.filter((_, i) => i !== index));
};

const addCustomPlayer = () => {
if (newCustomPlayer.name.trim() && newCustomPlayer.clue1.trim() && newCustomPlayer.clue2.trim() && customCategory) {
const catToUse = customCategory === ‘new’ ? newCategoryName : customCategory;
setCategories(prev => {
const updated = { …prev };
if (!updated[catToUse]) updated[catToUse] = [];
updated[catToUse].push({
name: newCustomPlayer.name,
clues: [newCustomPlayer.clue1, newCustomPlayer.clue2]
});
return updated;
});
if (customCategory === ‘new’) {
setNewCategoryName(’’);
}
setNewCustomPlayer({ name: ‘’, clue1: ‘’, clue2: ‘’ });
setShowCustomInput(false);
setCustomCategory(’’);
}
};

const saveEdit = () => {
if (!editingPlayer) return;
const { catIndex, playerIndex, name, clue1, clue2 } = editingPlayer;
const catNames = Object.keys(categories);
const catName = catNames[catIndex];
setCategories(prev => {
const updated = { …prev };
updated[catName][playerIndex] = { name, clues: [clue1, clue2] };
return updated;
});
setEditingPlayer(null);
};

const deletePlayer = (catIndex, playerIndex) => {
const catNames = Object.keys(categories);
const catName = catNames[catIndex];
setCategories(prev => {
const updated = { …prev };
updated[catName].splice(playerIndex, 1);
return updated;
});
};

// ============ RENDER: SETUP ============
if (gamePhase === ‘setup’) {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
<style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;600;700&display=swap'); * { font-family: 'Outfit', sans-serif; } .mono { font-family: 'Space Mono', monospace; }`}</style>
<div className="w-full max-w-md">
<div className="text-center mb-8">
<h1 className="text-5xl font-bold text-white mb-2 mono">IMPOSTORE</h1>
<p className="text-slate-400 text-sm tracking-widest uppercase">Chi indovina il misterioso?</p>
</div>

```
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-6">
        <label className="block text-slate-300 text-sm font-medium mb-3">Aggiungi Giocatori</label>
        <div className="flex gap-2 mb-4">
          <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addPlayer()} placeholder="Nome giocatore..." className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
          <button onClick={addPlayer} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"><Plus size={18} /></button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {players.map((player, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: generateColor(player) }} />
                <span className="text-white text-sm">{player}</span>
              </div>
              <button onClick={() => removePlayer(idx)} className="text-slate-500 hover:text-red-400 transition text-sm">✕</button>
            </div>
          ))}
        </div>
        <div className="text-slate-500 text-xs mt-4 text-center">{players.length} giocatore{players.length !== 1 ? 'i' : ''}</div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setShowCustomInput(!showCustomInput)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2 border border-slate-600"><Plus size={18} />Custom</button>
        <button onClick={() => setGamePhase('database')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2 border border-slate-600"><Settings size={18} />DB</button>
      </div>

      {showCustomInput && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mb-6">
          <input type="text" placeholder="Nome" value={newCustomPlayer.name} onChange={(e) => setNewCustomPlayer({ ...newCustomPlayer, name: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 mb-3 focus:outline-none focus:border-blue-500 transition text-sm" />
          <textarea placeholder="Indizio 1" value={newCustomPlayer.clue1} onChange={(e) => setNewCustomPlayer({ ...newCustomPlayer, clue1: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 mb-3 focus:outline-none focus:border-blue-500 transition text-sm resize-none" rows="2" />
          <textarea placeholder="Indizio 2" value={newCustomPlayer.clue2} onChange={(e) => setNewCustomPlayer({ ...newCustomPlayer, clue2: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 mb-3 focus:outline-none focus:border-blue-500 transition text-sm resize-none" rows="2" />
          <select value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white mb-3 focus:outline-none focus:border-blue-500 transition text-sm">
            <option value="">Seleziona categoria</option>
            {Object.keys(categories).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
          <button onClick={addCustomPlayer} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm font-medium">Salva</button>
        </div>
      )}

      <button onClick={startGame} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-3"><Play size={20} />INIZIA</button>
    </div>
  </div>
);
```

}

if (gamePhase === ‘categorySelect’) {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
<div className="w-full max-w-md">
<button onClick={() => setGamePhase(‘setup’)} className=“text-slate-400 hover:text-white mb-8 transition flex items-center gap-2 text-sm”>← Indietro</button>
<div className="text-center mb-8">
<h2 className="text-3xl font-bold text-white mb-2 mono">CATEGORIA</h2>
<p className="text-slate-400 text-xs tracking-widest uppercase">Da dove viene il mistero?</p>
</div>
<div className="space-y-3">
{Object.keys(categories).map(cat => (
<button key={cat} onClick={() => selectCategory(cat)} className=“w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-lg p-4 text-white transition text-left flex items-center justify-between group”>
<span className="font-medium text-sm">{cat}</span>
<ChevronRight size={18} className="group-hover:translate-x-1 transition" />
</button>
))}
</div>
</div>
</div>
);
}

if (gamePhase === ‘gameDisplay’) {
const currentPlayer = players[currentPlayerIndex];
const isImpostor = currentPlayerIndex === impostor;
const roleText = isImpostor ? “Sei l’IMPOSTORE” : `Il calciatore è:\n${selectedPlayer.name}`;
const playerImage = playerImages[selectedPlayer.name];

```
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <p className="text-slate-500 text-sm mb-2">Giocatore {currentPlayerIndex + 1}/{players.length}</p>
        <div className="w-12 h-12 rounded-full mx-auto mb-6" style={{ backgroundColor: generateColor(currentPlayer) }} />
        <h2 className="text-2xl font-bold text-white mono mb-2">{currentPlayer}</h2>
      </div>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 mb-8 min-h-64 flex items-center justify-center">
        <div className="text-center cursor-pointer select-none group w-full" onClick={() => setRevealed(!revealed)}>
          {!revealed ? (
            <div className="flex flex-col items-center gap-4">
              <EyeOff size={48} className="text-slate-600 group-hover:text-slate-400 transition" />
              <p className="text-slate-400 text-sm font-medium">Premi per rivelare</p>
            </div>
          ) : (
            <div>
              {!isImpostor && playerImage && (<div className="mb-6"><img src={playerImage} alt={selectedPlayer.name} className="w-full h-48 object-cover rounded-lg mb-4" /></div>)}
              <p className="text-white text-sm whitespace-pre-line font-mono font-bold text-2xl mb-6 leading-relaxed">{roleText}</p>
              {isImpostor && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-slate-400 text-xs mb-3 uppercase tracking-widest">Indizi:</p>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p>• {selectedPlayer.clues[0]}</p>
                    <p>• {selectedPlayer.clues[1]}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button onClick={() => { setRevealed(false); nextPlayer(); }} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-lg transition">{currentPlayerIndex === players.length - 1 ? 'LOBBY' : 'AVANTI'}</button>
    </div>
  </div>
);
```

}

if (gamePhase === ‘lobby’) {
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
<div className="w-full max-w-2xl">
<div className="text-center mb-12">
<h2 className="text-4xl font-bold text-white mono mb-4">DISCUSSIONE</h2>
<div className="flex items-center justify-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-4 w-fit mx-auto">
<Clock size={20} className="text-blue-400" />
<span className="text-2xl font-mono text-white font-bold">{formatTime(elapsedTime)}</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
{players.map((player, idx) => (
<div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center hover:border-slate-600 transition">
<div className=“w-8 h-8 rounded-full mx-auto mb-2” style={{ backgroundColor: generateColor(player) }} />
<p className="text-white text-sm font-medium">{player}</p>
</div>
))}
</div>
<div className="text-center">
<p className="text-slate-400 text-sm mb-6 uppercase tracking-widest">Categoria: {selectedCategory}</p>
<button onClick={() => setGamePhase(‘reveal’)} className=“bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 mb-4”>RIVELA!</button>
</div>
</div>
</div>
);
}

if (gamePhase === ‘database’) {
const categoryNames = Object.keys(categories);
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
<button onClick={() => setGamePhase(‘setup’)} className=“text-slate-400 hover:text-white mb-6 transition flex items-center gap-2 text-sm”>← Setup</button>
<h2 className="text-3xl font-bold text-white mono text-center mb-6">DATABASE</h2>
<div className="max-w-4xl mx-auto space-y-6 max-h-screen overflow-y-auto pb-6">
{editingPlayer && (
<div className="bg-blue-900/50 border border-blue-500 rounded-xl p-6 sticky top-0 z-10">
<h3 className="text-white font-bold mb-4">Modifica Giocatore</h3>
<input type=“text” placeholder=“Nome” value={editingPlayer.name} onChange={(e) => setEditingPlayer({ …editingPlayer, name: e.target.value })} className=“w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 mb-3 focus:outline-none focus:border-blue-500 transition” />
<textarea placeholder=“Indizio 1” value={editingPlayer.clue1} onChange={(e) => setEditingPlayer({ …editingPlayer, clue1: e.target.value })} className=“w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 mb-3 focus:outline-none focus:border-blue-500 transition resize-none” rows=“2” />
<textarea placeholder=“Indizio 2” value={editingPlayer.clue2} onChange={(e) => setEditingPlayer({ …editingPlayer, clue2: e.target.value })} className=“w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 mb-3 focus:outline-none focus:border-blue-500 transition resize-none” rows=“2” />
<div className="flex gap-3">
<button onClick={saveEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium">Salva</button>
<button onClick={() => setEditingPlayer(null)} className=“flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition”>Annulla</button>
</div>
</div>
)}
{categoryNames.map((catName, catIndex) => (
<div key={catName} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
<h3 className="text-xl font-bold text-white mb-4 mono">{catName}</h3>
{categories[catName].length === 0 ? (
<p className="text-slate-500 text-sm italic">Vuoto</p>
) : (
<div className="space-y-3">
{categories[catName].map((player, playerIndex) => (
<div key={playerIndex} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
<div className="flex items-start justify-between mb-3">
<p className="text-white font-semibold text-sm">{player.name}</p>
<div className="flex gap-2">
<button onClick={() => setEditingPlayer({ catIndex, playerIndex, name: player.name, clue1: player.clues[0], clue2: player.clues[1] })} className=“bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition”>Modifica</button>
<button onClick={() => deletePlayer(catIndex, playerIndex)} className=“bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition flex items-center gap-1”><Trash2 size={14} /></button>
</div>
</div>
<div className="bg-slate-800 rounded p-2 space-y-1">
<p className="text-slate-300 text-xs"><span className="text-slate-500">1:</span> {player.clues[0]}</p>
<p className="text-slate-300 text-xs"><span className="text-slate-500">2:</span> {player.clues[1]}</p>
</div>
</div>
))}
</div>
)}
</div>
))}
</div>
</div>
);
}

if (gamePhase === ‘reveal’) {
const playerImage = playerImages[selectedPlayer.name];
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
<div className="w-full max-w-2xl">
<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
{players.map((player, idx) => (
<div key={idx} className={`rounded-lg p-4 text-center transition ${idx === impostor ? 'bg-red-900/50 border-2 border-red-500' : 'bg-slate-800/50 border border-slate-700'}`}>
<div className=“w-8 h-8 rounded-full mx-auto mb-2” style={{ backgroundColor: generateColor(player) }} />
<p className="text-white text-sm font-medium">{player}</p>
{idx === impostor && <p className="text-red-400 text-xs mt-2 font-bold">IMPOSTORE</p>}
</div>
))}
</div>
<div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 text-center mb-8">
<h2 className="text-3xl font-bold text-white mono mb-6">IL MISTERO</h2>
{playerImage && (<div className="mb-6"><img src={playerImage} alt={selectedPlayer.name} className="w-full h-48 object-cover rounded-lg mb-4" /></div>)}
<p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mono">{selectedPlayer.name}</p>
<p className="text-slate-400 text-sm mt-4 uppercase tracking-widest">{selectedCategory}</p>
<div className="bg-slate-900/50 rounded-lg p-4 mt-6">
<p className="text-slate-300 text-xs mb-3 uppercase tracking-widest">Indizi:</p>
<div className="space-y-2 text-slate-200 text-sm">
<p>✓ {selectedPlayer.clues[0]}</p>
<p>✓ {selectedPlayer.clues[1]}</p>
</div>
</div>
</div>
<div className="flex flex-col gap-3">
<button onClick={() => { setImpostor(Math.floor(Math.random() * players.length)); setCurrentPlayerIndex(0); setRevealed(null); setTimerStarted(false); setElapsedTime(0); setGamePhase(‘categorySelect’); }} className=“bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-lg transition”>NUOVA</button>
<button onClick={() => setGamePhase(‘setup’)} className=“bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-lg transition border border-slate-600”>MENU</button>
</div>
</div>
</div>
);
}

return null;
}

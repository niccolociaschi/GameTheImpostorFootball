import React, { useState, useEffect } from "react";
import { Play, Plus, ChevronRight, Clock, EyeOff, Settings, Trash2 } from "lucide-react";

const STORAGE_KEY = "impostore_database";

const defaultCategories = {
  "Serie A (2024-2025)": [
    { name: "Lautaro Martínez", clues: ["Attaccante con velocità esplosiva", "Capitano della nazionale argentina"] },
    { name: "Alessandro Bastoni", clues: ["Difensore centrale mancino", "Noto per la costruzione dal basso"] },
    { name: "Álvaro Morata", clues: ["Attaccante spagnolo", "Letale nei duelli aerei"] },
    { name: "Juan Cabal", clues: ["Terzino sinistro colombiano", "Grande spinta offensiva"] },
    { name: "Sandro Tonali", clues: ["Centrocampista completo", "Grande capacità di inserimento"] },
    { name: "Nicolò Barella", clues: ["Centrocampista tecnico", "Motore del centrocampo"] },
    { name: "Khvicha Kvaratskhelia", clues: ["Esterno georgiano", "Dribbling e velocità impressionanti"] },
    { name: "Victor Osimhen", clues: ["Attaccante nigeriano", "Dominante nel gioco aereo"] },
    { name: "Paulo Dybala", clues: ["Trequartista argentino", "Grande tiro dalla distanza"] },
    { name: "Mateo Retegui", clues: ["Attaccante della nazionale italiana", "Finalizzatore d'area"] },
    { name: "Danilo", clues: ["Difensore brasiliano", "Grande esperienza internazionale"] },
    { name: "Ademola Lookman", clues: ["Esterno offensivo", "Rapidità e dribbling"] }
  ],

  "Ex Campioni": [
    { name: "Gianluigi Buffon", clues: ["Portiere leggendario", "Campione del mondo 2006"] },
    { name: "Francesco Totti", clues: ["Bandiera della Roma", "Numero 10 iconico"] },
    { name: "Andrea Pirlo", clues: ["Regista straordinario", "Precisione nei lanci lunghi"] },
    { name: "Fabio Cannavaro", clues: ["Difensore centrale", "Pallone d'Oro 2006"] },
    { name: "Roberto Baggio", clues: ["Trequartista italiano", "Codino iconico"] }
  ],

  "Allenatori Leggendari": [
    { name: "Carlo Ancelotti", clues: ["Allenatore italiano", "Molte Champions League vinte"] },
    { name: "Pep Guardiola", clues: ["Allenatore spagnolo", "Calcio basato sul possesso"] },
    { name: "Sir Alex Ferguson", clues: ["Storico allenatore del Manchester United", "Dominio in Premier League"] },
    { name: "José Mourinho", clues: ["Allenatore portoghese", "Specialista delle finali"] },
    { name: "Zinedine Zidane", clues: ["Ex campione francese", "Tre Champions consecutive da allenatore"] }
  ],

  "Leggende Mondiali": [
    { name: "Diego Maradona", clues: ["Numero 10 argentino", "Mondiale 1986"] },
    { name: "Pelé", clues: ["Attaccante brasiliano", "Tre mondiali vinti"] },
    { name: "Ronaldo Nazário", clues: ["Fenomeno brasiliano", "Due mondiali vinti"] },
    { name: "Ronaldinho", clues: ["Fantasia brasiliana", "Dribbling spettacolari"] },
    { name: "Johan Cruyff", clues: ["Olandese leggendario", "Padre del calcio totale"] }
  ]
};

export default function ImpostoreGame() {

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [gamePhase, setGamePhase] = useState("setup");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [impostor, setImpostor] = useState(null);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const [timerStarted, setTimerStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!timerStarted) return;
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
  };

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index) => {
    setPlayers(players.filter((_,i)=> i !== index));
  };

  const startGame = () => {
    if(players.length < 2){
      alert("Servono almeno 2 giocatori");
      return;
    }
    setGamePhase("categorySelect");
  };

  const selectCategory = (cat) => {
    const list = categories[cat];
    const random = list[Math.floor(Math.random()*list.length)];

    setSelectedCategory(cat);
    setSelectedPlayer(random);
    setImpostor(Math.floor(Math.random()*players.length));

    setCurrentPlayerIndex(0);
    setGamePhase("game");
  };

  const nextPlayer = () => {
    if(currentPlayerIndex < players.length-1){
      setCurrentPlayerIndex(prev => prev + 1);
      setRevealed(false);
    } else {
      setGamePhase("lobby");
      setTimerStarted(true);
    }
  };

  if(gamePhase === "setup"){
    return(
      <div style={{padding:40}}>
        <h1>IMPOSTORE</h1>

        <input
        value={newPlayerName}
        onChange={(e)=>setNewPlayerName(e.target.value)}
        placeholder="Nome giocatore"
        />

        <button onClick={addPlayer}>Aggiungi</button>

        <ul>
        {players.map((p,i)=>(
          <li key={i}>
            {p}
            <button onClick={()=>removePlayer(i)}>X</button>
          </li>
        ))}
        </ul>

        <button onClick={startGame}>Inizia</button>
      </div>
    )
  }

  if(gamePhase === "categorySelect"){
    return(
      <div style={{padding:40}}>
        <h2>Scegli categoria</h2>

        {Object.keys(categories).map(cat=>(
          <button key={cat} onClick={()=>selectCategory(cat)}>
            {cat}
          </button>
        ))}

      </div>
    )
  }

  if(gamePhase === "game"){

    const currentPlayer = players[currentPlayerIndex];
    const isImpostor = currentPlayerIndex === impostor;

    return(
      <div style={{padding:40}}>

        <h2>{currentPlayer}</h2>

        {!revealed ? (
          <button onClick={()=>setRevealed(true)}>
            Rivela
          </button>
        ) : (

          <div>
            {isImpostor ? (
              <h3>Sei l'IMPOSTORE</h3>
            ):(
              <div>
                <h3>{selectedPlayer.name}</h3>
                <p>{selectedPlayer.clues[0]}</p>
                <p>{selectedPlayer.clues[1]}</p>
              </div>
            )}
          </div>

        )}

        <button onClick={nextPlayer}>Avanti</button>

      </div>
    )
  }

  if(gamePhase === "lobby"){
    return(
      <div style={{padding:40}}>
        <h2>Discussione</h2>
        <h3>{formatTime(elapsedTime)}</h3>

        <button onClick={()=>setGamePhase("reveal")}>
          Rivela
        </button>
      </div>
    )
  }

  if(gamePhase === "reveal"){
    return(
      <div style={{padding:40}}>

        <h2>Il giocatore era</h2>
        <h1>{selectedPlayer.name}</h1>

        <p>{selectedPlayer.clues[0]}</p>
        <p>{selectedPlayer.clues[1]}</p>

        <button onClick={()=>setGamePhase("setup")}>
          Nuova partita
        </button>

      </div>
    )
  }

  return null;
}

import React, { useState } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState('');
  const [games, setGames] = useState([]);
  const [gameData, setGameData] = useState({ name: '', creator: '', duration: '', minPlayers: '', maxPlayers: '' });
  const [schedule, setSchedule] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGameData({ ...gameData, [name]: value });
  };

  const addGame = () => {
    setGames([...games, { ...gameData, id: games.length }]);
    setGameData({ name: '', creator: '', duration: '', minPlayers: '', maxPlayers: '' });
  };

  const generateSchedule = () => {
    const studentList = students.split(',').map(s => s.trim());
    const slots = Array.from({ length: 2 }, () => []);
    const unassignedGames = [];
    const assignedPlayers = [[], []]; // Track assigned players for each slot

    games.forEach(game => {
      // Ensure the creator is excluded from the pool of available students for other games
      const availableStudentsSlot1 = studentList.filter(student => student !== game.creator && !assignedPlayers[0].includes(student));
      const availableStudentsSlot2 = studentList.filter(student => student !== game.creator && !assignedPlayers[1].includes(student));

      let assigned = false;

      if (game.duration > 60) {
        const availableStudents = availableStudentsSlot1.filter(student => availableStudentsSlot2.includes(student));
        const randomStudents = shuffle(availableStudents).slice(0, game.maxPlayers - 1);

        if (randomStudents.length >= game.minPlayers - 1) {
          slots[0].push({ ...game, players: [game.creator, ...randomStudents] });
          slots[1].push({ ...game, players: [game.creator, ...randomStudents] });
          assignedPlayers[0].push(game.creator, ...randomStudents);
          assignedPlayers[1].push(game.creator, ...randomStudents);
          assigned = true;
        }
      }

      if (!assigned) {
        const slotIndex = slots[0].length <= slots[1].length ? 0 : 1;
        const availableStudents = slotIndex === 0 ? availableStudentsSlot1 : availableStudentsSlot2;
        const randomStudents = shuffle(availableStudents).slice(0, game.maxPlayers - 1);

        if (randomStudents.length >= game.minPlayers - 1) {
          slots[slotIndex].push({ ...game, players: [game.creator, ...randomStudents] });
          assignedPlayers[slotIndex].push(game.creator, ...randomStudents);
        } else {
          const alternativeSlotIndex = slotIndex === 0 ? 1 : 0;
          const alternativeStudents = alternativeSlotIndex === 0 ? availableStudentsSlot1 : availableStudentsSlot2;
          const randomAlternativeStudents = shuffle(alternativeStudents).slice(0, game.maxPlayers - 1);

          if (randomAlternativeStudents.length >= game.minPlayers - 1) {
            slots[alternativeSlotIndex].push({ ...game, players: [game.creator, ...randomAlternativeStudents] });
            assignedPlayers[alternativeSlotIndex].push(game.creator, ...randomAlternativeStudents);
          } else {
            // If the game can't be scheduled, mark it as unassigned
            unassignedGames.push(game);
          }
        }
      }
    });

    setSchedule({ slots, unassignedGames });
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <div className="App">
      <h1>Playtesting Scheduler</h1>
      <div>
        <h2>Enter Students (comma separated):</h2>
        <textarea
          value={students}
          onChange={(e) => setStudents(e.target.value)}
          placeholder="e.g. John, Jane, Alice, Bob"
        />
      </div>
      <div>
        <h2>Add Game</h2>
        <input
          type="text"
          name="name"
          value={gameData.name}
          onChange={handleInputChange}
          placeholder="Game Name"
        />
        <input
          type="text"
          name="creator"
          value={gameData.creator}
          onChange={handleInputChange}
          placeholder="Creator"
        />
        <input
          type="number"
          name="duration"
          value={gameData.duration}
          onChange={handleInputChange}
          placeholder="Duration (minutes)"
        />
        <input
          type="number"
          name="minPlayers"
          value={gameData.minPlayers}
          onChange={handleInputChange}
          placeholder="Min Players"
        />
        <input
          type="number"
          name="maxPlayers"
          value={gameData.maxPlayers}
          onChange={handleInputChange}
          placeholder="Max Players"
        />
        <button onClick={addGame}>Add Game</button>
      </div>

      <h2>Games List</h2>
      {games.length > 0 && (
        <ul>
          {games.map((game, index) => (
            <li key={index}>
              <strong>{game.name}</strong> by {game.creator} - Duration: {game.duration} minutes, Players: {game.minPlayers}-{game.maxPlayers}
            </li>
          ))}
        </ul>
      )}

      <button onClick={generateSchedule}>Generate Schedule</button>

      {schedule && (
        <div>
          <h2>Schedule</h2>
          {schedule.slots.map((slot, index) => (
            <div key={index}>
              <h3>Slot {index + 1}</h3>
              {slot.length > 0 ? (
                slot.map((game, gameIndex) => (
                  <div key={gameIndex}>
                    <p><strong>{game.name}</strong> by {game.creator}</p>
                    <p>Plays per Hour: {Math.floor(60 / game.duration)}</p>
                    <p>Players: {game.players.join(', ')}</p>
                  </div>
                ))
              ) : (
                <p>No games scheduled</p>
              )}
            </div>
          ))}
          {schedule.unassignedGames.length > 0 && (
            <div>
              <h2>Unassigned Games</h2>
              {schedule.unassignedGames.map((game, index) => (
                <div key={index}>
                  <p><strong>{game.name}</strong> by {game.creator}</p>
                  <p>Min Players: {game.minPlayers}, Max Players: {game.maxPlayers}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

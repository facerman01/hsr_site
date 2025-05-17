import { useState } from "react";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";
import characters from './Characters';
import { useLocation, useNavigate } from 'react-router-dom';

const unitPool = characters.map(c => c.name);

const calculateCost = (bid, eidolon, doNotOwnCount, isLimited5Cost) => 
  isLimited5Cost ? bid + eidolon * 50 + doNotOwnCount * 100 : bid + doNotOwnCount * 100;


export default function AuctionDraft() {
  const location = useLocation();
  const navigate = useNavigate();
  const names = location.state?.names;

  if (!names || names.length !== 4) {
    // Redirect back if no valid names passed
    navigate("/", { replace: true });
    return null;
  }

  // Create players array with random order
  const randomizePlayers = names
    .map((name, index) => ({
      id: index + 1,
      name,
      budget: 1000,
      team: [],
    }))
    .sort(() => Math.random() - 0.5);


  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [players, setPlayers] = useState(randomizePlayers);
  const [bids, setBids] = useState(Array(4).fill(""));
  const [draftHistory, setDraftHistory] = useState([]);
  const [eidolonInputs, setEidolonInputs] = useState(Array(4).fill(""));
  const [playerNames, setPlayerNames] = useState(players.map(p => p.name));
  const [availableUnits, setAvailableUnits] = useState(unitPool);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [doNotOwn, setDoNotOwn] = useState(Array(4).fill(false));
  const allTeamsFull = players.every(p => p.team.length >= 4);
  const [history, setHistory] = useState([]);  

  const getNextAvailablePlayerIndex = (startIndex, players) => {
    const totalPlayers = players.length;
    let nextIndex = (startIndex + 1) % totalPlayers;
  
    while (players[nextIndex].team.length >= 4) {
      nextIndex = (nextIndex + 1) % totalPlayers;
      if (nextIndex === startIndex) {
        // All players have full teams
        return null;
      }
    }
  
    return nextIndex;
  };  
  

  const handleBidSubmit = () => {
    if (!selectedUnit) return;

      // Save current state before making changes
      // Save current state before making changes
      setHistory(prev => [...prev, {
        players: JSON.parse(JSON.stringify(players)),
        availableUnits: [...availableUnits],
        draftHistory: [...draftHistory],
        currentPlayerIndex,  // <-- Add this
      }]);


    const numericBids = bids.map(b => parseInt(b) || 0);
    const eidolons = eidolonInputs.map(e => parseInt(e) || 0);
    const doNotOwnCount = doNotOwn.filter(Boolean).length;
    
    
    const validBids = players.map((p, i) => {
      if (p.team.length >= 4) return null; // skip if team full
      if (p.budget < 100) return null; //skip if broke
      if (numericBids[i] === 0) return null;
      const totalCost = calculateCost(numericBids[i], eidolons[i], doNotOwnCount, selectedUnit.limited5Cost);
      return (p.budget >= totalCost) ? {
        player: p,
        bid: numericBids[i],
        totalCost,
        eidolon: eidolons[i],
        idx: i
      } : null;
    }).filter(Boolean);
    

    let highest = null;
    for (let entry of validBids) {
      if (!highest || entry.bid > highest.bid) {
        highest = entry;
      }
    }
    if (!highest) {
      const fallbackIndex = numericBids.findIndex((bid, i) =>
        bid === 100 &&
        players[i].budget < 100 &&
        players[i].team.length < 4
      );
      if (fallbackIndex !== -1) {
        const updatedPlayers = [...players];
        updatedPlayers[fallbackIndex] = {
          ...updatedPlayers[fallbackIndex],
          team: [...updatedPlayers[fallbackIndex].team, { name: selectedUnit.name, eidolon: eidolons[fallbackIndex], image: selectedUnit.image }],
        };
        setPlayers(updatedPlayers);
        const nextIndex = getNextAvailablePlayerIndex(currentPlayerIndex, updatedPlayers);
        if (nextIndex !== null) {
          setCurrentPlayerIndex(nextIndex);
        }
        setDraftHistory(prev => [
          ...prev,
          { unit: { name: selectedUnit.name, eidolon: 0 }, winner: players[fallbackIndex], bid: 0, fallback: true }
        ]);
      }
      else {
        return;
      }
    } else {
      const updatedPlayers = players.map(p =>
        p.id === highest.player.id
          ? {
              ...p,
              name: playerNames[highest.idx],
              budget: p.budget - highest.totalCost,
              team: [...p.team, { name: selectedUnit.name, eidolon: highest.eidolon, image: selectedUnit.image }],
            }
          : p
      );
      setPlayers(updatedPlayers);
      const nextIndex = getNextAvailablePlayerIndex(currentPlayerIndex, updatedPlayers);
      if (nextIndex !== null) {
        setCurrentPlayerIndex(nextIndex);
      }
      setDraftHistory(prev => [
        ...prev,
        { unit: { name: selectedUnit.name, eidolon: highest.eidolon }, winner: { ...highest.player, name: playerNames[highest.idx] }, bid: highest.bid, fallback: false }
      ]);
    }

    setAvailableUnits(prev => prev.filter(u => u !== selectedUnit.name));
    setSelectedUnit(null);
    setBids(Array(4).fill(""));
    setEidolonInputs(Array(4).fill(""));
    setDoNotOwn(Array(4).fill(false));
    if (allTeamsFull){
      setCurrentPlayerIndex(0);
    }



  };

  //undo function
  const handleUndo = () => {
    if (history.length === 0) return;
  
    const lastState = history[history.length - 1];
    setPlayers(lastState.players);
    setAvailableUnits(lastState.availableUnits);
    setDraftHistory(lastState.draftHistory);
    setCurrentPlayerIndex(lastState.currentPlayerIndex);  // <-- Restore it
    setHistory(prev => prev.slice(0, -1));
  };
  
  


  if (allTeamsFull) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6 bg-gray-50">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Draft Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((p, i) => (
              <Card key={p.id} className="bg-gray-100 shadow-md w-full h-auto">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{playerNames[i]}</h3>
                  <p className="mb-2"><span className="font-semibold">Budget Left:</span> ${p.budget}</p>
                  <p className="mb-2"><span className="font-semibold">Cycle Deduction: -</span>{Math.min(p.budget / 100.0, 3.0).toFixed(2)}</p>
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="font-semibold mb-1">Team:</p>
                    {p.team.length > 0 ? (
                      <ul className="list-disc">
                        {p.team.map((u, idx) => (
                          <li key={idx} className="flex items-center justify-start">
                          <span>{u.name} (E{u.eidolon})</span>
                          <img
                            src={u.image}
                            alt={u.name}
                            className="w-10 h-10 rounded ml-2"
                          />
                        </li>
                        ))}
                      </ul>
                    ) : (
                      <p>None</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 bg-gray-100 p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-4 text-center">Draft History</h3>
            <div className="space-y-2">
              {draftHistory.map((entry, idx) => (
                <div key={idx} className="border-b pb-2 last:border-b-0">
                  <span className="font-medium">{entry.unit.name} (E{entry.unit.eidolon})</span> - 
                  {entry.fallback ? (
                    <span className="text-gray-600"> {entry.winner.name} (fallback)</span>
                  ) : (
                    <span> won by <span className="font-medium">{entry.winner.name}</span> for <span className="text-green-600">${entry.bid}</span></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-400">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Facer's Auction Draft</h1>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <label className="block mb-2 font-semibold text-center">
          <span className="font-semibold italic">{playerNames[currentPlayerIndex]}</span>'s turn to select a unit for auction
        </label>

          <div className="flex justify-center">
            <select
              value={selectedUnit ? selectedUnit.name : ""}
              onChange={e => {
                const unit = characters.find(c => c.name === e.target.value);
                setSelectedUnit(unit || null);
                if (unit) {
                  // Auto-fill 100 bid for the current player
                  const newBids = [...bids];
                  newBids[currentPlayerIndex] = "100";
                  setBids(newBids);
                }
              }}
              className="border p-2 mb-2 w-full max-w-xs rounded"
            >
              <option value="">-- Choose Unit --</option>
              {availableUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedUnit && (
          <div className="bg-blue-50 p-3 rounded-lg mb-6 flex justify-center">
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <h2 className="text-xl font-semibold">
                  Bidding for: <span className="text-blue-600">{selectedUnit.name}</span>
                </h2>
              </div>
              <img
                src={selectedUnit.image}
                alt={selectedUnit.name}
                style={{ width: '100px', height: '100px' }}
                className="rounded"
              />
            </div>
          </div>


        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 ">
        {players.map((player, idx) => (
            <Card key={player.id} className=
            {`shadow-md 
              ${idx === currentPlayerIndex ? "!bg-green-200 border-4 border-green-800" : "bg-gray-100"}
            `}
          >
            <CardContent className="p-4">
                <div className="mb-4 ">
                <input
                    className="border mb-2 p-2 w-full rounded"
                    type="text"
                    value={playerNames[idx]}
                    placeholder={`Player ${idx + 1} Name`}
                    onChange={e => {
                    const updated = [...playerNames];
                    updated[idx] = e.target.value;
                    setPlayerNames(updated);
                    }}
                />
                <div className="bg-gray-100 p-3 rounded mb-3">
                    <p className="font-semibold">Budget: ${player.budget}</p>
                </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={doNotOwn[idx]}
                        onChange={(e) => {
                        const updated = [...doNotOwn];
                        updated[idx] = e.target.checked;
                        setDoNotOwn(updated);
                        }}
                    />
                    <label className="text-sm">Do not own unit</label>
                </div>

                {!doNotOwn[idx] && (
                <div className="space-y-3">
                <div>
                    <label className="block mb-1 text-sm font-medium">Bid Amount</label>
                    <input
                        className="border p-2 w-full rounded"
                        type="text"
                        value={bids[idx]}
                        placeholder="Enter bid"
                        onChange={e => {
                        const newBids = [...bids];
                        newBids[idx] = e.target.value;
                        setBids(newBids);
                        }}
                    />
                    </div>

                    <div>
                    <label className="block mb-1 text-sm font-medium">Eidolon Level</label>
                    <select
                        className="border p-2 w-full rounded"
                        value={eidolonInputs[idx]}
                        onChange={e => {
                        const newEidolonInputs = [...eidolonInputs];
                        newEidolonInputs[idx] = e.target.value;
                        setEidolonInputs(newEidolonInputs);
                        }}
                    >
                        <option value="">-- Select Eidolon --</option>
                        {[...Array(7)].map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>


                <div className="bg-yellow-50 p-2 rounded text-sm">
                <p>Total price if won: ${calculateCost(parseInt(bids[idx]) || 0, parseInt(eidolonInputs[idx]) || 0, doNotOwn.filter(Boolean).length , selectedUnit ? selectedUnit.limited5Cost : false)}</p>
                </div>
                </div>
                )}

                <div className="mt-4 bg-gray-100 p-3 rounded">
                <p className="font-semibold mb-1">Current Team:</p>
                {player.team.length > 0 ? (
                    <ul className="list-disc">
                    {player.team.map((u, i) => (
                        <li key={i} className="flex items-center justify-start">
                        <span>{u.name} (E{u.eidolon})</span>
                        <img
                          src={u.image}
                          alt={u.name}
                          className="w-10 h-10 rounded ml-2"
                        />
                        
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">None</p>
                )}
                </div>
            </CardContent>
            </Card>
        ))}
        </div>


        <div className="flex justify-center gap-10">
          <Button
            onClick={handleBidSubmit}
            disabled={!selectedUnit}
            className="px-6 py-3 text-lg"
          >
            Submit Bids
          </Button>
          <Button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-6 py-3 text-lg bg-red-300 hover:bg-red-400"
          >
            Undo
          </Button>
        </div>
      </div>
    </div>
  );
}

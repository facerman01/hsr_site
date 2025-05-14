import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialPlayers = Array(4).fill(null).map((_, i) => ({
  id: i + 1,
  name: `Player ${i + 1}`,
  budget: 1000,
  team: []
}));

const unitPool = ["Seele", "Blade", "Bronya", "Kafka", "Jingliu"];

const calculateCost = (bid, eidolon) => bid + eidolon * 50;

export default function AuctionDraft() {
  const [players, setPlayers] = useState(initialPlayers);
  const [bids, setBids] = useState(Array(4).fill(""));
  const [draftHistory, setDraftHistory] = useState([]);
  const [eidolonInputs, setEidolonInputs] = useState(Array(4).fill(""));
  const [playerNames, setPlayerNames] = useState(players.map(p => p.name));
  const [availableUnits, setAvailableUnits] = useState(unitPool);
  const [selectedUnit, setSelectedUnit] = useState("");

  const handleBidSubmit = () => {
    if (!selectedUnit) return;

    const numericBids = bids.map((b, i) => parseInt(b) || 0);
    const eidolons = eidolonInputs.map((e, i) => parseInt(e) || 0);

    const validBids = players.map((p, i) => {
      const totalCost = calculateCost(numericBids[i], eidolons[i]);
      return p.budget >= totalCost ? { player: p, bid: numericBids[i], totalCost, eidolon: eidolons[i], idx: i } : null;
    }).filter(Boolean);

    let highest = null;
    for (let entry of validBids) {
      if (!highest || entry.bid > highest.bid) {
        highest = entry;
      }
    }

    if (!highest) {
      const fallbackIndex = players.findIndex(p => p.budget < 100);
      if (fallbackIndex !== -1) {
        const updatedPlayers = [...players];
        updatedPlayers[fallbackIndex] = {
          ...updatedPlayers[fallbackIndex],
          team: [...updatedPlayers[fallbackIndex].team, { name: selectedUnit, eidolon: 0 }],
        };
        setPlayers(updatedPlayers);
        setDraftHistory(prev => [
          ...prev,
          { unit: { name: selectedUnit, eidolon: 0 }, winner: players[fallbackIndex], bid: 0, fallback: true }
        ]);
      }
    } else {
      const updatedPlayers = players.map(p =>
        p.id === highest.player.id
          ? {
              ...p,
              name: playerNames[highest.idx],
              budget: p.budget - highest.totalCost,
              team: [...p.team, { name: selectedUnit, eidolon: highest.eidolon }],
            }
          : p
      );
      setPlayers(updatedPlayers);
      setDraftHistory(prev => [
        ...prev,
        { unit: { name: selectedUnit, eidolon: highest.eidolon }, winner: { ...highest.player, name: playerNames[highest.idx] }, bid: highest.bid, fallback: false }
      ]);
    }

    setAvailableUnits(prev => prev.filter(u => u !== selectedUnit));
    setSelectedUnit("");
    setBids(Array(4).fill(""));
    setEidolonInputs(Array(4).fill(""));
  };

  if (availableUnits.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Draft Complete!</h2>
        {players.map((p, i) => (
          <Card key={p.id} className="mb-4">
            <CardContent>
              <p className="font-semibold">{playerNames[i]}</p>
              <p>Budget Left: ${p.budget}</p>
              <p>Team: {p.team.map(u => `${u.name} (E${u.eidolon})`).join(", ") || "None"}</p>
            </CardContent>
          </Card>
        ))}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Draft History</h3>
          {draftHistory.map((entry, idx) => (
            <p key={idx}>
              {entry.unit.name} (E{entry.unit.eidolon}) - {entry.fallback ? `${entry.winner.name} (fallback)` : `${entry.winner.name} ($${entry.bid})`}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Facer’s Auction Draft</h1>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select a unit to auction:</label>
        <select
          value={selectedUnit}
          onChange={e => setSelectedUnit(e.target.value)}
          className="border p-2 w-full mb-2"
        >
          <option value="">-- Choose Unit --</option>
          {availableUnits.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      {selectedUnit && (
        <h2 className="text-xl font-semibold mb-2">
          Bidding for: <span className="text-blue-600">{selectedUnit}</span>
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {players.map((player, idx) => (
          <Card key={player.id}>
            <CardContent>
              <input
                className="border mb-2 p-1 w-full"
                type="text"
                value={playerNames[idx]}
                placeholder={`Player ${idx + 1} Name`}
                onChange={e => {
                  const updated = [...playerNames];
                  updated[idx] = e.target.value;
                  setPlayerNames(updated);
                }}
              />
              <p className="font-semibold">Budget: ${player.budget}</p>
              <input
                className="border mt-2 p-1 w-full"
                type="number"
                value={bids[idx]}
                placeholder="Enter bid"
                onChange={e => {
                  const newBids = [...bids];
                  newBids[idx] = e.target.value;
                  setBids(newBids);
                }}
              />
              <input
                className="border mt-2 p-1 w-full"
                type="number"
                value={eidolonInputs[idx]}
                placeholder="Eidolon after winning"
                onChange={e => {
                  const newEidolonInputs = [...eidolonInputs];
                  newEidolonInputs[idx] = e.target.value;
                  setEidolonInputs(newEidolonInputs);
                }}
              />
              <p className="text-sm mt-1 text-gray-600">
                Total price if won: ${calculateCost(parseInt(bids[idx]) || 0, parseInt(eidolonInputs[idx]) || 0)}
              </p>
              <p className="text-sm mt-1 text-gray-700">
                Team: {player.team.map(u => `${u.name} (E${u.eidolon})`).join(", ") || "None"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={handleBidSubmit} disabled={!selectedUnit}>Submit Bids</Button>
    </div>
  );
}
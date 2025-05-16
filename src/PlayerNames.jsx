import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PlayerNames = () => {
  const [names, setNames] = useState(Array(4).fill(""));
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    const updatedNames = [...names];
    updatedNames[index] = value;
    setNames(updatedNames);
  };

  const handleSubmit = () => {
    const filledNames = names.filter((name) => name.trim() !== "");
    if (filledNames.length !== 4) {
      alert("Please enter all 4 player names.");
      return;
    }

    navigate("/auction", { state: { names: filledNames } });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Enter Player Names</h2>
      {names.map((name, i) => (
        <input
          key={i}
          value={name}
          onChange={(e) => handleChange(i, e.target.value)}
          placeholder={`Player ${i + 1}`}
          className="block w-full p-2 mb-2 border rounded"
        />
      ))}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Auction
      </button>
    </div>
  );
};

export default PlayerNames;

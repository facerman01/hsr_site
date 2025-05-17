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

      <h1 className="text-3xl font-bold mb-6 text-center mb-10">Facer's Auction Draft</h1>
      <div className="bg-gray-200 rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4 gap-10">Enter Player Names</h2>
        {names.map((name, i) => (
          <input
            key={i}
            value={name}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={`Player ${i + 1}`}
            className="block w-full p-2 mb-2 border rounded bg-gray-100"
          />
        ))}
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-8"
        >
          Start Auction
        </button>
      </div>
      <a href='https://ko-fi.com/facerman' target='_blank' rel="noopener noreferrer">
        <img
          height='36'
          style={{ border: '0px', height: '36px' }}
          src='https://cdn.ko-fi.com/cdn/kofi5.png'
          alt='Buy Me a Coffee at ko-fi.com'
          className="mb-4"
        />
      </a>

      <img
        style={{ width: '130px', height: 'auto', border: '10px' }}
        src="/profile_pic/profile.png"
        alt="facerman is the goat"
        className="w-24 h-auto rounded-full"
      />

    </div>

  );
};

export default PlayerNames;

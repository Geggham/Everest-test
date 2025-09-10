// src/components/PlayerList.jsx
import React from "react";

export default function PlayerList({ players }) {
  return (
    <div>
      {players && players.map((player, idx) => (
        <div key={idx}>
          {player.name} - {player.balance}
        </div>
      ))}
    </div>
  );
}

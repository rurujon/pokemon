import logo from './logo.svg';
import './App.css';
import Pokedex from './pokedex/Pokedex';
import DamageCalculator from './damageColculator/DamageColculator';
import { useState } from 'react';

function App() {

  const [activeTab, setActiveTab] = useState("pokedex");


  return (
    <div>
      {/* 탭 버튼 */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("pokedex")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "pokedex" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          포켓몬 도감
        </button>
        <button
          onClick={() => setActiveTab("damage")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: activeTab === "damage" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            marginRight: "0.5rem",
            borderRadius: "4px",
          }}
        >
          결정력 계산기
        </button>
      </div>

      {/* 탭에 따라 컴포넌트 렌더링 */}
      {activeTab === "damage" && <DamageCalculator />}
      {activeTab === "pokedex" && <Pokedex />}
    </div>
  );
}

export default App;

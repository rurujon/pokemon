import { useState, useEffect } from "react";
import axios from "axios";
import "./PokemonSelector.css"; // CSS 파일 import

export default function PokemonSelector({ generation, handleSelectPokemon, isAttacker  }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get(`/pokedex/list?gen=${generation}`)
      .then((res) => {
        setPokemonList(res.data);
        setFilteredList(res.data);
      })
      .catch((err) => console.error(err));
  }, [generation]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredList(pokemonList);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredList(
        pokemonList.filter(p =>
          p.nameKor.includes(searchTerm) ||
          p.nameKor.toLowerCase().includes(lowerTerm)
        )
      );
    }
  }, [searchTerm, pokemonList]);

  return (
    <div className="selector-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="포켓몬 이름 입력..."
        className="search-input"
      />

      <div className="pokemon-list">
        {filteredList.length === 0 ? (
          <div className="no-result">포켓몬이 없습니다.</div>
        ) : (
          filteredList.map(p => (
            <div
              key={p.id}
              className="pokemon-item"
              onClick={() => handleSelectPokemon(p.id, isAttacker)}
            >
              <img src={p.imageUrl} alt={p.nameKor} className="pokemon-image-selector" />
              <div className="pokemon-info">
                <div className="pokemon-name">{p.nameKor}</div>
                <div className="pokemon-no">#{p.regionNo}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

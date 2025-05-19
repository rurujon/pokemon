import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Pokedex.css';

import PokedexDetailModal from './PokedexDetailModal';

function Pokedex() {
  const [generation, setGeneration] = useState(8);
  const [pokemonList, setPokemonList] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    const fetchPokedex = async () => {
      try {
        const response = await axios.get(`/pokedex/list?gen=${generation}`);
        const sorted = response.data.sort((a, b) => a.regionNo - b.regionNo);
        setPokemonList(sorted);
        setSelectedPokemon(null); // 탭 전환 시 상세 정보 초기화
      } catch (error) {
        console.error('도감 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    fetchPokedex();
  }, [generation]);

  const handleUpload = async () => {
    try {
      const response = await axios.post(`/pokedex/save?gen=${generation}`);
      setMessage(response.data);
    } catch (error) {
      console.error(error);
      setMessage('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="pokedex-wrapper">
      <h2>포켓몬 도감</h2>

      <div className="tab-buttons">
        <button
          className={generation === 8 ? 'active' : ''}
          onClick={() => setGeneration(8)}
        >
          소드/실드
        </button>
        <button
          className={generation === 9 ? 'active' : ''}
          onClick={() => setGeneration(9)}
        >
          스칼렛/바이올렛
        </button>
      </div>

      <div className="upload-button">
        <button onClick={handleUpload}>{generation}세대 저장</button>
        {message && <div className="message">{message}</div>}
      </div>

      <div className="pokedex-container">
        {pokemonList.map((pokemon) => (
          <div
            key={pokemon.id}
            className={`pokedex-card ${selectedPokemon?.id === pokemon.id ? 'selected' : ''}`}
            onClick={() => setSelectedPokemon(pokemon)}
          >
            <img src={pokemon.imageUrl} alt={pokemon.nameKor} />
            <h3>{pokemon.nameKor}</h3>
            <p>지역 도감: {pokemon.regionNo}</p>
            <p>전국 도감: {pokemon.pokedexNo}</p>
            <div className="types">
              <span className={`type ${pokemon.type1.toLowerCase()}`}>{pokemon.type1}</span>
              {pokemon.type2 && (
                <span className={`type ${pokemon.type2.toLowerCase()}`}>{pokemon.type2}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPokemon && (
        <PokedexDetailModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}

export default Pokedex;

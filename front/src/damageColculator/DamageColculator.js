import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DamageColculator.css';
import PokemonSelector from './PokemonSelector';

const STAT_KEYS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
const STAT_LABELS = {
  hp: 'HP',
  attack: '공격',
  defense: '방어',
  spAttack: '특공',
  spDefense: '특방',
  speed: '스피드'
};

export default function DamageCalculator() {
  const [generation, setGeneration] = useState('8');
  const [pokemonList, setPokemonList] = useState([]);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);


  // 스탯 상태 관리
  const initializeStats = () => {
    return STAT_KEYS.reduce((acc, key) => {
      acc[key] = { iv: 31, ev: 252, nature: 1.0 };
      return acc;
    }, {});
  };

  const [attackerStats, setAttackerStats] = useState(initializeStats());
  const [defenderStats, setDefenderStats] = useState(initializeStats());

  useEffect(() => {
    axios.get(`/pokedex/list?gen=${generation}`)
      .then((res) => setPokemonList(res.data))
      .catch((err) => console.error(err));
  }, [generation]);

  const handleSelectPokemon = (id, isAttacker) => {
    const selected = pokemonList.find(p => p.id === parseInt(id));
    if (isAttacker) {
      setAttacker(selected);
      setAttackerStats(initializeStats());
    } else {
      setDefender(selected);
      setDefenderStats(initializeStats());
    }
  };

  const handleStatChange = (who, stat, field, value) => {
    const updater = who === 'attacker' ? setAttackerStats : setDefenderStats;
    updater(prev => ({
      ...prev,
      [stat]: { ...prev[stat], [field]: Number(value) }
    }));
  };

  const calcStat = (base, iv, ev, level, nature, statName) => {
    if (statName === 'hp') {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      return Math.floor((((2 * base + iv + Math.floor(ev / 4)) * level) / 100 + 5) * nature);
    }
  };

  const getRealStats = (pokemon, statConfig) => {
    const result = {};
    if (!pokemon) return result;

    STAT_KEYS.forEach(key => {
      result[key] = calcStat(
        pokemon[key],
        statConfig[key].iv,
        statConfig[key].ev,
        50,
        statConfig[key].nature,
        key
      );
    });

    return result;
  };

  const attackerRealStats = getRealStats(attacker, attackerStats);
  const defenderRealStats = getRealStats(defender, defenderStats);

  const dummyPower = 100;
  const damage = attacker && defender
    ? Math.floor((((2 * 50 / 5 + 2) * dummyPower * attackerRealStats.attack / defenderRealStats.defense) / 50) + 2)
    : 0;

  const renderStatInputs = (who, stats, pokemon) => {
    return STAT_KEYS.map((key) => (
      <div key={key} className="stat-row">
        <h4>{STAT_LABELS[key]} {pokemon ? pokemon[key] : '-'}</h4>
        <label>IV
          <input type="number" min="0" max="31"
            value={stats[key].iv}
            onChange={(e) => handleStatChange(who, key, 'iv', e.target.value)} />
        </label>
        <label>EV
          <input type="number" min="0" max="252"
            value={stats[key].ev}
            onChange={(e) => handleStatChange(who, key, 'ev', e.target.value)} />
        </label>
        <label>성격
          <select value={stats[key].nature}
            onChange={(e) => handleStatChange(who, key, 'nature', e.target.value)}>
            <option value={1.0}>없음</option>
            <option value={1.1}>+10%</option>
            <option value={0.9}>-10%</option>
          </select>
        </label>
        <p><label>실능치</label> {pokemon ? calcStat(pokemon[key], stats[key].iv, stats[key].ev, 50, stats[key].nature, key) : '-'}</p>
      </div>
    ));
  };

  return (
    <div className="calculator-container">
      {/* 세대 선택 탭 */}
      <div className="generation-tabs">
        <button className={generation === '8' ? 'tab active' : 'tab'} onClick={() => setGeneration('8')}>8세대</button>
        <button className={generation === '9' ? 'tab active' : 'tab'} onClick={() => setGeneration('9')}>9세대</button>
      </div>

      {/* 설명 */}
      <div className="explanation-box">
        <h2>결정력 계산식</h2>
        <p><strong>결정력 = ((레벨 × 2 ÷ 5 + 2) × 기술 위력 × 공격 / 방어 ÷ 50) + 2</strong></p>
      </div>

      {/* 메인 패널 */}
      <div className="main-grid">
        {/* 공격자 */}
        <div className="panel attacker">
          <h3>공격자</h3>
          <PokemonSelector
            generation={generation}
            handleSelectPokemon={handleSelectPokemon}
            isAttacker={true}
          />

          {attacker && (
            <>
              <img src={attacker.imageUrl} alt={attacker.nameKor} className="pokemon-image" />
              <p><strong>{attacker.nameKor}</strong> / {attacker.type1}{attacker.type2 ? ` / ${attacker.type2}` : ''}</p>
              {renderStatInputs('attacker', attackerStats, attacker)}
            </>
          )}
        </div>

        {/* 결과 */}
        <div className="panel result">
          <h3>결과</h3>
          {attacker && defender ? (
            <p><strong>예상 데미지: {damage}</strong></p>
          ) : (
            <p className="placeholder">양쪽 포켓몬을 선택하세요</p>
          )}
        </div>

        {/* 수비자 */}
        <div className="panel defender">
          <h3>수비자</h3>
          <PokemonSelector
            generation={generation}
            handleSelectPokemon={handleSelectPokemon}
            isAttacker={false}
          />
          {defender && (
            <>
              <img src={defender.imageUrl} alt={defender.nameKor} className="pokemon-image" />
              <p><strong>{defender.nameKor}</strong> / {defender.type1}{defender.type2 ? ` / ${defender.type2}` : ''}</p>
              {renderStatInputs('defender', defenderStats, defender)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

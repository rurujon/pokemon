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
  speed: '스핏'
};

const typeEffectiveness = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
  water:    { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  grass:    { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  ice:      { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0 },
  poison:   { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground:   { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying:   { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug:      { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost:    { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel:    { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy:    { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 }
};

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon',
  'dark', 'steel', 'fairy'
];

export default function DamageCalculator() {
  const [generation, setGeneration] = useState('8');
  const [pokemonList, setPokemonList] = useState([]);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);

  const [moveList, setMoveList] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedMove, setSelectedMove] = useState(null);


  // 스탯 상태 관리
  const initializeStats = () => {
    return STAT_KEYS.reduce((acc, key) => {
      acc[key] = { iv: 31, ev: 0, nature: 1.0, rank: 0 };
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

  useEffect(() => {
    axios.get('/pokeMove/list')
      .then(res => setMoveList(res.data))
      .catch(err => console.error(err));
  }, []);

  //포켓몬 검색

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

  //기술 검색

  const filteredMoves = moveList.filter((move) =>
    move.nameKor.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectMove = (moveId) => {
    const selected = moveList.find((m) => m.id === parseInt(moveId));
    setSelectedMove(selected);
    setQuery(''); // 검색창 초기화
  };

  //----

  const handleSaveMoves = () => {
    axios.post('/pokeMove/save')
      .then(res => alert(res.data))
      .catch(err => {
        console.error(err);
        alert('저장 실패');
      });
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

  //이 밑으로 데미지 계산식 관련 로직.

  const attackerRealStats = getRealStats(attacker, attackerStats);
  const defenderRealStats = getRealStats(defender, defenderStats);

  //테라스탈 타입 변경
  const [attackerTeraType, setAttackerTeraType] = useState('');
  const [defenderTeraType, setDefenderTeraType] = useState('');

  //방어자 타입. 테라스탈 적용시 단일 타입화.
  function getTypeMultiplier(moveType, defenderType1, defenderType2 = null, terastalType = null) {
    const typeChart = typeEffectiveness[moveType.toLowerCase()];
    if (!typeChart) return 1;

    if (terastalType) {
      // 테라스탈 타입이 적용된 경우, 해당 단일 타입만 계산
      return typeChart[terastalType.toLowerCase()] ?? 1;
    }

    const multiplier1 = typeChart[defenderType1.toLowerCase()] ?? 1;
    const multiplier2 = defenderType2 ? (typeChart[defenderType2.toLowerCase()] ?? 1) : 1;

    return multiplier1 * multiplier2;
  }


  //공격자 보정. 자속 보정, 테라스탈 보정 포함.
  function getSTAB(moveType, type1, type2 = null, terastalType = null) {
    const move = moveType.toLowerCase();
    const t1 = type1?.toLowerCase();
    const t2 = type2?.toLowerCase();
    const tera = terastalType?.toLowerCase();

    const hasTypeMatch = move === t1 || move === t2;
    const isTeraMatch = move === tera;

    if (isTeraMatch && hasTypeMatch) return 2.0;
    if (isTeraMatch || hasTypeMatch) return 1.5;
    return 1.0;
  }

  //스탯 랭크 업 계산
  const getRankMultiplier = (rank) => {
    if (rank >= 0) return (2 + rank) / 2;
    return 2 / (2 - rank);
  };

  //데미지 계산식. 뭐가 이리 복잡해.
  const calculateDamage = (attacker, defender, selectedMove, attackerStats, defenderStats) => {
    if (!attacker || !defender || !selectedMove) return 0;

    const isPhysical = selectedMove.damageClass === 'physical';
    const power = selectedMove.power || 0;

    const attackerRealStats = getRealStats(attacker, attackerStats);
    const defenderRealStats = getRealStats(defender, defenderStats);

    const attackRank = isPhysical ? attackerStats.attack.rank : attackerStats.spAttack.rank;
    const defenseRank = isPhysical ? defenderStats.defense.rank : defenderStats.spDefense.rank;

    const attackStat = Math.floor(
      (isPhysical ? attackerRealStats.attack : attackerRealStats.spAttack) * getRankMultiplier(attackRank)
    );
    const defenseStat = Math.floor(
      (isPhysical ? defenderRealStats.defense : defenderRealStats.spDefense) * getRankMultiplier(defenseRank)
    );

    const baseDamage = (((2 * 50 / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;

    // STAB 계산
    const stab = getSTAB(
      selectedMove.type,
      attacker.type1,
      attacker.type2,
      attacker.terastalType
    );

    // 타입 상성 계산 (방어자 테라스탈 고려)
    const typeMultiplier = getTypeMultiplier(
      selectedMove.type,
      defender.type1,
      defender.type2,
      defender.terastalType
    );

    const totalDamage = Math.floor(baseDamage * stab * typeMultiplier);
    return totalDamage;
  };

  const MaxDamage = calculateDamage({ ...attacker, terastalType: attackerTeraType }, { ...defender, terastalType: defenderTeraType }, selectedMove, attackerStats, defenderStats);
  const MinDamage = Math.floor(MaxDamage * 0.85);

  const renderStatInputs = (who, stats, pokemon) => {
    return STAT_KEYS.map((key) => (
      <div key={key} className="stat-row">
        <h4>{STAT_LABELS[key]} <br/> {pokemon ? pokemon[key] : '-'}</h4>
        <label>IV
          <br/>
          <input type="number" min="0" max="31"
            value={stats[key].iv}
            onChange={(e) => handleStatChange(who, key, 'iv', e.target.value)} />
        </label>
        <label>EV
          <br/>
          <input type="number" min="0" max="252"
            value={stats[key].ev}
            onChange={(e) => handleStatChange(who, key, 'ev', e.target.value)} />
        </label>
        <label>성격
          <br/>
          <select value={stats[key].nature}
            onChange={(e) => handleStatChange(who, key, 'nature', e.target.value)}>
            <option value={1.0}>없음</option>
            <option value={1.1}>+10%</option>
            <option value={0.9}>-10%</option>
          </select>
        </label>        
        <p><label>실능치</label>
          <br/>
         {pokemon ? calcStat(pokemon[key], stats[key].iv, stats[key].ev, 50, stats[key].nature, key) : '-'}
         </p>
        <label>랭크
          <br/>
          <select value={stats[key].rank} onChange={(e) => handleStatChange(who, key, 'rank', e.target.value)}>
            {Array.from({ length: 13 }, (_, i) => i - 6).map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </label>
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
        <p className="small-text">※ 여기에 날씨, 특성, 아이템, 타입 상성 등 다양한 배율이 적용됩니다.</p>
      </div>

      <div>
         <button onClick={handleSaveMoves}>기술 초기화</button>
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
              <div>
                <label>공격자 테라스탈 타입: </label>
                <select value={attackerTeraType} onChange={(e) => setAttackerTeraType(e.target.value)}>
                  <option value="">기본</option>
                  {POKEMON_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {renderStatInputs('attacker', attackerStats, attacker)}
            </>
          )}
        </div>

        {/* 결과 */}
        <div className="panel result">
          <h3>결과</h3>
          <div className="move-selector-container">
            <div className="move-selector">
              <label htmlFor="moveSearch">기술 검색:</label>
              <input
                type="text"
                id="moveSearch"
                placeholder="기술 이름 입력..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <ul className="move-dropdown">
                  {filteredMoves.length > 0 ? (
                    filteredMoves.map((move) => (
                      <li key={move.id} onClick={() => handleSelectMove(move.id)}>
                        {move.nameKor} ({move.type} / {move.damageClass} / {move.power})
                      </li>
                    ))
                  ) : (
                    <li className="no-match">검색 결과 없음</li>
                  )}
                </ul>
              )}
            </div>

            {selectedMove && (
              <div className="move-info">
                <p><strong>선택 기술:</strong> {selectedMove.nameKor}</p>
                <p>
                  속성: {selectedMove.type} / 분류: {selectedMove.damageClass} / 위력: {selectedMove.power}
                </p>
              </div>
            )}
          </div>          
          
          {attacker && defender ? (
            <p><strong>예상 데미지: {MinDamage} ~ {MaxDamage}</strong></p>
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
              <div>
                <label>방어자 테라스탈 타입: </label>
                <select value={defenderTeraType} onChange={(e) => setDefenderTeraType(e.target.value)}>
                  <option value="">기본</option>
                  {POKEMON_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {renderStatInputs('defender', defenderStats, defender)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

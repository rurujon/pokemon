import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DamageColculator.css';
import PokemonSelector from './PokemonSelector';
import gigantamaxData from './gigantamaxData.json'

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

const DYNAMAX_MOVE_NAMES = {
  normal: '다이어택',
  fire: '다이번',
  water: '다이스트림',
  grass: '다이그래스',
  electric: '다이썬더',
  ice: '다이아이스',
  fighting: '다이너클',
  poison: '다이애시드',
  ground: '다이어스',
  flying: '다이제트',
  psychic: '다이사이코',
  bug: '다이웜',
  rock: '다이록',
  ghost: '다이할로우',
  dragon: '다이드라군',
  dark: '다이아크',
  steel: '다이스틸',
  fairy: '다이페어리'
};


export default function DamageCalculator() {

  const [showDetails, setShowDetails] = useState(false);

  const [generation, setGeneration] = useState('8');
  const [pokemonList, setPokemonList] = useState([]);
  const [attacker, setAttacker] = useState(null);
  const [defender, setDefender] = useState(null);

  const [moveList, setMoveList] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedMove, setSelectedMove] = useState(null);

  const [attackerDynamax, setAttackerDynamax] = useState(false);
  const [defenderDynamax, setDefenderDynamax] = useState(false);

  const [attackerGigantamax, setAttackerGigantamax] = useState(false); // NEW

  const handleGenerationChange = (gen) => {
    setGeneration(gen);

    // 세대 바뀔 때 관련 상태 초기화
    if (gen === '8') {
      // 8세대용 초기화
      setAttackerTeraType('');
      setDefenderTeraType('');
      setAttackerDynamax(false);
      setDefenderDynamax(false);
      setAttackerGigantamax(false);
      setSelectedMove(null);
      setAttacker(null);
      setDefender(null);
    } else if (gen === '9') {
      // 9세대용 초기화
      setAttackerTeraType('');
      setDefenderTeraType('');
      setAttackerDynamax(false);
      setDefenderDynamax(false);
      setAttackerGigantamax(false);
      setSelectedMove(null);
      setAttacker(null);
      setDefender(null);
    }
  };


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

  //필드 요소 추가 토글
  const [fieldState, setFieldState] = useState({
    weather: 'none', // 'none' | 'sunny' | 'rain' | 'sandstorm' | 'snow'
    reflect: false,
    lightScreen: false,
    gravity: false,
  });

  const toggleField = (field) => {
    setFieldState((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };


  //필드들의 효과 적용 코드
  const applyFieldEffects = ({
    baseDamage,
    move,
    fieldState,
    isPhysical,
    isSpecial
  }) => {
    let modifiedDamage = baseDamage;

    // ☀️ 날씨 효과
    if (fieldState.weather === 'sunny') {
      if (move.type.toLowerCase() === 'fire') modifiedDamage *= 1.5;
      if (move.type.toLowerCase() === 'water') modifiedDamage *= 0.5;
    } else if (fieldState.weather === 'rain') {
      if (move.type.toLowerCase() === 'fire') modifiedDamage *= 0.5;
      if (move.type.toLowerCase() === 'water') modifiedDamage *= 1.5;
    }

    // 🛡 리플렉터/빛의장막/오로라베일
    const hasScreen =
      (fieldState.reflect && isPhysical) ||
      (fieldState.lightScreen && isSpecial);

    if (hasScreen) {
      modifiedDamage *= 0.5;
    }

    return modifiedDamage;
  };

  // 공격자 특성 배율 (예: 공격력 증가 배율)
  const [attackerAbilityStatBonus, setAttackerAbilityStatBonus] = useState(1.0);
  const [attackerAbilityMoveBonus, setAttackerAbilityMoveBonus] = useState(1.0);
  const [attackerAbilityStatTarget, setAttackerAbilityStatTarget] = useState("attack");

  // 수비자 특성 배율 (예: 방어력 증가, 데미지 감소 배율)
  const [defenderAbilityStatBonus, setDefenderAbilityStatBonus] = useState(1.0);
  const [defenderAbilityDamageReduce, setDefenderAbilityDamageReduce] = useState(1.0);
  const [defenderAbilityStatTarget, setDefenderAbilityStatTarget] = useState("defense");

  // 공격자 도구 배율 (예: 공격력 증가 배율)
  const [attackerItemStatBonus, setAttackerItemStatBonus] = useState(1.0);
  const [attackerItemMoveBonus, setAttackerItemMoveBonus] = useState(1.0);
  const [attackerItemStatTarget, setAttackerItemStatTarget] = useState("attack");

  // 수비자 도구 배율 (예: 방어력 증가, 데미지 감소 배율)
  const [defenderItemStatBonus, setDefenderItemStatBonus] = useState(1.0);
  const [defenderItemDamageReduce, setDefenderItemDamageReduce] = useState(1.0);
  const [defenderItemStatTarget, setDefenderItemStatTarget] = useState("defense");

  //다이맥스 기술 위력 설정
  const getDynamaxPower = (originalPower, type) => {
  const isFightingOrPoison = ['fighting', 'poison'].includes(type);
    if (originalPower <= 40) return isFightingOrPoison ? 70 : 90;
    if (originalPower === 50) return isFightingOrPoison ? 75 : 100;
    if (originalPower >= 55 && originalPower <= 60) return isFightingOrPoison ? 80 : 110;
    if (originalPower >= 65 && originalPower <= 70) return isFightingOrPoison ? 85 : 120;
    if (originalPower >= 75 && originalPower <= 100) return isFightingOrPoison ? 90 : 130;
    if (originalPower >= 110 && originalPower <= 140) return isFightingOrPoison ? 95 : 140;
    if (originalPower >= 150) return isFightingOrPoison ? 100 : 150;
    return isFightingOrPoison ? 70 : 90; // fallback
  };

  const createDynamaxMove = (originalMove) => {
    const power = getDynamaxPower(originalMove.power, originalMove.type);
    const nameKor = DYNAMAX_MOVE_NAMES[originalMove.type] || '다이월';
    return {
      ...originalMove,
      nameKor,
      power,
      // 다이맥스 기술은 항상 "physical" 또는 "special" 그대로 유지
      // 추가 옵션 넣을 수도 있음 ex: isDynamax: true
    };
  }

  // 거다이맥스 로직
  const createGigantamaxMove = (originalMove, attackerName) => {

    if (!originalMove) return null;

    const gigaInfo = gigantamaxData[attackerName];
    if (!gigaInfo) return null;

    if (originalMove.type !== gigaInfo.type) return null;

    return {
      ...originalMove,
      nameKor: gigaInfo.move,
      power: gigaInfo.power,
      description: gigaInfo.effective,
    };
  };

  let moveToUse = null;

  if (selectedMove) {
    // 기술이 선택된 경우만 처리
    if (attackerGigantamax) {
      const gigaMove = createGigantamaxMove(selectedMove, attacker.nameKor);

      if (gigaMove) {
        moveToUse = gigaMove;
      } else {
        moveToUse = createDynamaxMove(selectedMove);
      }
    } else if (attackerDynamax) {
      moveToUse = createDynamaxMove(selectedMove);
    } else {
      moveToUse = selectedMove;
    }
  }

  const calculateDamageRange = (
    attacker,
    defender,
    selectedMove,
    attackerStats,
    defenderStats,
    fieldState,
    generation // 8 or 9
  ) => {
    if (!attacker || !defender || !selectedMove) return { min: 0, max: 0 };

    const isPhysical = selectedMove.damageClass === 'physical';
    const isSpecial = selectedMove.damageClass === 'special';
    const power = selectedMove.power || 0;

    const attackerRealStats = getRealStats(attacker, attackerStats);
    const defenderRealStats = getRealStats(defender, defenderStats);

    const attackRank = isPhysical ? attackerStats.attack.rank : attackerStats.spAttack.rank;
    const defenseRank = isPhysical ? defenderStats.defense.rank : defenderStats.spDefense.rank;

    let attackStat = Math.floor(
      (isPhysical ? attackerRealStats.attack : attackerRealStats.spAttack) * getRankMultiplier(attackRank)
    );

    if ((isPhysical && attackerAbilityStatTarget === 'attack') || 
        (isSpecial && attackerAbilityStatTarget === 'spAttack')) {
      attackStat = Math.floor(attackStat * attackerAbilityStatBonus);
    }

    if ((isPhysical && attackerItemStatTarget === 'attack') || 
        (isSpecial && attackerItemStatTarget === 'spAttack')) {
      attackStat = Math.floor(attackStat * attackerItemStatBonus);
    }

    let defenseStat = Math.floor(
      (isPhysical ? defenderRealStats.defense : defenderRealStats.spDefense) * getRankMultiplier(defenseRank)
    );

    if ((isPhysical && defenderAbilityStatTarget === 'defense') || 
        (isSpecial && defenderAbilityStatTarget === 'spDefense')) {
      defenseStat = Math.floor(defenseStat * defenderAbilityStatBonus);
    }

    if ((isPhysical && defenderItemStatTarget === 'defense') || 
        (isSpecial && defenderItemStatTarget === 'spDefense')) {
      defenseStat = Math.floor(defenseStat * defenderItemStatBonus);
    }

    if (
      fieldState.weather === 'sandstorm' &&
      isSpecial &&
      (defender.type1 === 'rock' || defender.type2 === 'rock')
    ) {
      defenseStat = Math.floor(defenseStat * 1.5);
    }

    if (
      generation === '9' &&
      fieldState.weather === 'snow' &&
      isPhysical &&
      (defender.type1 === 'ice' || defender.type2 === 'ice')
    ) {
      defenseStat = Math.floor(defenseStat * 1.5);
    }

    const stab = getSTAB(selectedMove.type, attacker.type1, attacker.type2, attacker.terastalType);
    const typeMultiplier = getTypeMultiplier(
      selectedMove.type,
      defender.type1,
      defender.type2,
      defender.terastalType
    );

    const modifier = stab * typeMultiplier * attackerItemMoveBonus;

    const applyModifiers = (baseDamage) => {
      let damage = baseDamage * modifier;
      damage = applyFieldEffects({
        baseDamage: damage,
        move: selectedMove,
        fieldState,
        isPhysical,
        isSpecial
      });
      damage = Math.floor(damage * defenderAbilityDamageReduce * defenderItemDamageReduce);
      return Math.floor(damage);
    };

    const baseDamage = (((2 * 50 / 5 + 2) * power * attackerAbilityMoveBonus * attackStat / defenseStat) / 50) + 2;

    const min = applyModifiers(baseDamage * 0.85);
    const max = applyModifiers(baseDamage * 1.00);

    return { min, max };
  };

  const { min: MinDamage, max: MaxDamage } = calculateDamageRange(
    { ...attacker, terastalType: attackerTeraType },
    { ...defender, terastalType: defenderTeraType },
    moveToUse,
    attackerStats,
    defenderStats,
    fieldState,
    generation
  );

  //n타 킬 계산
  const DamageResult = ({ 
    minDamage, 
    maxDamage, 
    defenderHP, 
    defenderDynamax, 
    generation 
  }) => {
    const effectiveHP = (generation === '8' && defenderDynamax) ? defenderHP * 2 : defenderHP;

    if (minDamage <= 0) {
      return <p>데미지 계산 불가</p>;
    }

    if (maxDamage >= effectiveHP) {
      return <p>난수 1타</p>;
    } else if (minDamage >= effectiveHP) {
      return <p>확정 1타</p>;
    }

    // 최소 타수는 최대 데미지 기준, 최대 타수는 최소 데미지 기준
    const minHits = Math.ceil(effectiveHP / maxDamage); // 최소 타수
    const maxHits = Math.ceil(effectiveHP / minDamage); // 최대 타수

    if (minHits === maxHits) {
      return <p>확정 {minHits}타</p>;
    } else {
      return <p>난수 {minHits}타</p>;
    }
  };

  const realHPStat = (generation === '8' && defenderDynamax) ? defenderRealStats.hp * 2 : defenderRealStats.hp;

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
        <button
          className={generation === '8' ? 'tab active' : 'tab'}
          onClick={() => handleGenerationChange('8')}
        >
          8세대
        </button>
        <button
          className={generation === '9' ? 'tab active' : 'tab'}
          onClick={() => handleGenerationChange('9')}
        >
          9세대
        </button>
      </div>

      {/* 설명 */}
      <div className="explanation-box">
        <h2>결정력 계산식</h2>
        <p className="small-text">
          ※ 특성 정보와 도구 정보를 가져오는 것까진 가능하나, 이 중 결정력 계산식에 영향을 주는 특성/도구만을 필터링할 방법이 당장은 없음.<br/>
          ※ 임시로 직접 특성 배율과 도구 배율을 지정할 수 있도록 설정. 계산식 자체는 구현 완료.
        </p>
        <p><strong>결정력 = ((레벨 × 2 ÷ 5 + 2) × 기술 위력 × 공격 / 방어 ÷ 50) + 2</strong></p>
        <p className="small-text">
          ※ 여기에 날씨, 특성, 아이템, 타입 상성 등 다양한 배율이 적용됩니다.
        </p>

        <button onClick={() => setShowDetails(!showDetails)} className="toggle-button">
          {showDetails ? "▲ 닫기" : "▼ 자세히 보기"}
        </button>

        {showDetails && (
          <div className="details">
            <h3>🟥 1. 공격력/방어력 증폭 계수 (Stage 변화)</h3>
            <p>공격/특공/방어/특방 단계는 -6 ~ +6까지 변동하며, 각 단계는 계수로 환산됩니다.</p>
            <pre>
  +6: ×4.0   +5: ×3.5   +4: ×3.0  +3: ×2.5    +2: ×2.0    +1: ×1.5  <br/><br/>
  -1: ×0.66  -2: ×0.5   -3: ×0.4  -4: ×0.33   -5: ×0.29   -6: ×0.25 
            </pre>

            <h3>🟥 2. 필드/상황 버프</h3>
            <ul>
              <li><strong>비바라기:</strong> 물 기술 위력 ×1.5 / 불 기술 위력 ×0.5</li>
              <li><strong>쾌청:</strong> 불 기술 위력 ×1.5 / 물 기술 위력 ×0.5</li>
              <li><strong>모래바람:</strong> 바위 타입 포켓몬 특방 ×1.5</li>
              <li><strong>눈(9세대):</strong> 얼음 타입 포켓몬 방어 ×1.5</li>
              <li><strong>리플렉터:</strong> 물리 기술 피해 절반</li>
              <li><strong>빛의장막:</strong> 특수 기술 피해 절반</li>
              <li><strong>그 외 기타 등등</strong></li>
            </ul>

            <h3>🟥 3. STAB (타입 일치 보너스)</h3>
            <p>포켓몬의 타입과 같은 타입의 기술을 사용시 기본 1.5배, 특성 <strong>적응력</strong>일 경우 2.0배</p>

            <h3>🟥 4. 타입 상성</h3>
            <p>타입 상성에 따라 0.25 ~ 4배까지 증폭됩니다.</p>

            <h3>🟥 5. 급소 (Critical Hit)</h3>
            <p>기본 ×1.5배 (6세대 이전은 2.0배)</p>

            <h3>🟥 6. 랜덤 계수</h3>
            <p>0.85 ~ 1.00 사이의 난수로 데미지 편차 발생</p>

            <h3>🟥 7. 특성 보정</h3>
            <ul>
              <li>순수한힘, 천하장사: 포켓몬 공격력 ×2.0</li>
              <li>철주먹: 펀치 계열 기술 위력 ×1.2</li>
              <li>필터, 하드록: 받은 데미지 ×0.75</li>
              <li>페어리오라/다크오라: 특정 타입 기술 위력 ×1.33</li>
              <li>재앙시리즈: 상대 특정 능력치 ×0.75</li>
              <li>그 외 기타 등등</li>
            </ul>

            <h3>🟥 8. 아이템 보정</h3>
            <ul>
              <li>생명의구슬: 최종 데미지 ×1.3</li>
              <li>구애머리띠/안경: 물리/특수 ×1.5</li>
              <li>반감열매: 피해 절반</li>
              <li>그 외 기타 등등</li>
            </ul>

            <h3>🟥 9. 기술 조건 보정</h3>
            <p>연속기술, 2턴 기술, 상대 상태 조건에 따라 위력이 변동됩니다.</p>
          </div>
        )}
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
              {generation === '9' && (
                <div>
                  <label>공격자 테라스탈 타입: </label>
                  <select value={attackerTeraType} onChange={(e) => setAttackerTeraType(e.target.value)}>
                    <option value="">기본</option>
                    {POKEMON_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {generation === '8' && (
                <div>
                  <label>공격자 다이맥스 여부: </label>
                  <input
                    type="checkbox"
                    checked={attackerDynamax}
                    onChange={(e) => {
                      setAttackerDynamax(e.target.checked);
                      if (e.target.checked) setAttackerGigantamax(false); // 상호 배제
                    }}
                  />
                  {gigantamaxData.hasOwnProperty(attacker.nameKor) && (
                    <>
                      <label>공격자 거다이맥스 여부: </label>
                      <input
                        type="checkbox"
                        checked={attackerGigantamax}
                        onChange={(e) => {
                          setAttackerGigantamax(e.target.checked);
                          if (e.target.checked) setAttackerDynamax(false); // 상호 배제
                        }}
                      />
                    </>
                  )}
                </div>
              )}
              {renderStatInputs('attacker', attackerStats, attacker)}
              <div>
                <label>공격자 특성 - 스탯 보정 배율: </label>
                  <select value={attackerAbilityStatTarget} onChange={(e) => setAttackerAbilityStatTarget(e.target.value)}>
                    <option value="attack">공격</option>
                    <option value="spAttack">특수공격</option>
                  </select>
                <select value={attackerAbilityStatBonus} onChange={(e) => setAttackerAbilityStatBonus(Number(e.target.value))}>
                  {[1.0, 1.3, 1.5, 2.0].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>
              <div>
                <label>공격자 특성 - 기술 보정 배율: </label>
                <select value={attackerAbilityMoveBonus} onChange={(e) => setAttackerAbilityMoveBonus(Number(e.target.value))}>
                  {[1.0, 1.2, 1.3, 1.5, 2.0, 2.25].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>

              <div>
                <label>공격자 도구 - 스탯 보정 배율: </label>
                  <select value={attackerItemStatTarget} onChange={(e) => setAttackerItemStatTarget(e.target.value)}>
                    <option value="attack">공격</option>
                    <option value="spAttack">특수공격</option>
                  </select>
                <select value={attackerItemStatBonus} onChange={(e) => setAttackerItemStatBonus(Number(e.target.value))}>
                  {[1.0, 1.3, 1.5, 2.0].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>
              <div>
                <label>공격자 도구 - 위력 보정 배율: </label>
                <select value={attackerItemMoveBonus} onChange={(e) => setAttackerItemMoveBonus(Number(e.target.value))}>
                  {[1.0, 1.2, 1.3, 1.5, 2.0, 2.25].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>
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
                <p>
                  <strong>선택 기술:</strong> {moveToUse.nameKor}
                </p>
                <p>
                  속성: {moveToUse.type} / 분류: {moveToUse.damageClass} / 위력: {moveToUse.power}
                </p>
                {moveToUse.description && (
                  <p>효과: {moveToUse.description}</p>
                )}
              </div>
            )}
          </div>          
          
          {attacker && defender ? (
            <>
              <p>
                <strong>예상 데미지: {MinDamage} ~ {MaxDamage}</strong>
              </p>

              <p>
                <strong>상대 체력: {realHPStat}</strong>
              </p>

              {/* 데미지와 상대 HP 비교 후 타수 계산 및 출력 */}
              <DamageResult
                minDamage={MinDamage}
                maxDamage={MaxDamage}
                defenderHP={defenderRealStats.hp}
                defenderDynamax={defenderDynamax}
                generation={generation}
              />
            </>
          ) : (
            <p className="placeholder">양쪽 포켓몬을 선택하세요</p>
          )}

          {/* 필드 효과 선택 UI */}
          <div className="field-effects">
            <h4>필드 효과</h4>

            {/* 날씨 (radio group) */}
            <div className="weather-options">
              <label><input type="radio" name="weather" value="none" checked={fieldState.weather === 'none'} onChange={() => setFieldState({ ...fieldState, weather: 'none' })} /> 없음</label>
              <label><input type="radio" name="weather" value="sunny" checked={fieldState.weather === 'sunny'} onChange={() => setFieldState({ ...fieldState, weather: 'sunny' })} /> 쾌청</label>
              <label><input type="radio" name="weather" value="rain" checked={fieldState.weather === 'rain'} onChange={() => setFieldState({ ...fieldState, weather: 'rain' })} /> 비</label>
              <label><input type="radio" name="weather" value="sandstorm" checked={fieldState.weather === 'sandstorm'} onChange={() => setFieldState({ ...fieldState, weather: 'sandstorm' })} /> 모래바람</label>
              <label>
                <input
                  type="radio"
                  name="weather"
                  value="snow"
                  checked={fieldState.weather === 'snow'}
                  onChange={() => setFieldState({ ...fieldState, weather: 'snow' })}
                  disabled={generation !== '9'}
                />
                눈보라 (9세대 전용)
              </label>
            </div>

            {/* 기타 필드 효과 */}
            <div className="field-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={fieldState.reflect}
                  onChange={() => setFieldState((prev) => ({ ...prev, reflect: !prev.reflect }))}
                /> 리플렉터
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={fieldState.lightScreen}
                  onChange={() => setFieldState((prev) => ({ ...prev, lightScreen: !prev.lightScreen }))}
                /> 빛의장막
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={fieldState.gravity}
                  onChange={() => setFieldState((prev) => ({ ...prev, gravity: !prev.gravity }))}
                /> 중력
              </label>
            </div>
          </div>
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
              {generation === '9' && (
                <div>
                  <label>방어자 테라스탈 타입: </label>
                  <select value={defenderTeraType} onChange={(e) => setDefenderTeraType(e.target.value)}>
                    <option value="">기본</option>
                    {POKEMON_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {generation === '8' && (
                <div>
                  <label>방어자 다이맥스 여부: </label>
                  <input
                    type="checkbox"
                    checked={defenderDynamax}
                    onChange={(e) => setDefenderDynamax(e.target.checked)}
                  />
                </div>
              )}
              {renderStatInputs('defender', defenderStats, defender)}
              <div>
                <label>수비자 특성 - 스탯 보정 배율: </label>
                <select value={defenderAbilityStatTarget} onChange={(e) => setDefenderAbilityStatTarget(e.target.value)}>
                  <option value="defense">방어</option>
                  <option value="spDefense">특수방어</option>
                </select>
                <select value={defenderAbilityStatBonus} onChange={(e) => setDefenderAbilityStatBonus(Number(e.target.value))}>
                  {[0.75, 1.0, 1.3, 1.5, 2.0].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>
              <div>
                <label>수비자 특성 - 데미지 감소 배율: </label>
                <select value={defenderAbilityDamageReduce} onChange={(e) => setDefenderAbilityDamageReduce(Number(e.target.value))}>
                  {[1.0, 0.75, 0.5, 0.25].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>

              <div>
                <label>수비자 도구 - 스탯 보정 배율: </label>
                  <select value={defenderItemStatTarget} onChange={(e) => setDefenderItemStatTarget(e.target.value)}>
                    <option value="attack">공격</option>
                    <option value="spAttack">특수공격</option>
                  </select>
                <select value={defenderItemStatBonus} onChange={(e) => setDefenderItemStatBonus(Number(e.target.value))}>
                  {[1.0, 1.3, 1.5, 2.0].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>
              <div>
                <label>수비자 도구 - 위력 보정 배율: </label>
                <select value={defenderItemDamageReduce} onChange={(e) => setDefenderItemDamageReduce(Number(e.target.value))}>
                  {[1.0, 1.2, 1.3, 1.5, 2.0, 2.25].map((v) => (
                    <option key={v} value={v}>{v}배</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

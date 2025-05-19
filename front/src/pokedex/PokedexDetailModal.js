import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PokedexDetailModal.css';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 12,
      duration: 0.6,
    },
  },
  exit: {
    rotateY: 90,
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

const PokedexDetailModal = ({ pokemon, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {pokemon && (
        <motion.div
          className="modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="modal-card flip-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2>{pokemon.nameKor} ({pokemon.nameEng})</h2>
            </div>
            <img src={pokemon.imageUrl} alt={pokemon.nameKor} className="pokemon-image" />
            <div className="card-info">
              <p><strong>지역 도감 번호:</strong> {pokemon.regionNo}</p>
              <p><strong>전국 도감 번호:</strong> {pokemon.pokedexNo}</p>
              <p>
                <strong>타입:</strong>{' '}
                <span className={`type ${pokemon.type1.toLowerCase()}`}>{pokemon.type1}</span>
                {pokemon.type2 && (
                    <>
                    {' / '}
                    <span className={`type ${pokemon.type2.toLowerCase()}`}>{pokemon.type2}</span>
                    </>
                )}
              </p>
              <p><strong>HP:</strong> {pokemon.hp}</p>
              <p><strong>공격:</strong> {pokemon.attack}</p>
              <p><strong>방어:</strong> {pokemon.defense}</p>
              <p><strong>특수공격:</strong> {pokemon.spAttack}</p>
              <p><strong>특수방어:</strong> {pokemon.spDefense}</p>
              <p><strong>스피드:</strong> {pokemon.speed}</p>
            </div>
            <button className="close-button" onClick={onClose}>닫기</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PokedexDetailModal;

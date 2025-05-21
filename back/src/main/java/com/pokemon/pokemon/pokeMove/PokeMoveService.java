package com.pokemon.pokemon.pokeMove;

import java.util.List;

public interface PokeMoveService {

    void saveAllMoves();
    List<PokeMoveDTO> getAllMoves();
    
}

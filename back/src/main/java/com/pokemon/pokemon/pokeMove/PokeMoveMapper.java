package com.pokemon.pokemon.pokeMove;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PokeMoveMapper {

    void insertMove(PokeMoveDTO move);

    List<PokeMoveDTO> selectAllMoves();
    
}
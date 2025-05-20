package com.pokemon.pokemon.pokeMove;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PokeMoveMapper {

    void insertMove(PokeMoveDTO move);

    
}
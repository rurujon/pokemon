package com.pokemon.pokemon.pokeDex;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PokedexMapper {
    void insertGen8(PokedexDTO dto);
    void insertGen9(PokedexDTO dto);
}
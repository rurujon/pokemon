package com.pokemon.pokemon.pokeDexGen8;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PokedexGen8Mapper {
    void insertPokemon(PokedexGen8DTO pokemon);
}
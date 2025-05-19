package com.pokemon.pokemon.pokeDex;

import java.util.List;

public interface PokedexService {
    int savePokemonByGeneration(int generation);

    List<PokedexDTO> getPokedexByGeneration(int generation);
}
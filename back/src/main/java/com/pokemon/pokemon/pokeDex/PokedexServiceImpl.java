package com.pokemon.pokemon.pokeDex;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.pokemon.pokemon.pokeAPI.PokeApiService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PokedexServiceImpl implements PokedexService {

    private final PokeApiService pokeApiService;
    private final PokedexMapper pokedexMapper;

    @Override
    public int savePokemonByGeneration(int generation) {
        List<PokedexDTO> list;

        if (generation == 8) {
            list = pokeApiService.fetchGen8PokemonList();
            for (PokedexDTO dto : list) {
                pokedexMapper.insertGen8(dto);
            }
        } else if (generation == 9) {
            list = pokeApiService.fetchGen9PokemonList();
            for (PokedexDTO dto : list) {
                pokedexMapper.insertGen9(dto);
            }
        } else {
            throw new IllegalArgumentException("지원하지 않는 세대입니다: " + generation);
        }

        return list.size();
    }
}
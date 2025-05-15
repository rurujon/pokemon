package com.pokemon.pokemon.pokeDexGen8;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PokedexGen8ServiceImpl implements PokedexGen8Service {

    private final PokedexGen8Mapper mapper;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void savePokemon(PokedexGen8DTO dto) {



        mapper.insertPokemon(dto);
    }


}
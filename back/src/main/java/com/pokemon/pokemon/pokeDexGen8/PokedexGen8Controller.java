package com.pokemon.pokemon.pokeDexGen8;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gen8")
public class PokedexGen8Controller {

    @Autowired
    private PokedexGen8Service service;

    @PostMapping("/save")
    public void savePokemon(@RequestBody PokedexGen8DTO dto) {
        service.savePokemon(dto);
    }
    
}

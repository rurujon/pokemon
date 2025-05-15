package com.pokemon.pokemon.pokeDex;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/pokedex")
@RequiredArgsConstructor
public class PokedexController {

    private final PokedexService pokedexService;

    @PostMapping("/save")
    public ResponseEntity<String> saveByGen(@RequestParam("gen") int generation) {
        int count = pokedexService.savePokemonByGeneration(generation);
        return ResponseEntity.ok("Generation " + generation + " 포켓몬 " + count + "마리 저장 완료");
    }
}
package com.pokemon.pokemon.pokeMove;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/pokeMove")
@RequiredArgsConstructor
public class PokeMoveController {

    private final PokeMoveService pokeMoveService;

    @PostMapping("/save")
    public ResponseEntity<String> saveAllMoves() {
        pokeMoveService.saveAllMoves();
        return ResponseEntity.ok("모든 기술 저장 완료");
    }

    @GetMapping("/list")
    public List<PokeMoveDTO> loadMoves() {
        return pokeMoveService.getAllMoves();
    }


}
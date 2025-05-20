package com.pokemon.pokemon.pokeMove;

import org.springframework.stereotype.Service;

import com.pokemon.pokemon.pokeAPI.PokeMoveApi;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PokeMoveServiceImpl implements PokeMoveService {

    private final PokeMoveApi pokeMoveApi;
    private final PokeMoveMapper pokeMoveMapper;

    @Override
    public void saveAllMoves() {
        int maxId = 1000; // 안전하게 넉넉히, 실제 기술 수는 약 900개
        for (int id = 1; id <= maxId; id++) {
            try {
                PokeMoveDTO move = pokeMoveApi.fetchMoveFromApi(id);
                if (move != null && move.getNameKor() != null) {
                    pokeMoveMapper.insertMove(move);
                    System.out.println("Saved: " + move.getNameKor());
                }
            } catch (Exception e) {
                System.out.println("Skip ID " + id + " - " + e.getMessage());
            }
        }
    }
}

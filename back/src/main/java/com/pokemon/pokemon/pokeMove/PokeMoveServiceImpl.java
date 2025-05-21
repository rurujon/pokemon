package com.pokemon.pokemon.pokeMove;

import java.util.List;

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
        List<PokeMoveDTO> moveList = pokeMoveApi.fetchAllMoves();

        int k=0;

        for (PokeMoveDTO move : moveList) {
            k++;
            System.out.println(k);
            pokeMoveMapper.insertMove(move);
        }
    }

    @Override
    public List<PokeMoveDTO> getAllMoves() {
        // TODO Auto-generated method stub
        return pokeMoveMapper.selectAllMoves();
    }
}

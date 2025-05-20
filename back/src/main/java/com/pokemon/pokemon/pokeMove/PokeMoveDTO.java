package com.pokemon.pokemon.pokeMove;

import lombok.Data;

@Data
public class PokeMoveDTO {

    private int id;
    private String nameEng;
    private String nameKor;
    private Integer power;
    private Integer accuracy;
    private Integer pp;
    private String type;
    private String damageClass;
    
}

package com.pokemon.pokemon.pokeDexGen9;

import lombok.Data;

@Data
public class PokedexGen9DTO {

    private int id;
    private String nameKor; // 한국어 이름
    private String nameEng; // 영어 이름
    private String type1;
    private String type2;
    private int hp;
    private int attack;
    private int defense;
    private int spAttack;
    private int spDefense;
    private int speed;
    private String imageUrl;
    
}

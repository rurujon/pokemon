package com.pokemon.pokemon.pokeDex;

import lombok.Data;

@Data
public class PokedexDTO {

    private int id;
    private int regionNo;   //지역 도감 번호
    private int pokedexNo;  //전국 도감 번호
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

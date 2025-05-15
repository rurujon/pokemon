package com.pokemon.pokemon.pokeAPI;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.pokemon.pokemon.pokeDex.PokedexDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PokeApiService {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<PokedexDTO> fetchGen8PokemonList() {
        return fetchPokemonList("galar");
    }

    public List<PokedexDTO> fetchGen9PokemonList() {
        return fetchPokemonList("paldea");
    }

    private <T> List<T> fetchPokemonList(String regionName) {
        List<T> resultList = new ArrayList<>();

        String pokedexUrl = "https://pokeapi.co/api/v2/pokedex/" + regionName;
        Map<String, Object> pokedexResponse = restTemplate.getForObject(pokedexUrl, Map.class);
        List<Map<String, Object>> entries = (List<Map<String, Object>>) pokedexResponse.get("pokemon_entries");

        int index = 1;
        for (Map<String, Object> entry : entries) {
            Map<String, String> pokemon = (Map<String, String>) entry.get("pokemon_species");
            String nameEng = pokemon.get("name");

            // API 호출: 포켓몬 상세 정보
            Map<String, Object> details = restTemplate.getForObject("https://pokeapi.co/api/v2/pokemon/" + nameEng, Map.class);
            Map<String, Object> species = restTemplate.getForObject("https://pokeapi.co/api/v2/pokemon-species/" + nameEng, Map.class);

            List<Map<String, Object>> names = (List<Map<String, Object>>) species.get("names");
            String nameKor = names.stream()
                .filter(n -> "ko".equals(((Map<String, Object>) n.get("language")).get("name")))
                .map(n -> (String) n.get("name"))
                .findFirst()
                .orElse(nameEng); // fallback

            List<Map<String, Object>> types = (List<Map<String, Object>>) details.get("types");
            String type1 = null, type2 = null;
            for (Map<String, Object> t : types) {
                Map<String, String> typeInfo = (Map<String, String>) t.get("type");
                int slot = (int) t.get("slot");
                if (slot == 1) type1 = typeInfo.get("name");
                else if (slot == 2) type2 = typeInfo.get("name");
            }

            Map<String, Object> stats = new HashMap<>();
            for (Map<String, Object> stat : (List<Map<String, Object>>) details.get("stats")) {
                String statName = (String) ((Map<String, Object>) stat.get("stat")).get("name");
                stats.put(statName, stat.get("base_stat"));
            }

            String imageUrl = (String) ((Map<String, Object>) details.get("sprites")).get("front_default");

            PokedexDTO dto = new PokedexDTO();
            dto.setId(index++);
            dto.setNameKor(nameKor);
            dto.setNameEng(nameEng);
            dto.setType1(type1);
            dto.setType2(type2);
            dto.setHp((Integer) stats.get("hp"));
            dto.setAttack((Integer) stats.get("attack"));
            dto.setDefense((Integer) stats.get("defense"));
            dto.setSpAttack((Integer) stats.get("special-attack"));
            dto.setSpDefense((Integer) stats.get("special-defense"));
            dto.setSpeed((Integer) stats.get("speed"));
            dto.setImageUrl(imageUrl);
            resultList.add((T) dto);
        }

        return resultList;
    }
}
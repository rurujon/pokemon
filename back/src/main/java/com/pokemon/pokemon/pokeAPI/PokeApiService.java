package com.pokemon.pokemon.pokeAPI;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

        Set<String> validFormNames = new HashSet<>();

        int index = 1;
        for (Map<String, Object> entry : entries) {
            Map<String, Object> pokemon = (Map<String, Object>) entry.get("pokemon_species");
            String baseName = (String) pokemon.get("name");
            Integer regionNo = (Integer) entry.get("entry_number");

            // API 호출: 포켓몬 상세 정보
            Map<String, Object> species = restTemplate.getForObject("https://pokeapi.co/api/v2/pokemon-species/" + baseName, Map.class);

            Integer pokedexNo = (Integer) species.get("id");
            List<Map<String, Object>> names = (List<Map<String, Object>>) species.get("names");
            String baseNameKor = names.stream()
                .filter(n -> "ko".equals(((Map<String, Object>) n.get("language")).get("name")))
                .map(n -> (String) n.get("name"))
                .findFirst()
                .orElse(baseName);


            List<Map<String, Object>> varieties = (List<Map<String, Object>>) species.get("varieties");

            for (Map<String, Object> variety : varieties) {
                Map<String, Object> varietyPokemon = (Map<String, Object>) variety.get("pokemon");
                String varietyName = (String) varietyPokemon.get("name");

                // *** 세대 도감에 실제 등장하는 폼만 필터링 ***
                // 기본 종 이름과 같으면 무조건 포함
                // 아니면 varietyName에 regionName 포함되는 경우만 포함
                if (!varietyName.equals(baseName) && !varietyName.contains(regionName)) {
                    continue; // 이 폼은 해당 세대 도감에 없음 -> 스킵
                }

                Map<String, Object> details;
                try {
                    details = restTemplate.getForObject("https://pokeapi.co/api/v2/pokemon/" + varietyName, Map.class);
                } catch (Exception e) {
                    System.out.println("Error fetching " + varietyName + ": " + e.getMessage());
                    continue;
                }

                String varietyNameKor = null;
                try {
                    Map<String, Object> varietySpecies = restTemplate.getForObject(
                        "https://pokeapi.co/api/v2/pokemon-species/" + varietyName, Map.class
                    );

                    List<Map<String, Object>> varietyNames = (List<Map<String, Object>>) varietySpecies.get("names");
                    varietyNameKor = varietyNames.stream()
                        .filter(n -> "ko".equals(((Map<String, Object>) n.get("language")).get("name")))
                        .map(n -> (String) n.get("name"))
                        .findFirst()
                        .orElse(varietyName);
                } catch (Exception e) {
                    // species API가 없는 경우 - 폼 이름 파싱으로 처리 (ex. gmax 등)
                    varietyNameKor = parseFormKorName(baseNameKor, varietyName);
                }

                // 기본 폼이면 그냥 기본 이름 사용, 다르면 괄호 처리
                String nameKor = varietyNameKor.equals(baseNameKor)
                    ? baseNameKor
                    : baseNameKor + " (" + varietyNameKor.replace(baseNameKor, "").trim() + ")";

                // 타입
                List<Map<String, Object>> types = (List<Map<String, Object>>) details.get("types");
                String type1 = null, type2 = null;
                for (Map<String, Object> t : types) {
                    Map<String, String> typeInfo = (Map<String, String>) t.get("type");
                    int slot = (int) t.get("slot");
                    if (slot == 1) type1 = typeInfo.get("name");
                    else if (slot == 2) type2 = typeInfo.get("name");
                }

                // 스탯
                Map<String, Object> stats = new HashMap<>();
                for (Map<String, Object> stat : (List<Map<String, Object>>) details.get("stats")) {
                    String statName = (String) ((Map<String, Object>) stat.get("stat")).get("name");
                    stats.put(statName, stat.get("base_stat"));
                }

                // 이미지
                String imageUrl = (String) ((Map<String, Object>) details.get("sprites")).get("front_default");

                // DTO 작성
                PokedexDTO dto = new PokedexDTO();
                dto.setId(index++);
                dto.setNameKor(nameKor);
                dto.setNameEng(varietyName);
                dto.setType1(type1);
                dto.setType2(type2);
                dto.setHp((Integer) stats.get("hp"));
                dto.setAttack((Integer) stats.get("attack"));
                dto.setDefense((Integer) stats.get("defense"));
                dto.setSpAttack((Integer) stats.get("special-attack"));
                dto.setSpDefense((Integer) stats.get("special-defense"));
                dto.setSpeed((Integer) stats.get("speed"));
                dto.setImageUrl(imageUrl);
                dto.setPokedexNo(pokedexNo);
                dto.setRegionNo(regionNo);

                resultList.add((T) dto);

                System.out.println(nameKor);
            }
        }

        return resultList;
    }

    private String parseFormKorName(String baseNameKor, String varietyName) {
        if (varietyName.contains("gmax")) return baseNameKor + " (거다이맥스)";
        if (varietyName.contains("galar")) return baseNameKor + " (가라르의 모습)";
        if (varietyName.contains("alola")) return baseNameKor + " (알로라의 모습)";
        if (varietyName.contains("hisui")) return baseNameKor + " (히스이의 모습)";
        if (varietyName.contains("paldea")) return baseNameKor + " (팔데아의 모습)";
        if (varietyName.contains("mega-x")) return baseNameKor + " (메가진화 X)";
        if (varietyName.contains("mega-y")) return baseNameKor + " (메가진화 Y)";
        if (varietyName.contains("mega")) return baseNameKor + " (메가진화)";
        return baseNameKor + " (기타 폼)";
    }
}
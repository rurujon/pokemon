package com.pokemon.pokemon.pokeAPI;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.pokemon.pokemon.pokeMove.PokeMoveDTO;

@Service
public class PokeMoveApi {

        private final RestTemplate restTemplate = new RestTemplate();

    public PokeMoveDTO fetchMoveFromApi(int id) {
        String url = "https://pokeapi.co/api/v2/move/" + id;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            Map data = response.getBody();
            if (data == null) return null;

            PokeMoveDTO move = new PokeMoveDTO();
            move.setId((Integer) data.get("id"));
            move.setNameEng((String) data.get("name"));
            move.setPower((Integer) data.get("power"));
            move.setAccuracy((Integer) data.get("accuracy"));
            move.setPp((Integer) data.get("pp"));

            Map type = (Map) data.get("type");
            move.setType((String) type.get("name"));

            Map damageClass = (Map) data.get("damage_class");
            move.setDamageClass((String) damageClass.get("name"));

            List<Map> names = (List<Map>) data.get("names");
            for (Map nameEntry : names) {
                Map lang = (Map) nameEntry.get("language");
                if ("ko".equals(lang.get("name"))) {
                    move.setNameKor((String) nameEntry.get("name"));
                    break;
                }
            }

            return move;
        }

        return null;
    }
    
}

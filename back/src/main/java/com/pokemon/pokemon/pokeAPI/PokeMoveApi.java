package com.pokemon.pokemon.pokeAPI;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.pokemon.pokemon.pokeMove.PokeMoveDTO;

import org.json.JSONObject;
import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class PokeMoveApi {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BASE_URL = "https://pokeapi.co/api/v2/move";

    public List<PokeMoveDTO> fetchAllMoves() {
        List<PokeMoveDTO> moveList = new ArrayList<>();

        try {
            // 1. 전체 move 목록 가져오기
            String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
                    .queryParam("limit", 1000)
                    .queryParam("offset", 0)
                    .toUriString();

            JSONObject response = new JSONObject(restTemplate.getForObject(url, String.class));
            JSONArray results = response.getJSONArray("results");

            // 2. 각 move 상세 정보 가져오기
            for (int i = 0; i < results.length(); i++) {
                JSONObject moveSummary = results.getJSONObject(i);
                String moveUrl = moveSummary.getString("url");

                try {
                    JSONObject moveDetail = new JSONObject(restTemplate.getForObject(moveUrl, String.class));
                    PokeMoveDTO move = parseMove(moveDetail);
                    moveList.add(move);

                    // 속도 조절 (API 제한 대비)
                    Thread.sleep(100);
                } catch (Exception e) {
                    log.warn("Failed to fetch move detail from: " + moveUrl, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch move list", e);
        }

        return moveList;
    }

    private PokeMoveDTO parseMove(JSONObject moveDetail) {
        PokeMoveDTO move = new PokeMoveDTO();

        move.setId(moveDetail.getInt("id"));
        move.setNameEng(moveDetail.getString("name"));
        move.setPower(moveDetail.isNull("power") ? null : moveDetail.getInt("power"));
        move.setAccuracy(moveDetail.isNull("accuracy") ? null : moveDetail.getInt("accuracy"));
        move.setPp(moveDetail.isNull("pp") ? null : moveDetail.getInt("pp"));

        // 타입
        move.setType(moveDetail.getJSONObject("type").getString("name"));

        // 물리/특수/변화 분류
        move.setDamageClass(moveDetail.getJSONObject("damage_class").getString("name"));

        // 한국어 이름 찾기
        JSONArray names = moveDetail.getJSONArray("names");
        String nameKor = null;
        for (int j = 0; j < names.length(); j++) {
            JSONObject nameObj = names.getJSONObject(j);
            if ("ko".equals(nameObj.getJSONObject("language").getString("name"))) {
                move.setNameKor(nameObj.getString("name"));
                nameKor = nameObj.getString("name");  // ✅ 값을 변수에 저장만 함
                break;
            }
        }

        // 한글 이름이 없으면 영문 이름으로 대체
        move.setNameKor(nameKor != null ? nameKor : move.getNameEng());

        return move;
    }
}

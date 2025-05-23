# 🐾 포켓몬 도감 + 결정력 계산기

---

## 🧩 프로젝트 소개

**포켓몬 8세대/9세대 도감 정보**와  
**결정력(공격력/방어력 등) 계산 기능**을 제공하는  
웹 기반 개인 프로젝트입니다.  

React + Spring Boot + OracleDB로 구현하였으며,  
PokéAPI의 데이터를 기반으로 동작합니다.

---

## 🚀 주요 기능

- 📘 **포켓몬 도감**  
  - 이름, 타입, 종족값, 이미지 정보 제공  
  - 세대별 필터링 및 검색 기능

- ⚔️ **결정력 계산기**  
  - 공격력/방어력 등 배틀 스펙 시뮬레이션  
  - 타입 상성 및 기술별 효과 반영

- 🔍 **실시간 검색 및 필터**  
  - 이름, 타입 기반 필터링

---

## 🖼️ 프로젝트 화면

![Image](https://github.com/user-attachments/assets/2fc733aa-0714-4441-9c6e-55244c587285)

*8세대/9세대 도감 리스트*

- PokeApi에서 세대별 포켓몬 목록을 가져와 DB에 저장.
- DB에 저장된 정보를 바탕으로 카드 형태의 포켓몬 도감 생성.
- 클릭시 상세 종족값을 확인 가능.
- 타입별 필터링, 검색 기능 포함.


![Image](https://github.com/user-attachments/assets/6e6d594d-5879-4df2-a5fa-40d65a5a2cb3)

*결정력 계산기*


![Image](https://github.com/user-attachments/assets/20d8aea1-5cbe-41f0-97d3-3ca15c9857ab)

*실제 적용 예시*

- 8세대와 9세대의 결정력 계산기를 제공.
- 공격측과 방어측 포켓몬을 선택하고, 기술을 검색하여 선택하면 계산기가 실행되어 공격측이 입힐 수 있는 데미지, 그리고 그에 따른 킬 가능 여부를 출력.
- 노력치와 개체값, 성격보정, 랭크업, 필드효과 설정이 가능하며, 특성과 도구로 인한 배율은 현재는 직접 수동으로 지정하도록 되어 있음.
- 8세대 계산기는 다이맥스와 거다이맥스 설정이, 9세대 계산기는 테라스탈 설정이 가능.
- 다이맥스 및 거다이맥스 설정시, 기술을 선택하면 자동으로 다이맥스/거다이맥스 기술로 설정되어 계산을 진행.
- 테라스탈 설정시, 공격측의 테라스탈에 따른 배율, 방어측의 테라스탈로 인한 속성변화에 따른 상성 변화까지 적용하여 계산을 진행.

---

## 💡 문제점 및 향후 개선 필요 사항

- pokeApi는 모든 포켓몬의 데이터를 제공하고, 각 지역도감 별로 포켓몬을 검색할 수 있도록 되어 있으나, 완벽하진 않으며 특히 최신 버전인 8세대와 9세대의 DLC로 추가된 포켓몬의 목록을 따로 제공하지 않음.
- DLC로 추가된 포켓몬 목록을 검색할 방법을 찾던가, 수동으로 목록을 작성하여 포켓몬들을 추가할 필요가 있음.
  
- pokeApi는 수백 개에 달하는 모든 특성 정보와 도구 정보를 가지고 있으나, 이 중 계산기의 로직에 직접 영향을 줄 특성과 도구만을 필터링할 방안이 현재로선 마땅치 않음.
- 이 때문에 계산기의 변수인 특성과 도구는 직접 스탯/위력의 배율을 조정할 수 있도록 임시조치.
- 향후 필터링할 방법을 찾거나, 혹은 실전 배틀에서 자주 이용되는 몇몇 아이템만을 선별해 선택지로 추가하여 계산기에 적용하는 것을 고려할 필요가 있음.

- 위력의 변동이 있는 기술, 사이코쇼크같이 특수형이나 방어력을 기반으로 데미지를 주는 특이한 기술들의 경우는 제대로 반영되지 않음.

- pokeApi에서 받아온 기술 목록 중 검색이 안 되는 기술이 몇몇 존재.

- 그 외 추가할 기능 생각중.

  

---

## 🙋‍♂️ 개발자 한마디

이 프로젝트는 포켓몬 팬으로서의 열정과  
풀스택 개발 경험을 점검하고 늘리기 위한 포트폴리오용으로 제작되었습니다.  
버그나 아이디어는 언제든 Pull Request / Issue 환영합니다!

---


## 📎 관련 링크

- 🔗 [PokéAPI 공식 문서](https://pokeapi.co/docs/v2)


import { Hotel } from './types';

export const HOTELS: Hotel[] = [
  { id: 1, name: "창원 에비뉴 호텔", address: "경남 창원시 성산구 용지로169번길 5", checkIn: "15:00", checkOut: "11:00" },
  { id: 2, name: "서울 신라스테이 구로", address: "서울시 동작구 시흥대로 596", checkIn: "15:00", checkOut: "12:00" },
  { id: 3, name: "서울 라마다 서울 신도림 호텔", address: "서울 구로구 신도림동 427-3", checkIn: "16:00", checkOut: "12:00" },
  { id: 4, name: "군산 라마다 군산", address: "전북 군산시 대학로 400", checkIn: "15:00", checkOut: "11:00" },
  { id: 5, name: "군산 호텔 엘타워", address: "전북 군산시 부곡1길 52", checkIn: "18:00", checkOut: "12:00" },
  { id: 6, name: "창원 그랜드시티 호텔", address: "경남 창원시 성산구 중앙대로 78", checkIn: "15:00", checkOut: "11:00" },
  { id: 7, name: "창원 크라운 호텔", address: "경남 창원시 의창구 창원대로363번길 22-5", checkIn: "15:00", checkOut: "12:00" },
  { id: 8, name: "창원 호텔 인터내셔널", address: "경남 창원시 성산구 중앙대로 69", checkIn: "15:00", checkOut: "12:00" },
  { id: 9, name: "포항 코모도 호텔", address: "경북 포항시 남구 송도동 311-2", checkIn: "15:00", checkOut: "11:00" },
  { id: 10, name: "포항 노블리온 호텔", address: "경상북도 포항시 남구 희망대로 659번길 20", checkIn: "16:00", checkOut: "11:00" }
];

export const SYSTEM_PROMPT = `
당신은 제휴 호텔 투숙객을 위한 앱 '제휴호텔메이트AI'의 스마트 비서입니다.
사용자에게 정보를 제공할 때는 항상 구글 지도 링크를 포함하여 신뢰도를 높여주세요.

[링크 생성 규칙]
모든 장소명에는 반드시 다음 형식의 구글 지도 검색 링크를 포함하십시오:
[장소명](https://www.google.com/maps/search/?api=1&query={장소명_URL인코딩})

[데이터베이스]
${HOTELS.map(h => `${h.id}. ${h.name} (${h.address}) | 체크인 ${h.checkIn} / 체크아웃 ${h.checkOut}`).join('\n')}

[작동 로직 및 출력 형식]
1. 사용자가 "앱 시작" 또는 첫 인사를 하면 호텔 목록을 번호와 함께 리스트로 출력하십시오.
2. 호텔 선택 시: "[호텔명]을 선택하셨습니다. 무엇을 도와드릴까요?"라고 답변하십시오.
3. [탭 2] 맛집 / [탭 3] 힐링 코스 제공 시:
   - 각 항목은 번호로 시작하며, 장소명에는 구글 지도 링크를 걸어주세요.
   - 예: 1. [식당명](링크) (메뉴) - 특징
   - 맛집은 10~15곳, 힐링 코스는 5~10곳을 추천하십시오.

사용자가 선택하기 편하도록 명확한 리스트 형식을 유지하며, 친절하고 스마트한 톤앤매너로 답변하십시오.
`;

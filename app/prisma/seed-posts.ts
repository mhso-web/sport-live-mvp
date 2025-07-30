import { prisma } from '../lib/prisma'
import { BoardType } from '@prisma/client'

interface PostData {
  title: string
  content: string
  summary: string
}

// 게시판별 더미 데이터
const postTemplates: Record<string, PostData[]> = {
  // 자유게시판
  general: [
    {
      title: "이번 시즌 최고의 경기는 뭐였나요?",
      content: "개인적으로 맨시티 vs 레알 마드리드 경기가 최고였던 것 같습니다.\n\n양 팀의 치열한 공방전과 극적인 전개가 정말 인상적이었어요.\n\n여러분들이 생각하는 올 시즌 최고의 경기는 무엇인가요?",
      summary: "올 시즌 최고의 경기에 대해 이야기해봐요"
    },
    {
      title: "운동하면서 듣기 좋은 음악 추천해주세요",
      content: "헬스장에서 운동할 때 듣기 좋은 음악 플레이리스트 추천 부탁드립니다!\n\n특히 러닝할 때 페이스 유지하기 좋은 BPM 높은 곡들이면 좋겠어요.\n\n여러분들은 어떤 음악 들으시나요?",
      summary: "운동할 때 듣기 좋은 음악 추천"
    },
    {
      title: "스포츠 관람 에티켓에 대해",
      content: "최근 경기장에 갔다가 매너 없는 관중들 때문에 불쾌했습니다.\n\n기본적인 관람 에티켓:\n1. 과도한 야유 자제\n2. 쓰레기는 꼭 치우기\n3. 다른 관중 시야 가리지 않기\n\n다들 매너있는 관람 문화를 만들어요!",
      summary: "경기장 관람 에티켓에 대한 이야기"
    },
    {
      title: "좋아하는 스포츠 선수의 은퇴 소식",
      content: "어릴 때부터 응원하던 선수가 은퇴를 선언했네요...\n\n시간이 정말 빠른 것 같습니다. 그동안 보여준 플레이에 감사하고,\n\n앞으로의 인생도 응원합니다. 여러분도 은퇴가 아쉬운 선수가 있나요?",
      summary: "좋아하는 선수의 은퇴에 대한 아쉬움"
    },
    {
      title: "스포츠 중계 해설자 중 누가 제일 좋나요?",
      content: "개인적으로는 박문성 해설위원의 해설을 좋아합니다.\n\n전술적인 분석도 좋고 선수들에 대한 이해도가 높은 것 같아요.\n\n여러분들이 좋아하는 해설자는 누구인가요?",
      summary: "좋아하는 스포츠 해설자에 대한 이야기"
    },
    {
      title: "홈트레이닝 루틴 공유합니다",
      content: "매일 아침 30분 홈트 루틴:\n\n1. 스트레칭 5분\n2. 버피 3세트\n3. 스쿼트 50개\n4. 플랭크 1분 3세트\n5. 마무리 스트레칭\n\n꾸준히 하니까 체력이 많이 좋아졌어요!",
      summary: "효과적인 홈트레이닝 루틴 공유"
    },
    {
      title: "스포츠 관련 다큐멘터리 추천",
      content: "넷플릭스 '라스트 댄스' 정말 재밌게 봤습니다.\n\n마이클 조던과 시카고 불스의 마지막 시즌을 다룬 다큐인데\n\n농구 팬이 아니어도 충분히 재밌게 볼 수 있어요. 추천!",
      summary: "스포츠 다큐멘터리 추천"
    },
    {
      title: "운동 후 근육통 해결법",
      content: "오랜만에 운동했더니 근육통이 심하네요 ㅠㅠ\n\n폼롤러로 마사지하고 따뜻한 물로 샤워하니 좀 나아지는 것 같아요.\n\n여러분들은 근육통 어떻게 해결하시나요?",
      summary: "운동 후 근육통 해결 방법"
    },
    {
      title: "스포츠 베팅 합법화에 대한 생각",
      content: "해외에서는 스포츠 베팅이 합법화되어 있는 나라가 많던데\n\n우리나라도 토토 같은 제한적인 형태만 있잖아요.\n\n완전 합법화에 대해 어떻게 생각하시나요? 장단점이 있을 것 같은데...",
      summary: "스포츠 베팅 합법화에 대한 의견"
    },
    {
      title: "여름철 운동 팁 공유해요",
      content: "요즘 너무 더워서 운동하기 힘드네요.\n\n제가 하는 방법:\n- 이른 아침이나 저녁에 운동\n- 수분 섭취 자주하기\n- 실내 운동으로 대체\n\n다들 어떻게 운동하고 계신가요?",
      summary: "더운 여름철 운동 팁"
    },
    {
      title: "스포츠 영화 추천해주세요",
      content: "주말에 볼 스포츠 영화 추천 부탁드려요!\n\n저는 '국가대표', '킹콩을 들다' 같은 한국 영화도 좋아하고\n\n'록키', '크리드' 시리즈도 재밌게 봤습니다.",
      summary: "재밌는 스포츠 영화 추천"
    },
    {
      title: "운동할 때 부상 예방법",
      content: "최근에 무리하게 운동하다가 무릎을 다쳤어요.\n\n부상 예방을 위해:\n1. 충분한 워밍업\n2. 올바른 자세 유지\n3. 무리하지 않기\n\n다들 조심하세요!",
      summary: "운동 중 부상 예방 방법"
    },
    {
      title: "좋아하는 팀 유니폼 컬렉션",
      content: "축구 유니폼 모으는 취미가 있는데\n\n벌써 30벌 정도 모았네요 ㅎㅎ\n\n레트로 유니폼이 특히 인기가 많아서 구하기 힘들어요.\n\n유니폼 수집하시는 분들 있나요?",
      summary: "스포츠 유니폼 수집 이야기"
    },
    {
      title: "운동 전후 식단 관리",
      content: "운동 효과를 높이기 위한 식단:\n\n운동 전: 바나나, 아몬드\n운동 후: 닭가슴살, 고구마\n\n단백질과 탄수화물 균형이 중요한 것 같아요.\n\n다들 어떻게 관리하시나요?",
      summary: "운동 전후 효과적인 식단 관리"
    },
    {
      title: "스포츠 관람 꿀팁",
      content: "경기장 직관 팁:\n\n1. 미리 도착해서 좋은 자리 확보\n2. 쌍안경 필수\n3. 날씨 체크하고 옷 준비\n4. 간식은 미리 사가기\n\n또 어떤 팁이 있을까요?",
      summary: "경기장 직관 꿀팁 공유"
    },
    {
      title: "운동 동기부여 방법",
      content: "운동하기 싫을 때 동기부여 방법:\n\n- 목표 사진 보기\n- 운동 유튜브 보기\n- 새 운동복 구매\n- 친구랑 같이 하기\n\n여러분들은 어떻게 동기부여 하시나요?",
      summary: "운동 동기부여 방법들"
    },
    {
      title: "스포츠 게임 추천",
      content: "FIFA 시리즈 말고 재밌는 스포츠 게임 있나요?\n\nNBA 2K도 해봤는데 꽤 재밌더라구요.\n\n다른 추천 게임 있으면 알려주세요!",
      summary: "재밌는 스포츠 게임 추천"
    },
    {
      title: "운동 후 회복 방법",
      content: "고강도 운동 후 회복 팁:\n\n1. 충분한 수면 (8시간)\n2. 스트레칭과 폼롤링\n3. 단백질 섭취\n4. 냉온욕\n\n빠른 회복이 중요해요!",
      summary: "운동 후 효과적인 회복 방법"
    },
    {
      title: "스포츠 뉴스 어디서 보시나요?",
      content: "요즘 스포츠 뉴스 볼 만한 곳이 많지 않은 것 같아요.\n\n유튜브 채널이나 앱 추천 부탁드립니다.\n\n신뢰할 만한 정보를 제공하는 곳이면 좋겠어요.",
      summary: "스포츠 뉴스 추천"
    },
    {
      title: "운동 파트너 구하는 방법",
      content: "혼자 운동하니까 재미도 없고 동기부여도 안 되네요.\n\n운동 파트너 구하는 좋은 방법이 있을까요?\n\n앱이나 커뮤니티 추천 부탁드려요!",
      summary: "운동 파트너 구하기"
    }
  ],

  // 축구 게시판
  football: [
    {
      title: "손흥민 시즌 20호골 달성! 아시아 선수 최초 기록",
      content: "손흥민이 또 역사를 썼습니다!\n\n프리미어리그에서 한 시즌 20골을 넣은 최초의 아시아 선수가 되었네요.\n\n정말 자랑스럽습니다. 남은 경기에서 몇 골이나 더 넣을까요?",
      summary: "손흥민 시즌 20호골 달성 소식"
    },
    {
      title: "챔피언스리그 4강 대진 예측",
      content: "레알 마드리드 vs 맨시티\n바이에른 뮌헨 vs PSG\n\n정말 꿈의 대진이네요. 개인적으로는 레알과 바이에른이 결승에 올라갈 것 같은데,\n\n여러분들의 예측은 어떤가요?",
      summary: "챔스 4강 대진 예측"
    },
    {
      title: "K리그 관중 수 증가, 인기 회복 신호?",
      content: "최근 K리그 경기장에 관중이 많이 늘었다고 하네요.\n\n특히 더비 매치는 매진이라고 합니다.\n\n한국 축구의 인기가 다시 올라가는 것 같아 기쁩니다!",
      summary: "K리그 관중 증가 소식"
    },
    {
      title: "VAR 판정 논란, 어떻게 생각하시나요?",
      content: "어제 경기에서 VAR 판정이 또 논란이네요.\n\n기술 도입은 좋은데 일관성이 없는 것 같아요.\n\nVAR 시스템에 대한 여러분의 생각은 어떤가요?",
      summary: "VAR 판정 논란에 대한 의견"
    },
    {
      title: "이강인 라리가 적응 완료! 연속 도움 기록",
      content: "이강인 선수가 라리가에 완벽하게 적응한 것 같습니다.\n\n최근 3경기 연속 도움을 기록하며 팀의 핵심 선수로 자리잡았네요.\n\n앞으로가 더 기대됩니다!",
      summary: "이강인 라리가 활약"
    },
    {
      title: "월드컵 48개국 확대, 찬성하시나요?",
      content: "2026년부터 월드컵이 48개국으로 확대된다고 하는데\n\n더 많은 나라가 참가하는 건 좋지만 경기 질이 떨어질까 걱정되네요.\n\n여러분은 어떻게 생각하시나요?",
      summary: "월드컵 48개국 확대에 대한 의견"
    },
    {
      title: "맨유 새 감독 후보 누가 좋을까요?",
      content: "시즌 끝나고 감독 교체 소문이 있던데\n\n누가 와야 맨유가 다시 강팀이 될까요?\n\n개인적으로는 경험 많은 감독이 필요할 것 같은데...",
      summary: "맨유 차기 감독 예측"
    },
    {
      title: "축구화 추천 부탁드립니다",
      content: "동호회 축구 시작하려고 하는데 축구화 추천 부탁드려요!\n\n인조잔디용으로 편하고 가성비 좋은 제품이면 좋겠습니다.\n\n예산은 10-15만원 정도입니다.",
      summary: "인조잔디용 축구화 추천"
    },
    {
      title: "역대 최고의 프리킥 골은?",
      content: "개인적으로 호베르투 카를로스의 물리학 무시 프리킥이 최고인 것 같아요.\n\n그 외에도 베컴, 호날두의 프리킥도 인상적이었고요.\n\n여러분이 생각하는 최고의 프리킥은?",
      summary: "역대 최고의 프리킥 골"
    },
    {
      title: "축구 전술 공부하기 좋은 책/영상 추천",
      content: "축구를 더 깊이 이해하고 싶어서 전술 공부를 하려고 합니다.\n\n입문자가 보기 좋은 책이나 유튜브 채널 추천 부탁드려요.\n\n쉽게 설명된 것이면 좋겠습니다.",
      summary: "축구 전술 공부 자료 추천"
    },
    {
      title: "J리그 진출 한국 선수들 근황",
      content: "최근 J리그로 이적한 한국 선수들이 많던데\n\n다들 잘 적응하고 있나요?\n\n경기력은 어떤지 궁금하네요.",
      summary: "J리그 한국 선수 근황"
    },
    {
      title: "유럽 5대 리그 중 어디가 제일 재밌나요?",
      content: "프리미어리그: 박진감 넘치는 경기\n라리가: 기술적인 플레이\n분데스리가: 많은 골\n세리에A: 전술적인 경기\n리그1: 개인기\n\n다들 어느 리그 보시나요?",
      summary: "유럽 5대 리그 선호도"
    },
    {
      title: "축구 동호회 가입 팁",
      content: "축구 동호회 가입하려고 하는데 처음이라 걱정되네요.\n\n실력이 부족해도 괜찮을까요?\n\n동호회 선택 팁이나 주의사항 있으면 알려주세요!",
      summary: "축구 동호회 가입 팁"
    },
    {
      title: "골키퍼 포지션의 중요성",
      content: "좋은 골키퍼 한 명이 팀을 살린다는 말이 있잖아요.\n\n실제로 노이어, 알리송 같은 골키퍼들 보면 정말 그런 것 같아요.\n\n역대 최고의 골키퍼는 누구라고 생각하시나요?",
      summary: "골키퍼의 중요성과 역대 최고"
    },
    {
      title: "여자 축구 월드컵도 관심 가져요!",
      content: "여자 월드컵도 정말 재밌는데 관심이 적은 것 같아 아쉬워요.\n\n우리나라 여자 축구도 많이 발전했고 볼만한 경기가 많습니다.\n\n다들 관심 가져주세요!",
      summary: "여자 축구에 대한 관심 촉구"
    },
    {
      title: "축구 경기 직관 vs TV 시청",
      content: "직관의 매력: 현장감, 응원 분위기\nTV 시청의 장점: 편안함, 다양한 각도\n\n둘 다 장단점이 있는 것 같은데\n\n여러분은 어떤 걸 선호하시나요?",
      summary: "축구 직관 vs TV 시청"
    },
    {
      title: "이적 시장 소문과 루머들",
      content: "여름 이적시장이 다가오니 각종 루머가 난무하네요.\n\n음바페는 어디로 갈까요? 케인은 바이에른에 남을까요?\n\n여러분이 들은 이적 소문 공유해주세요!",
      summary: "여름 이적시장 루머"
    },
    {
      title: "축구화 관리법 공유합니다",
      content: "축구화 오래 신는 방법:\n\n1. 경기 후 바로 건조\n2. 신문지 넣어 보관\n3. 가죽 전용 클리너 사용\n4. 스터드 정기 점검\n\n또 다른 팁 있으면 공유해주세요!",
      summary: "축구화 관리 팁"
    },
    {
      title: "아시안컵 대표팀 전망",
      content: "다음 아시안컵에서 우리나라가 우승할 수 있을까요?\n\n손흥민, 이강인, 김민재 등 좋은 선수들이 많아서\n\n이번에는 정말 가능할 것 같은데 어떻게 생각하시나요?",
      summary: "아시안컵 한국 대표팀 전망"
    },
    {
      title: "풋살 vs 축구 어떤 게 더 재밌나요?",
      content: "최근에 풋살 시작했는데 축구랑은 또 다른 매력이 있네요.\n\n좁은 공간에서 빠른 패스와 개인기가 중요해서\n\n기술 향상에도 도움이 되는 것 같아요. 다들 풋살 해보셨나요?",
      summary: "풋살과 축구의 차이점"
    }
  ],

  // 야구 게시판
  baseball: [
    {
      title: "올 시즌 MVP는 누가 될까요?",
      content: "시즌 중반인데 벌써 MVP 후보들이 보이네요.\n\n타자 부문은 OOO 선수가 유력해 보이고\n\n투수 부문은 경쟁이 치열한 것 같습니다. 여러분 생각은?",
      summary: "올 시즌 MVP 예측"
    },
    {
      title: "KBO 10구단 창단 어떻게 생각하시나요?",
      content: "10구단 창단 얘기가 계속 나오는데\n\n리그 활성화에는 도움이 될 것 같지만\n\n선수 수급 문제도 있고... 여러분 의견은 어떤가요?",
      summary: "KBO 10구단 창단에 대한 의견"
    },
    {
      title: "야구장 직관 필수템 공유",
      content: "야구장 갈 때 필수품:\n\n1. 쿠션 방석 (3시간 앉아있기)\n2. 선크림 (데이게임)\n3. 우비 (갑작스런 비)\n4. 쌍안경\n\n또 뭐가 있을까요?",
      summary: "야구장 직관 필수 아이템"
    },
    {
      title: "투수 유형별 타격 팁",
      content: "사회인 야구하는데 투수 유형별로 치기 어려운 게 다르네요.\n\n빠른 직구 투수: 타이밍 빠르게\n변화구 투수: 공 끝까지 보기\n\n다른 팁 있으면 공유해주세요!",
      summary: "투수 유형별 타격 요령"
    },
    {
      title: "한국 야구 메이저리그 진출 선수들",
      content: "최근 MLB에서 활약하는 한국 선수들이 늘어서 기쁩니다.\n\n김하성, 이정후 선수 모두 잘하고 있고\n\n앞으로 더 많은 선수들이 도전했으면 좋겠네요!",
      summary: "MLB 한국 선수들 활약"
    },
    {
      title: "야구 글러브 추천해주세요",
      content: "캐치볼용 글러브 구매하려고 하는데\n\n입문자가 쓰기 좋은 제품 추천 부탁드려요.\n\n가격대는 20만원 이하로 생각하고 있습니다.",
      summary: "입문자용 야구 글러브 추천"
    },
    {
      title: "역대 최고의 한국 투수는?",
      content: "선동열, 박찬호, 류현진...\n\n시대가 달라서 비교하기 어렵지만\n\n여러분이 생각하는 한국 최고의 투수는 누구인가요?",
      summary: "한국 역대 최고의 투수"
    },
    {
      title: "야구 규칙 중 헷갈리는 것들",
      content: "인필드 플라이, 보크, 타격 방해...\n\n야구 규칙 중에 헷갈리는 게 많네요.\n\n초보자들을 위해 설명해주실 분 있나요?",
      summary: "헷갈리는 야구 규칙들"
    },
    {
      title: "홈런 타자 vs 안타 제조기",
      content: "팀에 꼭 필요한 선수는?\n\n홈런 30개 치는 선수 vs 3할 타율의 안타 제조기\n\n둘 다 중요하지만 하나만 고른다면?",
      summary: "홈런 타자 vs 안타 제조기"
    },
    {
      title: "야구 중계 해설 누가 제일 좋나요?",
      content: "야구 중계 볼 때 해설이 중요한 것 같아요.\n\n전문적이면서도 재미있게 설명해주는\n\n해설위원이 있으면 경기가 더 재밌더라구요.",
      summary: "좋아하는 야구 해설위원"
    },
    {
      title: "사회인 야구 시작하는 법",
      content: "야구 동호회 가입하고 싶은데 어떻게 시작해야 할까요?\n\n장비도 필요하고 실력도 걱정되고...\n\n경험자분들 조언 부탁드립니다!",
      summary: "사회인 야구 시작 가이드"
    },
    {
      title: "야구장별 맛집 추천",
      content: "각 구장마다 유명한 먹거리가 있잖아요.\n\n잠실: 치킨\n고척: 돈까스\n수원: ??\n\n다른 구장 맛집도 추천해주세요!",
      summary: "야구장별 맛집 정보"
    },
    {
      title: "투구폼 교정 어떻게 하나요?",
      content: "캐치볼할 때 자꾸 공이 위로 뜨네요.\n\n투구폼에 문제가 있는 것 같은데\n\n혼자서 교정할 수 있는 방법이 있을까요?",
      summary: "투구폼 교정 방법"
    },
    {
      title: "야구 통계의 재미",
      content: "WAR, OPS, WHIP 등등\n\n야구는 정말 통계의 스포츠인 것 같아요.\n\n숫자로 선수를 평가하는 게 재밌네요. 어떤 스탯을 중요하게 보시나요?",
      summary: "야구 통계 지표의 재미"
    },
    {
      title: "우천 취소 환불 규정",
      content: "어제 야구장 갔다가 5회 전에 우천취소 됐는데\n\n환불 규정이 헷갈리네요.\n\n5회 전이면 전액 환불 맞나요?",
      summary: "우천취소 시 환불 규정"
    },
    {
      title: "포지션별 중요도",
      content: "야구에서 가장 중요한 포지션은 뭘까요?\n\n투수? 포수? 유격수?\n\n각 포지션마다 중요한 이유가 있는 것 같은데...",
      summary: "야구 포지션별 중요도"
    },
    {
      title: "야구 유니폼 세탁법",
      content: "야구 유니폼에 흙 얼룩이 잘 안 빠지네요.\n\n특히 흰색 바지는 관리가 어려운 것 같아요.\n\n깨끗하게 세탁하는 노하우 있나요?",
      summary: "야구 유니폼 세탁 팁"
    },
    {
      title: "번트 vs 풀스윙",
      content: "2사 주자 1루 상황\n\n번트로 진루? 풀스윙으로 한방?\n\n상황마다 다르겠지만 여러분이라면?",
      summary: "번트 vs 풀스윙 선택"
    },
    {
      title: "야구 영화 추천",
      content: "'머니볼' 다시 봤는데 역시 명작이네요.\n\n야구의 또 다른 면을 보여주는 영화였어요.\n\n다른 야구 영화 추천해주세요!",
      summary: "추천하는 야구 영화"
    },
    {
      title: "시즌 티켓 구매 고민",
      content: "내년 시즌 티켓 구매하려고 하는데\n\n가격이 만만치 않네요.\n\n시즌 티켓 구매하신 분들 만족하시나요?",
      summary: "야구 시즌 티켓 구매 고민"
    }
  ],

  // 농구 게시판
  basketball: [
    {
      title: "NBA 플레이오프 예측",
      content: "동부: 셀틱스 vs 벅스\n서부: 레이커스 vs 워리어스\n\n올해는 정말 예측하기 어려운 것 같아요.\n\n여러분의 우승 후보는?",
      summary: "NBA 플레이오프 우승 예측"
    },
    {
      title: "KBL도 재밌습니다!",
      content: "NBA만 보지 마시고 KBL도 관심 가져주세요!\n\n수준이 많이 올라갔고 박진감 넘치는 경기가 많아요.\n\n특히 플레이오프는 정말 재밌습니다.",
      summary: "KBL 리그 관심 촉구"
    },
    {
      title: "농구화 추천 부탁드려요",
      content: "농구 시작한 지 얼마 안 됐는데\n\n발목 보호가 잘 되는 농구화 추천해주세요.\n\n디자인보다는 기능성 위주로요!",
      summary: "발목 보호 농구화 추천"
    },
    {
      title: "3점슛 연습법",
      content: "3점슛 성공률을 높이고 싶은데\n\n효과적인 연습 방법이 있을까요?\n\n폼 교정이 필요한 것 같기도 하고...",
      summary: "3점슛 성공률 높이는 법"
    },
    {
      title: "역대 최고의 NBA 선수는?",
      content: "조던 vs 르브론 vs 코비...\n\n시대가 달라서 비교하기 어렵지만\n\n여러분이 생각하는 GOAT는 누구인가요?",
      summary: "NBA 역대 최고 선수"
    },
    {
      title: "픽업게임 에티켓",
      content: "동네 농구장에서 픽업게임 할 때\n\n지켜야 할 에티켓:\n\n1. 과한 파울 자제\n2. 양보와 배려\n3. 승부욕은 좋지만 싸우지 말기",
      summary: "픽업게임 매너"
    },
    {
      title: "포지션별 역할 설명",
      content: "농구 입문자를 위한 포지션 설명:\n\nPG: 경기 조율\nSG: 득점\nSF: 다재다능\nPF: 리바운드\nC: 골밑 수비\n\n맞나요?",
      summary: "농구 포지션별 역할"
    },
    {
      title: "드리블 실력 향상법",
      content: "드리블이 농구의 기본인 것 같은데\n\n집에서도 할 수 있는 드리블 연습법 있나요?\n\n볼 컨트롤이 잘 안 돼요.",
      summary: "드리블 연습 방법"
    },
    {
      title: "농구 중계 어디서 보시나요?",
      content: "NBA 중계 볼 수 있는 곳이 많지 않네요.\n\n합법적으로 볼 수 있는 플랫폼 추천해주세요.\n\n가격도 알려주시면 감사하겠습니다.",
      summary: "농구 중계 시청 방법"
    },
    {
      title: "슬램덩크 실사판 어땠나요?",
      content: "슬램덩크 더 퍼스트 슬램덩크 보신 분?\n\n원작 팬인데 실사판도 볼만한가요?\n\n스포 없이 후기 부탁드려요!",
      summary: "슬램덩크 영화 후기"
    },
    {
      title: "키 작아도 농구 잘할 수 있나요?",
      content: "170cm인데 농구 시작해도 될까요?\n\n키 작은 사람이 농구하면 불리한가요?\n\n작은 키의 장점도 있다고 들었는데...",
      summary: "키 작은 사람의 농구"
    },
    {
      title: "농구공 고르는 법",
      content: "실내용/실외용 농구공이 따로 있나요?\n\n좋은 농구공 고르는 기준이 뭔가요?\n\n추천 브랜드도 알려주세요!",
      summary: "농구공 선택 가이드"
    },
    {
      title: "레이업 성공률 높이기",
      content: "레이업이 생각보다 어렵네요.\n\n특히 속도 붙여서 하면 자꾸 실패해요.\n\n레이업 잘하는 팁 있나요?",
      summary: "레이업 성공 팁"
    },
    {
      title: "농구 부상 예방법",
      content: "농구하다 발목 접질린 경험 있으신가요?\n\n부상 예방을 위한 스트레칭이나\n\n주의사항 공유해주세요!",
      summary: "농구 부상 예방"
    },
    {
      title: "한국 농구 국가대표 응원합시다",
      content: "아시안게임이나 월드컵 예선 때\n\n우리나라 농구도 많이 응원해주세요!\n\n선수들이 정말 열심히 하거든요.",
      summary: "농구 국가대표 응원"
    },
    {
      title: "농구 전술 공부하고 싶어요",
      content: "픽앤롤, 모션 오펜스 등\n\n농구 전술을 공부하고 싶은데\n\n입문자가 보기 좋은 자료 있나요?",
      summary: "농구 전술 공부"
    },
    {
      title: "길거리 농구 vs 정식 농구",
      content: "3대3 길거리 농구랑\n\n5대5 정식 농구는 완전 다르더라구요.\n\n각각의 매력이 있는 것 같아요. 뭘 더 좋아하시나요?",
      summary: "길거리 농구 vs 정식 농구"
    },
    {
      title: "농구 관련 유튜브 추천",
      content: "농구 기술이나 NBA 하이라이트\n\n볼 수 있는 유튜브 채널 추천해주세요.\n\n한국어 채널이면 더 좋구요!",
      summary: "농구 유튜브 채널"
    },
    {
      title: "체력 훈련법",
      content: "농구는 정말 체력이 중요한 것 같아요.\n\n농구 체력 기르는 운동법이나\n\n훈련 루틴 공유해주세요!",
      summary: "농구 체력 훈련"
    },
    {
      title: "여자 농구도 재밌어요",
      content: "WKBL이나 WNBA도 정말 재밌는데\n\n관심이 적어서 아쉬워요.\n\n여자 농구만의 매력이 있거든요!",
      summary: "여자 농구의 매력"
    }
  ],

  // e스포츠 게시판
  esports: [
    {
      title: "T1 월즈 우승! 페이커 5번째 우승",
      content: "정말 감동적인 경기였습니다.\n\n페이커가 또 한 번 증명했네요. GOAT!\n\n결승전 5세트 정말 손에 땀을 쥐게 했어요.",
      summary: "T1 월즈 우승 소감"
    },
    {
      title: "LCK vs LPL 어느 리그가 더 강할까?",
      content: "최근 국제대회 성적을 보면 엎치락뒤치락인데\n\nLCK의 운영 vs LPL의 한타\n\n여러분은 어느 리그가 더 강하다고 보시나요?",
      summary: "LCK vs LPL 리그 비교"
    },
    {
      title: "발로란트 챔피언스 한국팀 응원!",
      content: "DRX가 기적을 만들고 있습니다!\n\n언더독에서 시작해서 결승까지\n\n한국 발로란트의 저력을 보여주고 있네요!",
      summary: "발로란트 한국팀 선전"
    },
    {
      title: "게이밍 기어 추천해주세요",
      content: "마우스: ?\n키보드: ?\n헤드셋: ?\n\nFPS 게임용으로 추천 부탁드려요.\n가성비 제품으로요!",
      summary: "게이밍 기어 추천"
    },
    {
      title: "스트리머 vs 프로게이머",
      content: "요즘은 프로게이머들도 방송을 많이 하던데\n\n프로 은퇴하고 스트리머 되는 경우도 많고\n\n어떤 진로가 더 좋을까요?",
      summary: "e스포츠 진로 고민"
    },
    {
      title: "PC방 요금 인상 어떻게 생각하시나요?",
      content: "요즘 PC방 요금이 너무 올랐어요.\n\n시간당 2000원이 넘는 곳도 있던데\n\n물가 상승 때문이라지만 부담스럽네요.",
      summary: "PC방 요금 인상"
    },
    {
      title: "오버워치 리그 재편",
      content: "OWL이 큰 변화를 겪고 있네요.\n\n한국 팀들도 영향을 받을 것 같은데\n\n오버워치 e스포츠의 미래가 걱정됩니다.",
      summary: "오버워치 리그 변화"
    },
    {
      title: "모바일 e스포츠의 성장",
      content: "배그 모바일, 와일드 리프트 등\n\n모바일 e스포츠가 빠르게 성장하고 있어요.\n\nPC 게임을 위협할 수준까지 올까요?",
      summary: "모바일 e스포츠 성장"
    },
    {
      title: "e스포츠 선수 은퇴 후 진로",
      content: "프로게이머 은퇴 평균 연령이 낮잖아요.\n\n은퇴 후에는 뭘 하는지 궁금하네요.\n\n코치, 해설, 스트리머 외에 다른 진로도 있나요?",
      summary: "프로게이머 은퇴 후"
    },
    {
      title: "게임 중독 vs e스포츠",
      content: "부모님은 게임을 부정적으로 보시는데\n\ne스포츠는 정식 스포츠잖아요.\n\n이런 인식 차이를 어떻게 좁힐 수 있을까요?",
      summary: "게임에 대한 인식"
    },
    {
      title: "롤 챔피언 추천",
      content: "롤 입문자인데 쉬운 챔피언 추천해주세요.\n\n각 라인별로 1-2개씩 알려주시면\n\n감사하겠습니다!",
      summary: "롤 입문자 챔피언"
    },
    {
      title: "e스포츠 대회 직관 후기",
      content: "처음으로 롤드컵 결승 직관했는데\n\n현장 분위기가 정말 대박이었어요!\n\nTV로 보는 것과는 차원이 다르네요.",
      summary: "e스포츠 직관 후기"
    },
    {
      title: "스크림 연습의 중요성",
      content: "프로팀들이 스크림을 엄청 많이 한다던데\n\n일반 솔로랭크와 뭐가 다른가요?\n\n팀 게임에서 스크림이 왜 중요한가요?",
      summary: "스크림 연습"
    },
    {
      title: "신작 FPS 게임 기대작",
      content: "발로란트 말고 새로운 FPS 게임\n\n나올 만한 게 있나요?\n\nCS2는 어떤가요?",
      summary: "FPS 게임 신작"
    },
    {
      title: "여성 e스포츠 선수들",
      content: "여성 프로게이머들도 늘어나고 있는데\n\n아직 남녀 분리 리그가 많네요.\n\n통합 리그가 되려면 시간이 필요할까요?",
      summary: "여성 e스포츠"
    },
    {
      title: "게임 업데이트와 메타 변화",
      content: "패치 한 번에 메타가 확 바뀌는 게\n\ne스포츠의 매력이자 어려움인 것 같아요.\n\n프로들은 어떻게 적응하는지 신기해요.",
      summary: "게임 메타 변화"
    },
    {
      title: "e스포츠 베팅 합법화?",
      content: "해외에서는 e스포츠 베팅이 활성화됐다는데\n\n한국에서도 합법화될 가능성이 있을까요?\n\n장단점이 있을 것 같은데...",
      summary: "e스포츠 베팅"
    },
    {
      title: "아마추어 대회 참가 경험",
      content: "동아리에서 아마추어 대회 나갔는데\n\n생각보다 수준이 높더라구요.\n\n대회 경험 있으신 분들 팁 좀 주세요!",
      summary: "아마추어 대회"
    },
    {
      title: "e스포츠 관련 직업",
      content: "꼭 선수가 아니더라도\n\ne스포츠 산업에서 일하고 싶은데\n\n어떤 직업들이 있나요?",
      summary: "e스포츠 산업 직업"
    },
    {
      title: "클래식 게임 e스포츠",
      content: "스타크래프트, 워크래프트3 같은\n\n클래식 게임 대회도 아직 열리나요?\n\n추억의 게임들이 그립네요.",
      summary: "클래식 게임 대회"
    }
  ]
}

async function seedPosts() {
  console.log('🌱 게시글 더미 데이터 생성 시작...')

  try {
    // 기본 사용자 확인 (admin 사용)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.error('❌ Admin 사용자를 찾을 수 없습니다. 먼저 사용자를 생성해주세요.')
      return
    }

    // 추가 더미 사용자들 생성
    const dummyUsers = await Promise.all([
      prisma.user.upsert({
        where: { username: 'sports_fan' },
        update: {},
        create: {
          username: 'sports_fan',
          email: 'sports_fan@example.com',
          passwordHash: '$2a$10$DUMMY_HASH', // 실제로는 사용 불가
          level: 15,
          experience: 1500,
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { username: 'soccer_lover' },
        update: {},
        create: {
          username: 'soccer_lover',
          email: 'soccer_lover@example.com',
          passwordHash: '$2a$10$DUMMY_HASH',
          level: 8,
          experience: 800,
          role: 'USER'
        }
      }),
      prisma.user.upsert({
        where: { username: 'baseball_pro' },
        update: {},
        create: {
          username: 'baseball_pro',
          email: 'baseball_pro@example.com',
          passwordHash: '$2a$10$DUMMY_HASH',
          level: 12,
          experience: 1200,
          role: 'USER'
        }
      })
    ])

    const allUsers = [adminUser, ...dummyUsers]

    // 게시판 카테고리별로 게시글 생성
    for (const [categorySlug, posts] of Object.entries(postTemplates)) {
      console.log(`\n📝 ${categorySlug} 게시판 게시글 생성 중...`)

      // 카테고리 찾기
      const category = await prisma.boardCategory.findUnique({
        where: { slug: categorySlug }
      })

      if (!category) {
        console.log(`⚠️  ${categorySlug} 카테고리를 찾을 수 없습니다. 건너뜁니다.`)
        continue
      }

      // 각 게시글 생성
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
        
        // 랜덤 통계 생성
        const views = Math.floor(Math.random() * 500) + 10
        const likesCount = Math.floor(Math.random() * 50)
        const commentsCount = Math.floor(Math.random() * 20)

        // 랜덤 날짜 (최근 30일 내)
        const daysAgo = Math.floor(Math.random() * 30)
        const createdAt = new Date()
        createdAt.setDate(createdAt.getDate() - daysAgo)

        await prisma.post.create({
          data: {
            title: post.title,
            content: post.content,
            summary: post.summary,
            boardType: category.boardType,
            categoryId: category.boardType === 'COMMUNITY' ? category.id : null,
            userId: randomUser.id,
            views,
            likesCount,
            commentsCount,
            createdAt,
            updatedAt: createdAt
          }
        })
      }

      console.log(`✅ ${categorySlug} 게시판에 ${posts.length}개 게시글 생성 완료`)
    }

    console.log('\n✨ 모든 게시글 생성 완료!')

  } catch (error) {
    console.error('❌ 게시글 생성 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
seedPosts()
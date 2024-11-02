'use client';
import { useEffect, useState, useRef } from 'react';
import { keyframes } from '@emotion/react';
import { useSearchParams } from 'next/navigation';
import {
  Box, Text, VStack, Progress, Flex, Heading,
  useColorModeValue, Button
} from '@chakra-ui/react';

// 깜빡이는 애니메이션을 더 불안정하게 수정
const blinkingAnimation = keyframes`
  0% { 
    opacity: 1;
    text-shadow: 0 0 20px rgba(255,0,0,0.8);
    transform: scale(1);
  }
  25% {
    opacity: 0.4;
    text-shadow: 0 0 30px rgba(255,0,0,0.6);
    transform: scale(1.02) skew(2deg);
  }
  50% {
    opacity: 0.7;
    text-shadow: 0 0 40px rgba(255,0,0,1);
    transform: scale(0.98) skew(-1deg);
  }
  75% {
    opacity: 0.3;
    text-shadow: 0 0 30px rgba(255,0,0,0.6);
    transform: scale(1.02) skew(-2deg);
  }
  100% { 
    opacity: 1;
    text-shadow: 0 0 20px rgba(255,0,0,0.8);
    transform: scale(1);
  }
`;

// 새로운 글리치 효과 애니메이션
const glitchAnimation = keyframes`
  0% {
    transform: translate(0);
    text-shadow: -2px 0 red, 2px 2px blue;
  }
  25% {
    transform: translate(-2px, 2px);
    text-shadow: 2px -2px red, -2px 0 blue;
  }
  50% {
    transform: translate(2px, -2px);
    text-shadow: 0 2px red, -2px -2px blue;
  }
  75% {
    transform: translate(-2px, 2px);
    text-shadow: -2px 0 red, 2px 2px blue;
  }
  100% {
    transform: translate(0);
    text-shadow: -2px 0 red, 2px 2px blue;
  }
`;

// Mock 데이터 추가
const mockMatchData = {  
  propertyWinners: {
    height: "준서",
    weight: "감자",
    exerciseCount: "감자",
    smokeCount: "준서",
    drinkingCount: "준서",
  },
  winnerInfo: {    
      name: "준서",
      height: "180cm",
      weight: "75kg",
      exerciseCount: 10,
      smokeCount: 3,
      drinkingCount: 3
  },
  loserInfo: {
      name: "감자",
      height: "160cm",
      weight: "65kg",
      exerciseCount: 8,
      smokeCount: 0,
      drinkingCount: 0
  }
};

function BattlePage() {
  // 1. 기본 상태 및 설정
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  const battleInitialized = useRef(false);

  // 2. 색상 설정
  const textColor = useColorModeValue('red.300', 'red.200');
  const winnerColor = 'yellow.400';
  const loserColor = 'gray.400';

  // 3. 상태 관리
  const [battleData, setBattleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [battleState, setBattleState] = useState({
    currentStep: 0,
    isStarted: false,
    isFinished: false,
    healthPoints: {},
    logs: []
  });

  // 4. 데미지 설정
  const DAMAGE = {
    SUCCESS: 40,
    PARTIAL: 25
  };

  // 5. 메시지 생성 함수들
  const createAttackMessage = (attacker, property) => {
    const attackMessages = {
      height: [
        `${attacker}의 압도적인 신장으로 내려찍기!`,
        `하늘을 찌르는 듯한 강력한 공격이다!`,
        `공중에서 내리꽂는 치명타!`
      ],
      weight: [
        `${attacker}의 중량감 있는 몸싸움!`,
        `온 몸을 실은 강력한 타격이다!`,
        `압도적인 체중으로 밀어붙인다!`
      ],
      exerciseCount: [
        `${attacker}의 단련된 근력으로 연속 공격!`,
        `끝없는 체력으로 몰아친다!`,
        `지칠 줄 모르는 연타 공격!`
      ],
      smokeCount: [
        `${attacker}의 연기 구름 속 기습!`,
        `자욱한 연기 속에서 공격이 쏟아진다!`,
        `예측불가한 연막 속 공격!`
      ],
      drinkingCount: [
        `${attacker}의 취권 발동!`,
        `흔들리는 발걸음으로 오히려 상대를 교란한다!`,
        `예측불가한 술취한 공격 패턴!`
      ]
    };

    const messages = attackMessages[property];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const createResultMessage = (isSuccess, damage) => {
    if (damage === DAMAGE.SUCCESS) {
      const messages = [
        "치명적인 일격이 들어갔다!",
        "상대방이 크게 휘청인다!",
        "강력한 공격이 적중했다!",
        "피할 수 없는 결정타다!"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
    return "공격이 빗나갔지만 약간의 피해를 입혔다!";
  };

  // 6. 배틀 진행 함수
  const initiateBattle = async () => {
    if (!battleData) return;

    const winner = battleData.winnerInfo.name;
    const loser = battleData.loserInfo.name;

    setBattleState(prev => ({
      ...prev,
      isStarted: true,
      healthPoints: {
        [winner]: 100,
        [loser]: 100
      }
    }));

    const properties = ['height', 'weight', 'exerciseCount', 'smokeCount', 'drinkingCount'];
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const propertyWinner = battleData.propertyWinners[property];
      const propertyLoser = propertyWinner === winner ? loser : winner;

      setBattleState(prev => ({ ...prev, currentStep: i + 1 }));

      const attackMessage = createAttackMessage(propertyWinner, property);
      const resultMessage = createResultMessage(true, DAMAGE.SUCCESS);
      const damage = DAMAGE.SUCCESS;
      
      setBattleState(prev => {
        const newHealth = Math.max(0, prev.healthPoints[propertyLoser] - damage);
        return {
          ...prev,
          healthPoints: {
            ...prev.healthPoints,
            [propertyLoser]: newHealth
          },
          logs: [
            [
              '',
              `=== ${i + 1}번째 대결: ${property.toUpperCase()} ===`,
              `${propertyWinner}(이)가 공격 태세를 갖춘다...`,
              attackMessage,
              resultMessage,
              `${propertyLoser}에게 ${damage}의 치명타!`,
              propertyLoser === winner ? 
                `${propertyLoser}: "이런... 강하군..."` : 
                `${propertyLoser}: "크윽... 제법이야..."`
            ],
            ...prev.logs
          ]
        };
      });

      await new Promise(resolve => setTimeout(resolve, 3500));
    }

    setBattleState(prev => ({
      ...prev,
      isFinished: true,
      logs: [
        [
          '',
          '=== 결투 종료 ===',
          `${winner}의 승리!`,
          winner === battleData.winnerInfo.name ? 
            '"약한 자는 도태되는 법이지..."' :
            '"더 강해져서 돌아와라..."'
        ],
        ...prev.logs
      ]
    }));
  };

  // 7. 데이터 가져오기
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId || battleInitialized.current) return;

      try {
        const response = await fetch(`/api/health-match-result/${matchId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }

        const data = await response.json();
        setBattleData(data);
        battleInitialized.current = true;

      } catch (error) {
        console.error('Error fetching match data:', error);
        setBattleData(mockMatchData);
        battleInitialized.current = true;
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  // 8. 배틀 시작
  useEffect(() => {
    if (battleData && !battleState.isStarted) {
      initiateBattle();
    }
  }, [battleData]);

  // 9. 로딩 상태
  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="black">
        <Text fontSize="2xl" color="red.300">결투장 입장중...</Text>
      </Box>
    );
  }

  // 10. 에러 상태
  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="black">
        <Text fontSize="2xl" color="red.500">결투장 입장 실패...</Text>
      </Box>
    );
  }

  // 11. 데이터 없음
  if (!battleData) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="black">
        <Text fontSize="2xl" color="red.300">매치 정보를 찾을 수 없습니다...</Text>
      </Box>
    );
  }

  // 승자와 패자 정보 추출
  const winner = battleData.winnerInfo.name;
  const loser = battleData.loserInfo.name;

  const renderBattleStep = () => {
    if (!battleState.isStarted) return null;

    return (
      <VStack spacing={6} w="full">
        {!battleState.isFinished ? (
          <Flex w="full" justify="space-between" px={8} gap={8}>
            <VStack flex={1}>
              <Box
                w="full"
                key={`hp-${winner}-${battleState.healthPoints[winner]}`}
                sx={{
                  animation: battleState.logs[0]?.some(log => log.includes(winner)) 
                    ? `${glitchAnimation} 0.5s ease-out` 
                    : 'none'
                }}
              >
                <Progress 
                  value={battleState.healthPoints[winner]} 
                  colorScheme="red" 
                  w="full"
                  h="20px"
                  borderRadius="full"
                  bg="rgba(255,0,0,0.2)"
                  sx={{
                    '& > div': {
                      transition: 'all 0.5s ease-in-out'
                    }
                  }}
                />
                <Text color={textColor} fontSize="lg">{battleState.healthPoints[winner]}%</Text>
              </Box>
            </VStack>

            <VStack flex={1}>
              <Box
                w="full"
                key={`hp-${loser}-${battleState.healthPoints[loser]}`}
                sx={{
                  animation: battleState.logs[0]?.some(log => log.includes(loser)) 
                    ? `${glitchAnimation} 0.5s ease-out` 
                    : 'none'
                }}
              >
                <Progress 
                  value={battleState.healthPoints[loser]} 
                  colorScheme="red" 
                  w="full"
                  h="20px"
                  borderRadius="full"
                  bg="rgba(255,0,0,0.2)"
                  sx={{
                    '& > div': {
                      transition: 'all 0.5s ease-in-out'
                    }
                  }}
                />
                <Text color={textColor} fontSize="lg">{battleState.healthPoints[loser]}%</Text>
              </Box>
            </VStack>
          </Flex>
        ) : (
          <VStack 
            w="full" 
            spacing={4} 
            bg="rgba(0,0,0,0.6)" 
            p={6} 
            // borderRadius="lg"
            // border="1px solid"
            // borderColor="red.500"
          >
            <Text
              color="red.300"
              fontSize="xl"
              fontFamily="monospace"
              textAlign="center"
              sx={{
                animation: `${glitchAnimation} 4s infinite`,
              }}
            >
              &quot;죽고 싶지 않다면 (건)강해져라! 크아아앜!!!&quot;
            </Text>
            <Button
              size="lg"
              bg="red.600"
              color="white"
              width="full"
              _hover={{ bg: 'red.700' }}
              _active={{ bg: 'red.800' }}
              boxShadow="0 0 15px rgba(255,0,0,0.4)"
              onClick={() => {
                const userId = 'test';        
                if (userId) {
                  window.location.href = `/profile/${userId}`;
                }
              }}
            >
              내 상태 확인하기
            </Button>
          </VStack>
        )}

        <Box
          w="full"
          h="200px"
          overflowY="auto"
          bg="rgba(0,0,0,0.5)"
          borderRadius="md"
          p={4}
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,0,0,0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255,0,0,0.5)',
              }
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,0,0,0.3) transparent',
          }}
        >
          <VStack 
            spacing={0} 
            align="stretch"
            key={battleState.logs.length}
            sx={{
              animation: `${glitchAnimation} 0.5s ease-out`,
            }}
          >
            {battleState.logs.flat().map((log, index) => (
              <Text
                key={index}
                color={log.startsWith('===') ? 'yellow.300' : textColor}
                fontSize={log.startsWith('===') ? 'md' : 'sm'}
                fontWeight={log.startsWith('===') ? 'bold' : 'normal'}
                mb={log.startsWith('===') ? 2 : 1}
                opacity={0.8}
              >
                {log}
              </Text>
            ))}
          </VStack>
        </Box>
      </VStack>
    );
  };

  return (
    <Box
      minH="100vh"
      bg="black"
      backgroundImage={`
        linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
        url('/blood-texture.webp'),
        
      `}
      backgroundBlendMode="overlay"
      backgroundSize="cover, cover"
      backgroundPosition="center"
      py={10}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 3px, transparent 3px)',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'scanline 8s linear infinite',
      }}
    >
      <VStack spacing={8} align="center" position="relative" zIndex={2}>
        {/* AI 분석 결과가 사기였다는 것을 알리는 메시지 */}
        <Box
          position="absolute"
          top={0}
          left="50%"
          transform="translateX(-50%)"
          textAlign="center"
          opacity={0.8}
        >   
         
        </Box>

        <Heading
          size="3xl"
          color="red.600" 
          fontFamily="'Noto Serif KR', serif"
          sx={{
            animation: `${blinkingAnimation} 2s infinite`,
            letterSpacing: "8px",
            fontWeight: "900",
            filter: "drop-shadow(0 0 15px rgba(255,0,0,0.8))",
            textTransform: "uppercase",
            WebkitTextStroke: "2px rgba(255,0,0,0.3)",
            textShadow: `
              0 0 20px rgba(255,0,0,0.8),
              0 0 30px rgba(255,0,0,0.6),
              0 0 40px rgba(255,0,0,0.4)
            `
          }}
        >
          지하 결투장
        </Heading>

        <Text
          color="red.400"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
          textAlign="center"
          sx={{
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            animation: `${glitchAnimation} 5s infinite`,
          }}
        >
          &quot;AI 분석? 건강 조언? 하하하... 여긴 지하 결투장이다!&quot;
        </Text>

        <Flex
          direction={{ base: 'row', md: 'row' }}
          align="center"
          justify="center"
          w="full"
          gap={{ base: 2, md: 4 }}
          px={4}
        >
          {/* 첫 번째 선수 */}
          <VStack spacing={4}>
            <Box
              position="relative"
              w={{ base: "120px", md: "150px" }}
              h={{ base: "120px", md: "150px" }}
              bg="rgba(255, 0, 0, 0.1)"
              borderRadius="lg"
              border="2px solid"
              borderColor={battleState.isFinished && winner === winner ? winnerColor : "red.500"}
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,0,0,0.2) 0%, transparent 100%)',
                opacity: battleState.isFinished && winner === winner ? 1 : 0.5,
              }}
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: battleState.isFinished && winner === winner 
                  ? "inset 0 0 20px rgba(255,255,0,0.5)" 
                  : "inset 0 0 20px rgba(255,0,0,0.3)",
              }}
            >
              <VStack
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                spacing={1}
                zIndex={1}
              >
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color={battleState.isFinished && winner === winner ? winnerColor : textColor}
                  textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                >
                  {winner}
                </Text>
                {battleState.isFinished && winner === winner && (
                  <Text
                    color={winnerColor}
                    fontWeight="bold"
                    fontSize="sm"
                    textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                  >
                    승
                  </Text>
                )}
              </VStack>
            </Box>
          </VStack>

          <Text 
            fontSize={{ base: "4xl", md: "6xl" }} 
            color="red.500"
            fontWeight="bold"
            textShadow="0 0 10px rgba(255,0,0,0.5)"
            animation={battleState.isStarted ? "pulse 1.5s infinite" : "none"}
          >
            VS
          </Text>

          {/* 두 번째 선수 */}
          <VStack spacing={4}>
            <Box
              position="relative"
              w={{ base: "120px", md: "150px" }}
              h={{ base: "120px", md: "150px" }}
              bg="rgba(255, 0, 0, 0.1)"
              borderRadius="lg"
              border="2px solid"
              borderColor={battleState.isFinished && winner === loser ? winnerColor : "red.500"}
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,0,0,0.2) 0%, transparent 100%)',
                opacity: battleState.isFinished && winner === loser ? 1 : 0.5,
              }}
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: battleState.isFinished && winner === loser 
                  ? "inset 0 0 20px rgba(255,255,0,0.5)" 
                  : "inset 0 0 20px rgba(255,0,0,0.3)",
              }}
            >
              <VStack
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                spacing={1}
                zIndex={1}
              >
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  color={battleState.isFinished && winner === loser ? winnerColor : textColor}
                  textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                >
                  {loser}
                </Text>
                {battleState.isFinished && winner === loser && (
                  <Text
                    color={winnerColor}
                    fontWeight="bold"
                    fontSize="sm"
                    textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                  >
                    승리
                  </Text>
                )}
              </VStack>
            </Box>
          </VStack>
        </Flex>

        {renderBattleStep()}
      </VStack>
    </Box>
  );
}

export default BattlePage;
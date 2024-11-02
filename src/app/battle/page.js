'use client';
import { useEffect, useState, useRef } from 'react';
import { keyframes } from '@emotion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Flex,
  Image,
  useColorModeValue,
  Progress
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
  winner: "준서",
  loser: "감자",
  propertyWinners: {
    height: "준서",
    weight: "감자",
    exerciseCount: "감자",
    smokeCount: "준서",
    drinkingCount: "준서",
  },
  playerInfo: {
    "준서": {
      "height": "180cm",
      "weight": "75kg",
      "exerciseCount": 10,
      "smokeCount": 3,
      "drinkingCount": 3
    },
    "감자": {
      "height": "6cm",
      "weight": "100kg",
      "exerciseCount": 8,
      "smokeCount": 0,
      "drinkingCount": 0,
    }
  }
};

function BattlePage() {
  const searchParams = useSearchParams();
  const battleDataStr = searchParams.get('battleData');
  const battleData = battleDataStr ? JSON.parse(battleDataStr) : mockMatchData;
  const inviterId = Object.keys(battleData.playerInfo)[0];
  const inviteeId = Object.keys(battleData.playerInfo)[1];

  // 상태 관��
  const [battleState, setBattleState] = useState({
    currentStep: 0,
    isStarted: false,
    isFinished: false,
    healthPoints: {
      [inviterId]: 100,
      [inviteeId]: 100
    },
    logs: []
  });

  const [loading, setLoading] = useState(true);
  const battleInitialized = useRef(false);

  // 데미지 설정
  const DAMAGE = {
    SUCCESS: 40,
    PARTIAL: 25
  };

  // 전투 시작 함수
  const initiateBattle = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setBattleState(prev => ({ ...prev, isStarted: true }));
    
    const properties = ['height', 'weight', 'exerciseCount', 'smokeCount', 'drinkingCount'];
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const propertyWinner = battleData.propertyWinners[property];
      const propertyLoser = propertyWinner === inviterId ? inviteeId : inviterId;

      // 현재 스텝 업데이트
      setBattleState(prev => ({ ...prev, currentStep: i + 1 }));

      // 공격 메시지 생성
      const attackMessages = {
        height: `${propertyWinner}의 키로 내려찍기 공격!`,
        weight: `${propertyWinner}의 체중으로 누르기 공격!`,
        exerciseCount: `${propertyWinner}의 근력 공격!`,
        smokeCount: `${propertyWinner}의 연기 구름 공격!`,
        drinkingCount: `${propertyWinner}의 취권 공격!`
      };

      // 데미지 계산 및 체력 업데이트
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
              `=== ${property.toUpperCase()} 대결 ===`,
              attackMessages[property],
              "치명적인 공격이 들어갔다!",
              `${propertyLoser}에게 ${damage}의 데미지!`,
              `${propertyLoser}의 남은 체력: ${newHealth}%`
            ],
            ...prev.logs
          ]
        };
      });

      // 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 전투 종료
    setBattleState(prev => ({ ...prev, isFinished: true }));
  };

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    if (!battleInitialized.current) {
      battleInitialized.current = true;
      initiateBattle();
    }
  }, []);

  const bgColor = useColorModeValue('gray.900', 'black');
  const textColor = useColorModeValue('red.300', 'red.200');
  const accentColor = 'red.500';
  const winnerColor = 'yellow.400';
  const loserColor = 'gray.400';
  
  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg={bgColor}
      >      
        <Text fontSize="2xl" color={textColor}>결투장 입장중...</Text>
      </Box>
    );
  }

  if (!battleData) {
    return <div>No match information available</div>;
  }

  const { winner, loser, propertyWinners, playerInfo } = battleData;

  const renderBattleStep = () => {
    if (!battleState.isStarted) return null;

    return (
      <VStack spacing={6} w="full">
        {!battleState.isFinished ? (
          <Flex w="full" justify="space-between" px={8} gap={8}>
            <VStack flex={1}>
              <Progress 
                value={battleState.healthPoints[inviterId]} 
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
              <Text color={textColor} fontSize="lg">{battleState.healthPoints[inviterId]}%</Text>
            </VStack>

            <VStack flex={1}>
              <Progress 
                value={battleState.healthPoints[inviteeId]} 
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
              <Text color={textColor} fontSize="lg">{battleState.healthPoints[inviteeId]}%</Text>
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
            msOverflowStyle: 'none',  // IE and Edge
            scrollbarWidth: 'thin',    // Firefox
            scrollbarColor: 'rgba(255,0,0,0.3) transparent', // Firefox
          }}
        >
          <VStack spacing={0} align="stretch">
            {battleState.logs.flat().map((log, index) => (
              <Text
                key={index}
                color={log.startsWith('===') ? 'yellow.300' : textColor}
                fontSize={log.startsWith('===') ? 'md' : 'sm'}
                fontWeight={log.startsWith('===') ? 'bold' : 'normal'}
                mb={log.startsWith('===') ? 2 : 1}
                opacity={0.8}
                sx={{
                  animation: `${glitchAnimation} 0.5s ease-out`
                }}
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
        url('/blood-texture.jpg'),
        url('/chain-texture.png')
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
        {/* AI 분석 결과가 기였다는 것을 알리는 메시지 */}
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
              borderColor={battleState.isFinished && winner === inviterId ? winnerColor : "red.500"}
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,0,0,0.2) 0%, transparent 100%)',
                opacity: battleState.isFinished && winner === inviterId ? 1 : 0.5,
              }}
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: battleState.isFinished && winner === inviterId 
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
                  color={battleState.isFinished && winner === inviterId ? winnerColor : textColor}
                  textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                >
                  {inviterId}
                </Text>
                {battleState.isFinished && winner === inviterId && (
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
              borderColor={battleState.isFinished && winner === inviteeId ? winnerColor : "red.500"}
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,0,0,0.2) 0%, transparent 100%)',
                opacity: battleState.isFinished && winner === inviteeId ? 1 : 0.5,
              }}
              _after={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: battleState.isFinished && winner === inviteeId 
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
                  color={battleState.isFinished && winner === inviteeId ? winnerColor : textColor}
                  textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                >
                  {inviteeId}
                </Text>
                {battleState.isFinished && winner === inviteeId && (
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
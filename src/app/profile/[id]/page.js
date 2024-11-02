'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { keyframes } from '@emotion/react';
import Cookies from 'js-cookie';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Spinner,
  useColorModeValue,
  Flex,
  Badge,
  Progress,
  Divider,
  Tooltip,
  Icon,
  HStack
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';

// 깜빡이는 애니메이션
const blinkingAnimation = keyframes`
  0% { 
    opacity: 1;
    text-shadow: 0 0 20px rgba(255,0,0,0.8);
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    text-shadow: 0 0 40px rgba(255,0,0,1);
    transform: scale(0.98);
  }
  100% { 
    opacity: 1;
    text-shadow: 0 0 20px rgba(255,0,0,0.8);
    transform: scale(1);
  }
`;

// 글리치 효과
const glitchAnimation = keyframes`
  0% {
    transform: translate(0);
    text-shadow: -2px 0 red, 2px 2px blue;
  }
  50% {
    transform: translate(2px, -2px);
    text-shadow: 0 2px red, -2px -2px blue;
  }
  100% {
    transform: translate(0);
    text-shadow: -2px 0 red, 2px 2px blue;
  }
`;

// Mock 데이터 추가
const mockProfile = {
  name: "Unknown Fighter",
  level: "위험",
  joinDate: "2024-01-01",
  lastActive: "2024-03-19"
};

const mockMatchResults = {
  totalMatches: 120,
  wins: 100,
  losses: 20,
  healthRisk: 75,
  match_history: [
    {
      match_id: "1",
      result: "win",
      match_date: "2024-04-27T15:30:00Z",
      my_name: "홍길동",
      opponent_name: "김철수",
      match_data: {
        winner: "홍길동",
        loser: "김철수",
        propertyWinners: {
          height: "홍길동",
          weight: "김철수",
          exerciseCount: "홍길동",
          smokeCount: "홍길동",
          drinkingCount: "김철수"
        },
        winnerInfo: {
          name: "홍길동",
          height: "180cm",
          weight: "75kg",
          exerciseCount: 5,
          smokeCount: 0,
          drinkingCount: 2
        },
        loserInfo: {
          name: "김철수",
          height: "175cm",
          weight: "80kg",
          exerciseCount: 3,
          smokeCount: 10,
          drinkingCount: 4
        }
      }
    },
    {
      match_id: "match_002",
      result: "loss",
      match_date: "2024-05-05T18:45:00Z",
      my_name: "홍길동",
      opponent_name: "이영희",
      match_data: {
        winner: "이영희",
        loser: "홍길동",
        propertyWinners: {
          height: "이영희",
          weight: "이영희",
          exerciseCount: "홍길동",
          smokeCount: "홍길동",
          drinkingCount: "이영희"
        },
        winnerInfo: {
          name: "이영희",
          height: "182cm",
          weight: "78kg",
          exerciseCount: 4,
          smokeCount: 5,
          drinkingCount: 3
        },
        loserInfo: {
          name: "홍길동",
          height: "180cm",
          weight: "75kg",
          exerciseCount: 5,
          smokeCount: 0,
          drinkingCount: 2
        }
      }
    },
    {
      match_id: "match_003",
      result: "win",
      match_date: "2024-06-12T12:00:00Z",
      my_name: "홍길동",
      opponent_name: "박민수",
      match_data: {
        winner: "홍길동",
        loser: "박민수",
        propertyWinners: {
          height: "홍길동",
          weight: "홍길동",
          exerciseCount: "홍길동",
          smokeCount: "박민수",
          drinkingCount: "박민수"
        },
        winnerInfo: {
          name: "홍길동",
          height: "180cm",
          weight: "75kg",
          exerciseCount: 5,
          smokeCount: 0,
          drinkingCount: 2
        },
        loserInfo: {
          name: "박민수",
          height: "170cm",
          weight: "65kg",
          exerciseCount: 2,
          smokeCount: 15,
          drinkingCount: 5
        }
      }
    }
  ]
};

export default function ProfilePage({ paramsPromise }) {
    const [userId, setUserId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [matchHistory, setMatchHistory] = useState(null);
    const [hasCopied, setHasCopied] = useState(false);

    const textColor = useColorModeValue('red.300', 'red.200');
    const bgColor = 'black';

    // 프로필 정보 가져오기
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const params = await paramsPromise;
                setUserId(params.id);
                
                const response = await fetch(`/api/profiles/${params.id}`);
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error('프로필 가져오기 실패:', error);
                setProfile({ ...mockProfile, name: userId || "Unknown Fighter" });
            }
        };

        fetchProfile();
    }, [paramsPromise]);

    // 매치 결과 가져오기
    useEffect(() => {
        const fetchMatchHistory = async () => {
            if (!userId) return;

            try {                

                // 매치 히스토리 가져오기
                const historyResponse = await fetch(`/api/match-history?profileId=${userId}`);
                if (!historyResponse.ok) throw new Error('Failed to fetch match history');
                const historyData = await historyResponse.json();

                
                setMatchHistory(historyData);

            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
                // 실패 시 mock 데이터 사용
                setMatchHistory(mockMatchResults);
            }
        };

        fetchMatchHistory();
    }, [userId]);

    const renderProfile = () => {
        if (!profile) return null;

        return (
            <>
                <Text
                    fontSize="2xl"
                    color={textColor}
                    textAlign="center"
                    sx={{
                        animation: `${glitchAnimation} 5s infinite`,
                    }}
                >
                    {profile.name}
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                    위험 등급: {profile.level}
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                    첫 입장일: {profile.joinDate}
                </Text>
            </>
        );
    };


    const renderMatchHistory = () => {        
      if (!matchHistory) return null;
      console.log(matchHistory);
        return (
            <VStack spacing={3} align="stretch" w="full">
                <Text color="red.400" fontSize="lg" fontWeight="bold">
                    최근 전적
                </Text>
                {matchHistory.match_history.map((match) => (
                    <Box
                        key={match.match_id}
                        bg="rgba(0,0,0,0.3)"
                        p={4}
                        borderRadius="md"
                        border="1px solid"
                        borderColor={match.result === 'win' ? 'red.500' : 'gray.600'}
                        _hover={{
                            bg: 'rgba(0,0,0,0.4)',
                            transform: 'translateX(5px)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                                <HStack>
                                    <Text color={textColor} fontSize="md">
                                        VS {match.opponent_name}
                                    </Text>
                                    <Badge 
                                        colorScheme={match.result === 'win' ? 'red' : 'gray'}
                                        variant="solid"
                                    >
                                        {match.result === 'win' ? '승리' : '패배'}
                                    </Badge>
                                </HStack>
                                <Text color="gray.500" fontSize="sm">
                                    {new Date(match.match_date).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </VStack>
                            <Icon
                                as={match.result === 'win' ? CheckIcon : CopyIcon}
                                color={match.result === 'win' ? 'red.500' : 'gray.500'}
                                w={5}
                                h={5}
                            />
                        </Flex>
                    </Box>
                ))}
            </VStack>
        );
    };

    // 클립보드 복사 함수
    const handleCopyLink = async () => {
        const link = `${window.location.origin}/form/?inviterId=${userId}`;
        try {
            await navigator.clipboard.writeText(link);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000); // 2초 후 상태 초기화
        } catch (err) {
            console.error('복사 실패: ', err);
        }
    };

    return (
        <Box
            minH="100vh"
            bg={bgColor}
            backgroundImage={`
                linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
                url('/blood-texture.jpg'),
                url('/chain-texture.png')
            `}
            backgroundBlendMode="overlay"
            backgroundSize="cover"
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
            }}
        >
            <VStack 
                spacing={8} 
                align="stretch" 
                maxW="container.md" 
                mx="auto" 
                px={4}
                position="relative"
                zIndex={2}
            >
                <Heading
                    size="2xl"
                    color="red.600"
                    textAlign="center"
                    fontFamily="'Noto Serif KR', serif"
                    sx={{
                        animation: `${blinkingAnimation} 2s infinite`,
                        letterSpacing: "4px",
                        filter: "drop-shadow(0 0 10px rgba(255,0,0,0.5))",
                    }}
                >
                    지하 결투장 전적
                </Heading>

                <Box
                    bg="rgba(0,0,0,0.7)"
                    p={6}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="red.500"
                    boxShadow="0 0 20px rgba(255,0,0,0.2)"
                >
                    <VStack spacing={6} align="stretch">
                        {renderProfile()}
                        <Divider borderColor="red.500" opacity={0.3} />
                        {renderMatchHistory()}

                        <Tooltip
                            label={hasCopied ? "복사됨!" : "클립보드에 복사"}
                            placement="top"
                            hasArrow
                        >
                            <Button
                                bg="red.600"
                                color="white"
                                size="lg"
                                _hover={{ 
                                    bg: 'red.700',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg'
                                }}
                                _active={{ 
                                    bg: 'red.800',
                                    transform: 'translateY(0)',
                                }}
                                onClick={handleCopyLink}
                                sx={{
                                    boxShadow: '0 0 15px rgba(255,0,0,0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <HStack spacing={2}>
                                    <Icon
                                        as={hasCopied ? CheckIcon : CopyIcon}
                                        transition="0.2s"
                                        w={5}
                                        h={5}
                                    />
                                    <Text>
                                        {hasCopied ? '도전장 복사됨' : '도전장 보내기'}
                                    </Text>
                                </HStack>
                            </Button>
                        </Tooltip>
                    </VStack>
                </Box>

                <Text
                    color="red.400"
                    fontSize="sm"
                    textAlign="center"
                    fontFamily="monospace"
                    sx={{
                        animation: `${glitchAnimation} 3s infinite`,
                    }}
                >
                    &quot;더 강해져서 돌아와라...&quot;
                </Text>
            </VStack>
        </Box>
    );
}

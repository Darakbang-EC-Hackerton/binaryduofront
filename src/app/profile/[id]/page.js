'use client';
import { useEffect, useState } from 'react';
import { keyframes } from '@emotion/react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  useColorModeValue,
  Flex,
  Badge,
  Divider,
  Tooltip,
  Icon,
  HStack
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { FaTrophy, FaSkull } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Mock 데이터
const MOCK_DATA = {
  profile: {
    name: "Unknown Fighter",
    level: "위험",
    joinDate: "2024-01-01",
    lastActive: "2024-03-19"
  },
  matchHistory: [
    {
      match_id: "1",
      result: "win",
      match_date: "2024-04-27T15:30:00Z",
      opponent_name: "김철수"
    },
    {
      match_id: "2",
      result: "loss",
      match_date: "2024-05-05T18:45:00Z",
      opponent_name: "이영희"
    },
    {
      match_id: "3",
      result: "win",
      match_date: "2024-06-12T12:00:00Z",
      opponent_name: "박민수"
    }
  ]
};

// 애니메이션 정의
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

export default function ProfilePage({ paramsPromise }) {
    const [userId, setUserId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [matchHistory, setMatchHistory] = useState(null);
    const [hasCopied, setHasCopied] = useState(false);

    const textColor = useColorModeValue('red.300', 'red.200');
    const bgColor = 'black';

    const router = useRouter();

    const handleMatchClick = (matchId) => {
        router.push(`/battle?matchId=${matchId}`);
    };

    useEffect(() => {
        const initProfile = async () => {
            try {
                const params = await paramsPromise;
                const id = params.id;
                setUserId(id);

                // 프로필 정보 가져오기 시도
                try {
                    const profileRes = await fetch(`/api/profiles/${id}`);
                    if (profileRes.ok) {
                        const data = await profileRes.json();
                        setProfile(data);
                    } else {
                        throw new Error('Failed to fetch profile');
                    }
                } catch (error) {
                    console.log('프로필 정보 가져오기 실패, mock 데이터 사용');
                    setProfile({
                        ...MOCK_DATA.profile                        
                    });
                }

                // 매치 히스토리 가져오기 시도
                try {
                    const historyRes = await fetch(`/api/match-history?profileId=${id}`);
                    if (historyRes.ok) {
                        const data = await historyRes.json();
                        setMatchHistory(data);
                    } else {
                        throw new Error('Failed to fetch match history');
                    }
                } catch (error) {
                    console.log('매치 히스토리 가져오기 실패, mock 데이터 사용');
                    setMatchHistory(MOCK_DATA.matchHistory);
                }

            } catch (error) {
                console.error('초기화 실패:', error);
                // paramsPromise 실패 시 기본값 설정
                setProfile(MOCK_DATA.profile);
                setMatchHistory(MOCK_DATA.matchHistory);
            }
        };

        initProfile();
    }, [paramsPromise]);

    const handleCopyLink = async () => {
        
        
        try {
            const link = `${window.location.origin}/form?inviterId=${profile.name}`;
            await navigator.clipboard.writeText(link);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
            console.log('링크가 복사되었습니다:', link); // 디버깅용
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    // 프로필이나 매치 히스토리가 없으면 로딩 중이거나 에러 상태
    if (!profile || !matchHistory) {
        return (
            <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
                <Text color={textColor} fontSize="xl">데이터 로딩 중...</Text>
            </Box>
        );
    }

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
                        {/* 프로필 정보 */}
                        <VStack spacing={2}>
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
                            <Text color="gray.400" fontSize="sm">
                                위험 등급: {profile.level}
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                                첫 입장일: {profile.joinDate}
                            </Text>
                        </VStack>

                        <Divider borderColor="red.500" opacity={0.3} />
   {/* 도전장 보내기 섹션 */}
   <Box
                    bg="rgba(0,0,0,0.7)"
                    p={6}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="red.500"
                    boxShadow="0 0 20px rgba(255,0,0,0.2)"
                >
                    <VStack spacing={4} align="stretch">
                        <Text
                            color="red.400"
                            fontSize="lg"
                            fontWeight="bold"
                            textAlign="center"
                        >
                            도전장 보내기
                        </Text>
                        <Text
                            color="gray.400"
                            fontSize="sm"
                            textAlign="center"
                        >
                            링크를 복사하여 친구에게 공유하세요
                        </Text>
                        <Box position="relative">
                            <Tooltip
                                label={hasCopied ? "복사됨!" : "클립보드에 복사"}
                                placement="top"
                                hasArrow
                                isOpen={hasCopied}
                            >
                                <Button
                                    bg="red.600"
                                    color="white"
                                    size="lg"
                                    width="full"
                                    height="60px"
                                    onClick={handleCopyLink}
                                    sx={{
                                        boxShadow: '0 0 15px rgba(255,0,0,0.4)',
                                    }}
                                >
                                    <HStack spacing={2}>
                                        <Icon
                                            as={hasCopied ? CheckIcon : CopyIcon}
                                            transition="0.2s"
                                            w={5}
                                            h={5}
                                        />
                                        <Text fontSize="md">
                                            {hasCopied ? '도전장 링크가 복사되었습니다' : '도전장 링크 복사하기'}
                                        </Text>
                                    </HStack>
                                </Button>
                            </Tooltip>
                        </Box>
                    </VStack>
                </Box>
                        {/* 매치 히스토리 */}
                        <VStack spacing={3} align="stretch">
                            <Text color="red.400" fontSize="lg" fontWeight="bold">
                                최근 전적
                            </Text>
                            {matchHistory.map((match) => (
                                <Box
                                    key={match.match_id}
                                    bg="rgba(0,0,0,0.3)"
                                    p={4}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor={match.result === 'win' ? 'red.500' : 'gray.600'}
                                    onClick={() => handleMatchClick(match.match_id)}
                                    position="relative"
                                    role="button"
                                    aria-label="매치 상세 보기"
                                    _active={{
                                        bg: "rgba(0,0,0,0.4)",
                                        transform: "scale(0.98)"
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
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                >
                                                    <Icon 
                                                        as={match.result === 'win' ? FaTrophy : FaSkull}
                                                        w={3}
                                                        h={3}
                                                    />
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
                                    </Flex>
                                </Box>
                            ))}
                        </VStack>
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

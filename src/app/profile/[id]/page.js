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
  Divider
} from '@chakra-ui/react';

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

export default function ProfilePage({ paramsPromise }) {
    const [userId, setUserId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [matchResults, setMatchResults] = useState(null);
    const [loading, setLoading] = useState({
        profile: true,
        matchResults: true
    });
    const [error, setError] = useState({
        profile: null,
        matchResults: null
    });

    const textColor = useColorModeValue('red.300', 'red.200');
    const bgColor = 'black';
    const accentColor = 'red.500';

    useEffect(() => {
        const initProfile = async () => {
            try {
                const params = await paramsPromise;
                setUserId(params.id);

                // 프로필 정보와 매치 결과를 병렬로 가져오기
                const fetchProfile = fetch(`/api/profiles/${params.id}`)
                    .then(async (response) => {
                        if (!response.ok) throw new Error('Failed to fetch profile');
                        const data = await response.json();
                        setProfile(data);
                    })
                    .catch(error => {
                        console.error('프로필 가져오기 실패:', error);
                        setError(prev => ({ ...prev, profile: error.message }));
                        // 임시 프로필 데이터
                        setProfile({
                            name: params.id,
                            level: "위험",
                            joinDate: "2024-01-01",
                            lastActive: "2024-03-19"
                        });
                    })
                    .finally(() => {
                        setLoading(prev => ({ ...prev, profile: false }));
                    });

                const fetchMatchResults = fetch(`/api/health-match-results?profileId=${params.id}`)
                    .then(async (response) => {
                        if (!response.ok) throw new Error('Failed to fetch match results');
                        const data = await response.json();
                        setMatchResults(data);
                    })
                    .catch(error => {
                        console.error('전적 가져오기 실패:', error);
                        setError(prev => ({ ...prev, matchResults: error.message }));
                        // 임시 전적 데이터
                        setMatchResults({
                            totalMatches: 120,
                            wins: 100,
                            losses: 20,
                            healthRisk: 75,
                            recentMatches: []
                        });
                    })
                    .finally(() => {
                        setLoading(prev => ({ ...prev, matchResults: false }));
                    });

                // 병렬로 실행
                await Promise.allSettled([fetchProfile, fetchMatchResults]);
                
            } catch (error) {
                console.error('초기화 실패:', error);
            }
        };

        initProfile();
    }, [paramsPromise]);

    if (loading.profile && loading.matchResults) {
        return (
            <Box
                minH="100vh"
                bg={bgColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Text color={textColor} fontSize="xl">
                    전사 정보를 불러오는 중...
                </Text>
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
                        {!loading.profile && (
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
                        )}

                        {!loading.matchResults && (
                            <>
                                <Box>
                                    <Text color="red.400" mb={2}>건강 위험도</Text>
                                    <Progress 
                                        value={matchResults.healthRisk} 
                                        colorScheme="red" 
                                        bg="rgba(255,0,0,0.2)"
                                        borderRadius="full"
                                        h="20px"
                                    />
                                </Box>

                                <Divider borderColor="red.500" opacity={0.3} />

                                <Flex justify="space-between" align="center">
                                    <Badge colorScheme="red" p={2} fontSize="md">
                                        승리: {matchResults.wins}
                                    </Badge>
                                    <Badge colorScheme="gray" p={2} fontSize="md">
                                        패배: {matchResults.losses}
                                    </Badge>
                                </Flex>
                            </>
                        )}

                        <Button
                            bg="red.600"
                            color="white"
                            size="lg"
                            _hover={{ bg: 'red.700' }}
                            _active={{ bg: 'red.800' }}
                            onClick={() => {
                                const link = `${window.location.origin}/form/?inviterId=${userId}`;
                                navigator.clipboard.writeText(link).then(() => {
                                    alert('도전장 링크가 복사되었습니다!');
                                }).catch(err => {
                                    console.error('복사 실패: ', err);
                                });
                            }}
                            sx={{
                                boxShadow: '0 0 15px rgba(255,0,0,0.4)',
                            }}
                        >
                            도전장 보내기
                        </Button>
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

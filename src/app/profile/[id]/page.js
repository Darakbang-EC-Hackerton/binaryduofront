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
  HStack,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { FaTrophy, FaSkull } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

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

export default function ProfilePage() {
    const params = useParams();
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
                const id = params.id;
                console.log('id:', id);
                setUserId(id);

                // 프로필 정보 가져오기 시도
                try {
                    const profileRes = await fetch(`https://port-0-healthmatch1-m30h6ofzaa0b4434.sel4.cloudtype.app//profiles/${id}`);
                    if (profileRes.ok) {
                        const data = await profileRes.json();
                        console.log('data:', data);
                        setProfile(data.profile);
                    } else {
                        throw new Error('Failed to fetch profile');
                    }
                } catch (error) {
                    console.log('프로필 정보 가져오기 실패, mock 데이터 사용');
                    setProfile({
                        ...MOCK_DATA.profile,
                        name: id
                    });
                }

                // 매치 히스토리 가져오기 시도
                try {
                    const historyRes = await fetch(`https://port-0-healthmatch1-m30h6ofzaa0b4434.sel4.cloudtype.app//health-match-results?profileId=${id}`);
                    if (historyRes.ok) {
                        const data = await historyRes.json();
                        console.log('data:', data);
                        setMatchHistory(data.match_history);
                    } else {
                        throw new Error('Failed to fetch match history');
                    }
                } catch (error) {
                    console.log('매치 히스토리 가져오기 실패, mock 데이터 사용');
                    setMatchHistory(MOCK_DATA.matchHistory);
                }

            } catch (error) {
                console.error('초기화 실패:', error);
                setProfile(MOCK_DATA.profile);
                setMatchHistory(MOCK_DATA.matchHistory);
            }
        };

        if (params.id) {
            initProfile();
        }
    }, [params.id]);

    const handleCopyLink = async () => {
        
        
        try {
            const link = `${window.location.origin}/form?inviterId=${profile.name}`;
            const message = "새해에도 건강해야죠! AI 건강진단 받아보세요";
            const linkWithMessage = `${link}\n\n${message}`;
            await navigator.clipboard.writeText(linkWithMessage);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
            console.log('링크가 복사되었습니다:', link); // 디버깅용
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    const prepareStatsData = (profile) => {
        if (!profile) return [];

        // BMI 정상 범위: 18.5 ~ 25
        const normalBMI = 21.75;
        const bmiScore = Math.max(0, 100 - Math.abs(profile.bmi - normalBMI) * 10);

        // 운동 점수 (주 7회 기준)
        const exerciseScore = (profile.weekly_exercise_days / 7) * 100;

        // 음주 점수 (주 0회가 이상적)
        const drinkingScore = Math.max(0, 100 - (profile.drinking_frequency_per_week * 10));

        // 체중 점수
        const weightScore = Math.max(0, 100 - Math.abs(profile.weight_kg - profile.ideal_values.ideal_weight_kg) * 2);

        // 흡연 점수 (0이 이상적)
        const smokingScore = profile.smoke_count === null ? 100 : Math.max(0, 100 - profile.smoke_count * 5);

        return [
            { subject: 'BMI', A: bmiScore, fullMark: 100 },
            { subject: '운동량', A: exerciseScore, fullMark: 100 },
            { subject: '금주', A: drinkingScore, fullMark: 100 },
            { subject: '체중', A: weightScore, fullMark: 100 },
            { subject: '금연', A: smokingScore, fullMark: 100 },
        ];
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
                                건강 등급: {profile.health_grade}
                            </Text>
                            
                        </VStack>

                        <Divider borderColor="red.500" opacity={0.3} />

                        {/* 능력치 그래프 추가 */}
                        <Box
                            h="300px"
                            w="full"
                            position="relative"
                            bg="rgba(0,0,0,0.3)"
                            borderRadius="lg"
                            p={4}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={prepareStatsData(profile)}>
                                    <PolarGrid stroke="rgba(255,0,0,0.3)" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                                    />
                                    <PolarRadiusAxis
                                        angle={30}
                                        domain={[0, 100]}
                                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                                    />
                                    <Radar
                                        name="능력치"
                                        dataKey="A"
                                        stroke="#E53E3E"
                                        fill="#E53E3E"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Box>

                        {/* 상세 스탯 */}
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <GridItem>
                                <VStack
                                    bg="rgba(0,0,0,0.3)"
                                    p={3}
                                    borderRadius="md"
                                    align="start"
                                >
                                    <Text color="gray.400" fontSize="sm">신장</Text>
                                    <Text color={textColor} fontSize="lg">{profile.height_cm}cm</Text>
                                </VStack>
                            </GridItem>
                            <GridItem>
                                <VStack
                                    bg="rgba(0,0,0,0.3)"
                                    p={3}
                                    borderRadius="md"
                                    align="start"
                                >
                                    <Text color="gray.400" fontSize="sm">체중</Text>
                                    <Text color={textColor} fontSize="lg">{profile.weight_kg}kg</Text>
                                </VStack>
                            </GridItem>
                            <GridItem>
                                <VStack
                                    bg="rgba(0,0,0,0.3)"
                                    p={3}
                                    borderRadius="md"
                                    align="start"
                                >
                                    <Text color="gray.400" fontSize="sm">주간 운동</Text>
                                    <Text color={textColor} fontSize="lg">{profile.weekly_exercise_days}회</Text>
                                </VStack>
                            </GridItem>
                            <GridItem>
                                <VStack
                                    bg="rgba(0,0,0,0.3)"
                                    p={3}
                                    borderRadius="md"
                                    align="start"
                                >
                                    <Text color="gray.400" fontSize="sm">BMI</Text>
                                    <Text color={textColor} fontSize="lg">{profile.bmi.toFixed(1)}</Text>
                                </VStack>
                            </GridItem>
                        </Grid>

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
                                    _hover={{}}
                                    _active={{}}
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
                                    key={match.matchId}
                                    bg="rgba(0,0,0,0.3)"
                                    p={4}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor={match.result === 'win' ? 'red.500' : 'gray.600'}
                                    onClick={() => handleMatchClick(match.matchId)}
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
                                                    VS {match.opponentName}
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
                                                {new Date(match.matchDate).toLocaleDateString('ko-KR', {
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

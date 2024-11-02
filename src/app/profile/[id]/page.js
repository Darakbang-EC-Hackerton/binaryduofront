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
    const [loading, setLoading] = useState(true);

    const textColor = useColorModeValue('red.300', 'red.200');
    const bgColor = 'black';
    const accentColor = 'red.500';

    useEffect(() => {
        const getParams = async () => {
            try {
                const params = await paramsPromise;
                setUserId(params.id);
            } catch (error) {
                console.error('params 가져오기 실패:', error);
            }
        };
        getParams();
    }, [paramsPromise]);

    useEffect(() => {
        if (userId) {
            const fetchProfile = async () => {
                try {
                    const response = await fetch(`https://example.com/api/profile/${userId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setProfile(data);
                } catch (error) {
                    console.error('프로필 정보를 가져오는데 실패했습니다:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [userId]);

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
                        <Text
                            fontSize="2xl"
                            color={textColor}
                            textAlign="center"
                            sx={{
                                animation: `${glitchAnimation} 5s infinite`,
                            }}
                        >
                            {userId}
                        </Text>

                        <Box>
                            <Text color="red.400" mb={2}>건강 위험도</Text>
                            <Progress 
                                value={75} 
                                colorScheme="red" 
                                bg="rgba(255,0,0,0.2)"
                                borderRadius="full"
                                h="20px"
                            />
                        </Box>

                        <Divider borderColor="red.500" opacity={0.3} />

                        <Flex justify="space-between" align="center">
                            <Badge colorScheme="red" p={2} fontSize="md">승리: 100</Badge>
                            <Badge colorScheme="gray" p={2} fontSize="md">패배: 20</Badge>
                        </Flex>

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
                            친구에게 도전장 보내기
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

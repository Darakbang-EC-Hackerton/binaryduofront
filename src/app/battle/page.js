'use client';
import { useEffect, useState } from 'react';
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
  useColorModeValue
} from '@chakra-ui/react';


// 깜빡이는 애니메이션 효과 수정
const blinkingAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

function BattlePage() {
  const searchParams = useSearchParams();
  const user1Id = searchParams.get('user1Id');
  const user2Id = searchParams.get('user2Id');
  const [matchInfo, setMatchInfo] = useState({
    user1Name: '임시 유저 1',
    user2Name: '임시 유저 2',
    status: '대기 중'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // user1Id와 user2Id가 존재하면 매치 정보 가져오기
    if (user1Id && user2Id) {
      const fetchMatchInfo = async () => {
        try {
          setLoading(true);
          const response = await fetch(`https://example.com/api/match?user1Id=${user1Id}&user2Id=${user2Id}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setMatchInfo(data);
        } catch (error) {
          console.error('Failed to fetch match information:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMatchInfo();
    }
  }, [user1Id, user2Id]);

  const bgColor = useColorModeValue('red.50', 'red.900');
  const textColor = useColorModeValue('red.800', 'red.100');
  
  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg={bgColor}
      >
        <Text fontSize="2xl" color={textColor}>로딩 중...</Text>
      </Box>
    );
  }

  if (!matchInfo) {
    return <div>No match information available</div>;
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      backgroundImage="url('/paper-texture.webp')"
      backgroundBlendMode="overlay"
      backgroundSize="100% 100%"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
      py={10}
    >
      <VStack spacing={8} align="center">
        <Heading
          size="2xl"
          color={textColor}
          fontFamily="'Noto Serif KR', serif"
          textShadow="2px 2px 4px rgba(0,0,0,0.3)"
          sx={{ animation: `${blinkingAnimation} 3s infinite` }}
        >
          지하 결투장!
        </Heading>
        <Text
          fontSize="sm"
          color={textColor}
          fontStyle="italic"
          opacity={0.8}
        >
          건강하지 않으면 죽음뿐!
        </Text>

        <Flex
          direction="row"
          align="center"
          justify="center"
          w="full"
          gap={8}
        >
          <VStack>
            <Image
              src="/avatar-placeholder.png"
              boxSize="150px"
              borderRadius="full"
              border="4px solid"
              borderColor="red.600"
              alt="유저 1 아바타"
            />
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
            >
              {matchInfo.user1Name}
            </Text>
          </VStack>

          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="red.600"
            transform="rotate(-15deg)"
          >
            VS
          </Text>

          <VStack>
            <Image
              src="/avatar-placeholder.png"
              boxSize="150px"
              borderRadius="full"
              border="4px solid"
              borderColor="red.600"
            />
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
            >
              {matchInfo.user2Name}
            </Text>
          </VStack>
        </Flex>

        <Text
          fontSize="xl"
          color={textColor}
          fontFamily="'Noto Serif KR', serif"
          border="2px solid"
          borderColor="red.600"
          p={3}
          borderRadius="md"
        >
          대결 상태: {matchInfo.status}
        </Text>

        <Button
          size="lg"
          colorScheme="red"
          variant="outline"
          _hover={{ bg: 'red.100' }}
          onClick={() => {
            const userId = 'test';        
            if (userId) {
              window.location.href = `/profile/${userId}`;
            }
          }}
        >
          내 무공 명세서 보기
        </Button>
      </VStack>
    </Box>
  );
}

export default BattlePage;
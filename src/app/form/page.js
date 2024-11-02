'use client';
import { useEffect, useState } from 'react';
import { keyframes } from '@emotion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Container,
  Text,
  useColorModeValue,
  Progress,
  InputGroup,
  InputRightElement,
  Badge,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
} from '@chakra-ui/react';

function QuestionPoolPage() {
  const searchParams = useSearchParams();
  const inviterId = searchParams.get('inviterId');
  const [answers, setAnswers] = useState({
    height: '',
    weight: '',
    workoutCount: 0,
    smokingCount: 0,
    drinkingCount: 0,
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState({
    workout: false,
    smoking: false,
    drinking: false
  });
  const router = useRouter();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const accentColor = 'red.500';

  const calculateProgress = () => {
    const totalFields = Object.keys(answers).length;
    const filledFields = Object.values(answers).filter(value => 
      typeof value === 'number' ? true : value.trim() !== ''
    ).length;
    return (filledFields / totalFields) * 100;
  };

  const handleInputChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const progress = calculateProgress();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // 서버에 데이터 전송 및 matchId 수신
      const response = await fetch('https://example.com/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            height: answers.height,
            weight: answers.weight,
            workoutCount: answers.workoutCount,
            smokingCount: answers.smokingCount,
            drinkingCount: answers.drinkingCount,
            name: answers.name
          }
        )
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      const data = await response.json();
      const { inviteeId } = data;  // 서버에서 할당된 inviteeId

      // 건강 매칭 결과 요청
      const matchResponse = await fetch(`https://example.com/health-match-result?inviterId=${inviterId}&inviteeId=${inviteeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!matchResponse.ok) {
        throw new Error('건강 매칭 결과를 가져오는데 실패했습니다');
      }

      const matchData = await matchResponse.json();
      const { matchId } = matchData;
      // 실제 API가 없는 경우를 위한 임시 matchId
      const tempMatchId = 'match_' + Date.now();
      
      // URL 쿼리 파라미터 구성
      const queryParams = new URLSearchParams({
        matchId: matchId || tempMatchId  // 실제 matchId가 없으면 임시 ID 사용
      }).toString();

      // battle 페이지로 이동
      router.push(`/battle?${queryParams}`);
      
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.sm">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Badge colorScheme="red" fontSize="sm" mb={2}>AI POWERED</Badge>
            <Heading 
              size="lg" 
              color={textColor}
              fontWeight="600"
              letterSpacing="tight"
            >
              예상 질병 리포트
            </Heading>                     
            <Flex justify="center" mt={4} gap={4} flexWrap="wrap">
              <Badge 
                colorScheme="red" 
                p={2} 
                borderRadius="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                🔍 질병 발생 위험도
              </Badge>
              <Badge 
                colorScheme="orange" 
                p={2} 
                borderRadius="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                ⚠️ 건강 위험 요인
              </Badge>
              <Badge 
                colorScheme="green" 
                p={2} 
                borderRadius="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                💊 맞춤형 건강 조언
              </Badge>
              <Badge 
                colorScheme="blue" 
                p={2} 
                borderRadius="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                📊 동년배 건강 비교
              </Badge>
            </Flex>
          </Box>

          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
          >
            <VStack spacing={8}>
              <Progress
                value={progress}
                size="xs"
                width="100%"
                colorScheme="red"
                borderRadius="full"
                bg="gray.100"
              />

              {/* 키 입력 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  키
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (심혈관 질환 위험도 분석에 사용)
                  </Text>
                </FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    placeholder="키를 입력해주세요"
                    value={answers.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    min="0"
                    max="300"
                  />
                  <InputRightElement width="4.5rem">
                    <Text fontSize="sm" color="gray.500">cm</Text>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* 몸무게 입력 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  몸무게
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (대사증후군 위험도 계산)
                  </Text>
                </FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    placeholder="몸무게를 입력해주세요"
                    value={answers.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    min="0"
                    max="300"
                  />
                  <InputRightElement width="4.5rem">
                    <Text fontSize="sm" color="gray.500">kg</Text>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* 운동 횟수 슬라이더 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  주간 운동 횟수
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (심장 건강 지수 측정)
                  </Text>
                </FormLabel>
                <Slider
                  id='workout-slider'
                  defaultValue={0}
                  min={0}
                  max={7}
                  step={1}
                  onChange={(v) => handleInputChange('workoutCount', v)}
                  onMouseEnter={() => setShowTooltip({...showTooltip, workout: true})}
                  onMouseLeave={() => setShowTooltip({...showTooltip, workout: false})}
                >
                  <SliderMark value={0} mt='2' ml='-2.5' fontSize='sm'>0</SliderMark>
                  <SliderMark value={7} mt='2' ml='-2.5' fontSize='sm'>7</SliderMark>
                  <SliderTrack bg="red.100">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='red.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip.workout}
                    label={`${answers.workoutCount}회`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </FormControl>

              {/* 흡연량 슬라이더 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  일일 흡연량
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (폐 질환 위험도 분석)
                  </Text>
                </FormLabel>
                <Slider
                  defaultValue={0}
                  min={0}
                  max={50}
                  step={1}
                  onChange={(v) => handleInputChange('smokingCount', v)}
                  onMouseEnter={() => setShowTooltip({...showTooltip, smoking: true})}
                  onMouseLeave={() => setShowTooltip({...showTooltip, smoking: false})}
                >
                  <SliderMark value={0} mt='2' ml='-2.5' fontSize='sm'>0</SliderMark>
                  <SliderMark value={50} mt='2' ml='-2.5' fontSize='sm'>50</SliderMark>
                  <SliderTrack bg="red.100">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='red.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip.smoking}
                    label={`${answers.smokingCount}개비`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </FormControl>

              {/* 음주 횟수 슬라이더 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  주간 음주 횟수
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (간 질환 위험도 분석)
                  </Text>
                </FormLabel>
                <Slider
                  defaultValue={0}
                  min={0}
                  max={7}
                  step={1}
                  onChange={(v) => handleInputChange('drinkingCount', v)}
                  onMouseEnter={() => setShowTooltip({...showTooltip, drinking: true})}
                  onMouseLeave={() => setShowTooltip({...showTooltip, drinking: false})}
                >
                  <SliderMark value={0} mt='2' ml='-2.5' fontSize='sm'>0</SliderMark>
                  <SliderMark value={7} mt='2' ml='-2.5' fontSize='sm'>7</SliderMark>
                  <SliderTrack bg="red.100">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='red.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip.drinking}
                    label={`${answers.drinkingCount}회`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </FormControl>

              {/* 이름 입력 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">이름</FormLabel>
                <Input
                  type="text"
                  placeholder="이름을 입력해주세요"
                  value={answers.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={20}
                />
              </FormControl>

              <Button
                colorScheme="red"
                size="lg"
                width="full"
                isDisabled={progress !== 100}
                onClick={handleSubmit}
                position="relative"
                height="60px"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'md',
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {loading ? (
                  <VStack spacing={1}>
                    <Text
                      color="white"
                      fontSize="sm"
                      fontFamily="monospace"
                      sx={{
                        animation: `${glitchAnimation} 3s infinite`,
                      }}
                    >
                      [SYSTEM ERROR: AI_ANALYSIS_CORRUPTED]
                    </Text>
                    <Progress
                      size="xs"
                      width="80%"
                      isIndeterminate
                      colorScheme="whiteAlpha"
                    />
                  </VStack>
                ) : (
                  <Text fontSize="md">
                    {progress === 100 ? '건강 리스크 분석하기' : '모든 항목을 입력해주세요'}
                  </Text>
                )}
              </Button>

              <Flex justify="center" align="center" gap={2}>
                <Text fontSize="sm" color="gray.500">
                  {Math.round(progress)}% 완료
                </Text>
                {progress === 100 && (
                  <Badge colorScheme="green" variant="subtle">
                    입력완료
                  </Badge>
                )}
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default QuestionPoolPage;
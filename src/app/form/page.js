'use client';
import { useEffect, useState, Suspense } from 'react';
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

// Form 컴포넌트 분리
function FormContent() {
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
  const [fakeAnswers, setFakeAnswers] = useState({
    sleepHours: 0,
    mealsPerDay: 0,
    hobby: '',
    sittingHours: '',
  });
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState({
    workout: false,
    smoking: false,
    drinking: false,
    sleep: false,
    meals: false,
    sitting: false,
  });
  const router = useRouter();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const accentColor = 'red.500';

  const calculateProgress = () => {
    const totalFields = Object.keys(answers).length + Object.keys(fakeAnswers).length;
    
    // 실제 답변 체크
    const filledRealFields = Object.entries(answers).filter(([key, value]) => {
      if (typeof value === 'number') return true;
      return value.trim() !== '';
    }).length;

    // 가짜 답변 체크 (숫자와 문자열 타입 구분)
    const filledFakeFields = Object.entries(fakeAnswers).filter(([key, value]) => {
      if (key === 'hobby') return value.trim() !== '';  // hobby는 문자열
      return value !== '';  // 나머지는 숫자
    }).length;

    return ((filledRealFields + filledFakeFields) / totalFields) * 100;
  };

  const handleInputChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFakeInputChange = (field, value) => {
    setFakeAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const progress = calculateProgress();

  // 컴포넌트 마운트 시 쿠키 확인 및 처리
  useEffect(() => {
    const checkHealthProfile = async () => {
      const healthProfileId = Cookies.get('healthProfileId');
      
      if (healthProfileId && inviterId) {
        try {
          // 매치 결과 요청
          const matchResultResponse = await fetch(`https://port-0-healthmatch1-m30h6ofzaa0b4434.sel4.cloudtype.app/health-match-result?inviterId=${inviterId}&inviteeId=${healthProfileId}`);
          
          if (!matchResultResponse.ok) {
            throw new Error('Failed to get match result');
          }

          const matchResult = await matchResultResponse.json();
          const matchId = matchResult;
          console.log('Match created with ID:', matchId);
          
          // battle 페이지로 즉시 이동
          router.push(`/battle?matchId=${matchId}`);
        } catch (error) {
          console.error('Failed to create match:', error);
        }
      }
    };

    checkHealthProfile();
  }, [inviterId, router]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        height: Number(answers.height),
        weight: Number(answers.weight),
        exerciseCount: Number(answers.workoutCount),
        smokeCount: Number(answers.smokingCount),
        drinkCount: Number(answers.drinkingCount),
        name: answers.name
      };

      console.log('Sending profile data:', profileData);

      const profileResponse = await fetch('https://port-0-healthmatch1-m30h6ofzaa0b4434.sel4.cloudtype.app/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to create profile');
      }

      const { inviteeId } = await profileResponse.json();
      
      // 프로필 ID를 쿠키에 저장
      Cookies.set('healthProfileId', inviteeId);

      console.log('Received inviteeId:', inviteeId);
      
      // 매치 결과 요청
      const matchResultResponse = await fetch(`https://port-0-healthmatch1-m30h6ofzaa0b4434.sel4.cloudtype.app/health-match-result?inviterId=${inviterId}&inviteeId=${inviteeId}`);
      
      if (!matchResultResponse.ok) {
        throw new Error('Failed to get match result');
      }

      const matchResult = await matchResultResponse.json();
      const matchId = matchResult;
      console.log('Match created with ID:', matchId);
      
      router.push(`/battle?matchId=${matchId}`);
      
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

              {/* 수면 시간 슬라이더 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  평균 수면 시간
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (수면 건강 지수 분석)
                  </Text>
                </FormLabel>
                <Slider
                  defaultValue={0}
                  min={0}
                  max={12}
                  step={0.5}
                  onChange={(v) => handleFakeInputChange('sleepHours', v)}
                  onMouseEnter={() => setShowTooltip({...showTooltip, sleep: true})}
                  onMouseLeave={() => setShowTooltip({...showTooltip, sleep: false})}
                >
                  <SliderMark value={0} mt='2' ml='-2.5' fontSize='sm'>0</SliderMark>
                  <SliderMark value={12} mt='2' ml='-2.5' fontSize='sm'>12</SliderMark>
                  <SliderTrack bg="red.100">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='red.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip.sleep}
                    label={`${fakeAnswers.sleepHours}시간`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </FormControl>

              {/* 식사 횟수 슬라이더 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  하루 식사 횟수
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (영양 균형도 측정)
                  </Text>
                </FormLabel>
                <Slider
                  defaultValue={1}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(v) => handleFakeInputChange('mealsPerDay', v)}
                  onMouseEnter={() => setShowTooltip({...showTooltip, meals: true})}
                  onMouseLeave={() => setShowTooltip({...showTooltip, meals: false})}
                >
                  <SliderMark value={1} mt='2' ml='-2.5' fontSize='sm'>1</SliderMark>
                  <SliderMark value={5} mt='2' ml='-2.5' fontSize='sm'>5</SliderMark>
                  <SliderTrack bg="red.100">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='red.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip.meals}
                    label={`${fakeAnswers.mealsPerDay}회`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
              </FormControl>

              {/* 취미 활동은 텍스트 입력 유지 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  주요 취미 활동
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (스트레스 지수 분석)
                  </Text>
                </FormLabel>
                <Input
                  type="text"
                  placeholder="주로 즐기시는 취미 활동을 입력해주세요"
                  value={fakeAnswers.hobby}
                  onChange={(e) => handleFakeInputChange('hobby', e.target.value)}
                />
              </FormControl>

              {/* 좌식 시간 슬라이더 */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500">
                  하루 좌식 시간
                  <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                    (활동량 지수 계산)
                  </Text>
                </FormLabel>
                <Slider
                  defaultValue={0}
                  min={0}
                  max={16}
                  step={0.5}
                  onChange={(v) => handleFakeInputChange('sittingHours', v)}
                  onMouseEnter={() => setShowTooltip({...showTooltip, sitting: true})}
                  onMouseLeave={() => setShowTooltip({...showTooltip, sitting: false})}
                >
                  <SliderMark value={0} mt='2' ml='-2.5' fontSize='sm'>0</SliderMark>
                  <SliderMark value={16} mt='2' ml='-2.5' fontSize='sm'>16</SliderMark>
                  <SliderTrack bg="red.100">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='red.500'
                    color='white'
                    placement='top'
                    isOpen={showTooltip.sitting}
                    label={`${fakeAnswers.sittingHours}시간`}
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

// 메인 페이지 컴포넌트
export default function QuestionPoolPage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="black">
        <Text color="red.300" fontSize="xl">로딩 중...</Text>
      </Box>
    }>
      <FormContent />
    </Suspense>
  );
}
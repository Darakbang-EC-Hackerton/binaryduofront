'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button, Heading, VStack, FormControl, FormLabel, Input, Box, Container, Text } from '@chakra-ui/react';

// 질문 풀 컴포넌트 (기본적인 Next.js 폼 페이지 + 클라이언트 사이드 데이터 패칭)

function QuestionPoolPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const router = useRouter();
  
    useEffect(() => {
      // 쿠키 체크 후 사용자 ID가 있으면 대결 페이지로 리다이렉트
      const userId = Cookies.get('userId');
      if (userId) {
        router.push('/battle');
        return;
      }
  
      // 질문 데이터를 외부 서버에서 가져오기 위한 fetch 요청
      const fetchQuestions = async () => {
        try {
          const response = await fetch('https://example.com/api/questions');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setQuestions(data.questions);
        } catch (error) {
          console.error('질문을 가져오는데 실패했습니다:', error);
          // 데이터가 없을 경우 임시 질문 설정
          setQuestions(['키', '몸무게', '일주일 운동 횟수','흡연여부', '이름', '좋아하는 음식']);
        } finally {
          setLoading(false);
        }
      };
  
      fetchQuestions();
    }, []);
  
    // 입력 값 변경 시 상태 업데이트
    const handleInputChange = (e, index) => {
      setAnswers({
        ...answers,
        [index]: e.target.value,
      });
    };
  
    // OK 버튼 클릭 시 대결 페이지로 이동하고 입력 데이터 전송
    const handleOkClick = async () => {
      try {
        const response = await fetch('https://example.com/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(answers),
        });
        if (!response.ok) {
          throw new Error('답변 제출에 실패했습니다');
        }
        const result = await response.json();
        // 대결 페이지로 이동하면서 응답 데이터를 쿼리 파라미터로 전달
        router.push({
          pathname: '/battle',
          query: { result: JSON.stringify(result) },
        });
      } catch (error) {
        console.error('답변 제출에 실패했습니다:', error);
      }
    };
  
    if (loading) {
      return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Text>로딩 중...</Text></Box>;
    }
  
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center">얼마나 <Text as="span" fontWeight="thin" fontSize="smaller">건</Text>강하세요?</Heading>
          <VStack as="form" spacing={6}>
            {questions.map((question, index) => (
              <FormControl key={index}>
                <FormLabel>{question}</FormLabel>
                <Input
                  type="text"
                  name={`question-${index}`}
                  onChange={(e) => handleInputChange(e, index)}
                />
              </FormControl>
            ))}
            <Button colorScheme="blue" onClick={handleOkClick} width="full">
              {loading ? '내 강함 확인하기' : '내 건강 확인하기'}
            </Button>
          </VStack>
        </VStack>
      </Container>
    );
  }
  
  export default QuestionPoolPage;
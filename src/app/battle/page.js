'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
// 질문 풀 컴포넌트 (기본적인 Next.js 폼 페이지 + 클라이언트 사이드 데이터 패칭)

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!matchInfo) {
    return <div>No match information available</div>;
  }

  return (
    <div>
      <h1>대결 정보</h1>
      <p>유저 1: {matchInfo.user1Name}</p>
      <p>유저 2: {matchInfo.user2Name}</p>
      <p>매치 상태: {matchInfo.status}</p>
      <button type="button" onClick={() => {
        // const userId = Cookies.get('userId');        
        const userId = 'test';        
        if (userId) {
          window.location.href = `/profile/${userId}`;
        }
      }}>내 프로필로 이동하기</button>
    </div>
  );
}

export default BattlePage;
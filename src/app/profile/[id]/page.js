'use client';
import { useEffect, useState } from 'react';
import {
  ClipboardButton,
  ClipboardIconButton,
  ClipboardInput,
} from "@/components/ui/clipboard"
import { InputGroup } from "@/components/ui/input-group"
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
export default function ProfilePage({params}) {
    const userId=params.id
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // userId를 이용하여 프로필 정보 가져오기
      const fetchProfile = async () => {
        try {
          const response = await fetch(`https://example.com/api/profile/${userId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setProfile(data);
        } catch (error) {
          console.error('Failed to fetch profile information:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProfile();
    }, [userId]);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    // if (!profile) {
    //   return <div>{userId}님의 정보가 없습니다</div>;
    // }
  
    return (
      <div>
        <h1>프로필</h1>
        <p>닉네임: {userId} </p>
        <p>랭킹 등급: A+</p>
        <button type="button" onClick={() => {
        const link = `${window.location.origin}/form/?ID=${userId}`;

        navigator.clipboard.writeText(link).then(() => {
          alert('프로필 링크가 클립보드에 복사되었습니다!');
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      }}>프로필 링크 복사하기</button>


        <p>대결 기록:</p>
        {/* <ul>
          {profile.battleRecords.map((record, index) => (
            <li key={index}>VS {record.opponent} - {record.result}</li>
          ))}
        </ul> */}
      </div>
    );
  }
  
  
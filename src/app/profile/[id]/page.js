'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Box, Heading, Text, Button, VStack, Spinner } from '@chakra-ui/react';

export default function ProfilePage({ paramsPromise }) {
    const [userId, setUserId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
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

    // if (loading) {
    //     return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Spinner /></Box>;
    // }

    return (
        <Box p={5}>
            <VStack spacing={4} align="stretch">
                <Heading as="h1" size="xl">{userId}.님의 건강 점수는?</Heading>                
                <Text fontSize="lg">건강 활동 등급: A+</Text>
                <Button colorScheme="blue" onClick={() => {
                    const link = `${window.location.origin}/form/?ID=${userId}`;
                    navigator.clipboard.writeText(link).then(() => {
                        alert('프로필 링크가 클립보드에 복사되었습니다!');
                    }).catch(err => {
                        console.error('복사 실패: ', err);
                    });
                }}>
                    다른 친구에게 (건)강하세요? 묻기
                </Button>               
                <Text fontSize="lg">대전 기록</Text>
                <Text fontSize="lg">승리: 100 패배: 20</Text>
            </VStack>
        </Box>
    );
}

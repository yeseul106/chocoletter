import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoBackButton } from "../components/common/GoBackButton";
import { getChatRooms } from "../services/chatApi";
import Loading from "../components/common/Loading";
import useViewportHeight from "../hooks/useViewportHeight";

interface ChatRoom {
    roomId: number;
    nickName: string;
    unreadCount?: number;
    lastMessage?: string;
}

const ChatRoomListView = () => { 
    useViewportHeight();
    
        // 더미 데이터
        const dummyChatRooms = [
            { roomId: 9997, nickName: "예슬", unreadCount: 3, lastMessage: "안녕! 잘 지내?" },
            { roomId: 9998, nickName: "준희", unreadCount: 1, lastMessage: "오늘 시간 어때?" },
            { roomId: 9999, nickName: "두철", unreadCount: 0, lastMessage: "카톡 확인해!" },
            { roomId: 10000, nickName: "훈서", unreadCount: 5, lastMessage: "내일 뭐해?" },
            { roomId: 10001, nickName: "한송", unreadCount: 2, lastMessage: "집에 언제 가?" },
        ];
        

    const [chatRooms, setChatRooms] = useState<ChatRoom[]>(dummyChatRooms);
    const [isLoading, setIsLoading] = useState(true);
    const memberId = 9999 
    const navigate = useNavigate();
    // 채팅방 목록 불러오기
    useEffect(() => {
        const loadChatRooms = async () => {
            setIsLoading(true);
            try {
                const data = await getChatRooms();
                
                if (!data || data.length === 0) {
                    console.warn("API 데이터가 없어서 더미 데이터를 유지합니다.");
                    return;  //✅ 나중에 삭제
                }

                setChatRooms(data);
            } catch (error) {
                console.error("채팅방 목록 불러오기 실패! 더미 데이터 사용.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadChatRooms();
    }, []);

    // 안읽은 채팅 개수 & 마지막 메시지 불러오기
    // ✅ 가장최근이 위로 올라오게? : props로 creatAt 받아와야할듯 하려면
    useEffect(() => {
        if (!chatRooms || chatRooms.length === 0) return;
        
        const loadLastMessages = async () => {
            try {
                console.log("메시지 불러오는 중...");
                const baseUrl = import.meta.env.VITE_CHAT_API_URL;
                const updatedRooms = await Promise.all(
                    chatRooms.map(async (room) => {
                        try {
                            const response = await axios.get(
                                `${baseUrl}/api/v1/chat/${room.roomId}/${memberId}/last` // ✅ TODO 수정필요
                            );

                            return {
                                ...room,
                                unreadCount: response.data?.unreadCount || 0,
                                lastMessage: response.data?.lastMessage || "", 
                            };
                        } catch (error) {
                            console.error(`채팅방(${room.roomId}) 마지막 메시지 불러오기 실패!`, error);
                            return room // { ...room, unreadCount: 0 }; // 오류 시 기본값 유지
                        }
                    })
                );

                setChatRooms((prevRooms) => {
                    return JSON.stringify(prevRooms) !== JSON.stringify(updatedRooms) ? updatedRooms : prevRooms;
                });
            } catch (error) {
                console.error("안 읽은 메시지 불러오기 실패!", error);
            }
        };

        loadLastMessages();
    }, [JSON.stringify(chatRooms)]); 
    
    // 채팅방 입장
    const handleRoomClick = (room: ChatRoom) => {
        console.log(room.roomId);
        navigate(`/chat/room/${room.roomId}`, { state: { roomId: room.roomId, nickName: room.nickName } });
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen min-w-screen relative bg-chocoletterGiftBoxBg overflow-hidden">
            {/* 나의 채팅방 목록 */}
            <div className="w-full md:max-w-sm h-[58px] px-4 py-[17px] bg-chocoletterPurpleBold flex flex-col justify-center items-center gap-[15px] fixed z-50">
                <div className="self-stretch justify-between items-center inline-flex">
                    <div className="w-6 h-6 justify-center items-center flex">
                        <GoBackButton />
                    </div>
                    <div className="text-center text-white text-2xl font-normal font-sans leading-snug">나의 채팅방 목록</div>
                    <div className="w-6 h-6" />
                </div>
            </div>

            {/* 채팅방 리스트 */}
            <div className="w-full max-w-[90%] flex flex-col space-y-[15px] justify-start items-stretch mt-[58px] pt-4">
                {isLoading ? (
                    <Loading />
                ) : (
                    chatRooms && chatRooms.length > 0 ? (
                        chatRooms.map((room, index) => (
                            <div
                                key={room.roomId}
                                className="flex h-[71px] px-[20px] py-[10px] justify-between items-center self-stretch rounded-[15px] border border-black bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] cursor-pointer hover:bg-gray-100"
                                onClick={() => handleRoomClick(room)}
                            >
                                {/* 왼쪽 닉네임 + 마지막 채팅 */}
                                <div className="flex flex-col">
                                    <div className="flex flex-row gap-1 mb-[3px]">
                                        <p className="text-[18px] leading-[22px]">{room.nickName}</p>
                                        <p className="text-[15px] leading-[22px] text-[#696A73]">님과의 채팅방</p>
                                    </div>
                                    <p className="font-[Pretendard] text-[12px] text-[#696A73]">{room.lastMessage}</p> 
                                </div>

                                {/* 오른쪽 채팅 숫자 */}
                                {(room.unreadCount ?? 0) > 0 && (
                                    <div className="w-8 h-6 bg-red-500 rounded-xl text-white text-center">
                                        {room.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))
                ) : (
                    <p className="text-center text-gray-500">채팅방이 없습니다.</p>
                )
                )}
            </div>
        </div>
    );
};

export default ChatRoomListView; 
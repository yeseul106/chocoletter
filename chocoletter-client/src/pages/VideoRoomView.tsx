import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import CloseVideoRoomButton from '../components/video-room/button/CloseVideoRoomButton';
import OutVideoRoomModal from '../components/video-room/modal/OutVideoRoomModal';
import LetterInVideoModal from '../components/video-waiting-room/modal/LetterInVideoModal';
import LetterInVideoOpenButton from '../components/video-waiting-room/button/LetterInVideoOpenButton';
import timerIcon from "../assets/images/unboxing/timer.svg";
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { FaVideo } from "react-icons/fa6";
import { FaVideoSlash } from "react-icons/fa";

import { joinSession, leaveSession } from '../utils/openvidu';
import { VideoState } from '../types/openvidu';

const VideoRoomView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionIdInit } = location.state
    const [isTerminate, setIsTerminate] = useState(false);
    const [leftTime, setLeftTime] = useState(61);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined); // 세션 ID 상태
    const didJoin = useRef(false);
    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true);
    const [isOpenLetter, setIsOpenLetter] = useState(false);

    const [videoState, setVideoState] = useState<VideoState>({
        session: undefined,
        mainStreamManager: undefined,
        publisher: undefined,
        subscribers: [],
    }); // 비디오 상태

    const username = "User" + Math.floor(Math.random() * 100); // 사용자 예비 이름
    const onEnd = () => {
        console.log("끝났을 때라도", videoState)
        leaveSession(videoState, setVideoState, setIsTerminate);
    }

    useEffect(() => {
        if (didJoin.current) return;
        didJoin.current = true;

        const initSession = async () => {
            try {
                console.log("세션 생성 중");

                await joinSession(
                    { sessionId: sessionIdInit, username },
                    setSessionId,
                    setVideoState,
                    setIsTerminate,
                );

                await console.log("완료", videoState)
            } catch (err) {
                console.log("join 문제 발생 : ", err)
            }
        }

        initSession();
    }, []);

    useEffect(() => {
        if (leftTime <= 0) {
            onEnd();
        }

        if (isTerminate) return;

        const timerInterval = setInterval(() => {
            setLeftTime((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [leftTime]);

    const muteOrNotHandler = () => {
        videoState.publisher?.publishAudio(!videoState.publisher.stream.audioActive);
        setIsAudio((prev) => !prev)
    }

    const videoOffOrNotHandler = () => {
        videoState.publisher?.publishVideo(!videoState.publisher.stream.videoActive);
        setIsVideo((prev) => !prev)
    }

    const showRTCLetter = () => {
        setIsOpenLetter(true);
    }

    const hideRTCLetter = () => {
        setIsOpenLetter(false);
    }

    return (
        <>
            <div className="w-full min-h-screen flex flex-col justify-center items-center bg-white relative overflow-hidden">
                {isTerminate && (
                    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 backdrop-blur-lg flex justify-center items-center">
                        <OutVideoRoomModal />
                    </div>
                )}
                <LetterInVideoModal
                    isOpen={isOpenLetter}
                    onPush={hideRTCLetter}
                    sender="송신자"
                    receiver="수신자"
                />
                <div className="absolute top-9 right-3 w-8 h-8 z-50">
                    <LetterInVideoOpenButton onPush={showRTCLetter} />
                </div>
                <div className="absolute top-4 left-4 h-[77px] flex flex-col justify-start items-center gap-[23px]">
                    {/* 내 화면 */}
                    <div 
                        id="my-video" 
                        className="absolute top-7 left-4 w-[15dvh] h-[15dvh] rounded-full border border-sky-400 shadow-xl overflow-hidden z-30" 
                    >
                        {videoState.publisher && (
                            <video 
                                autoPlay 
                                className="w-full h-full object-cover"
                                ref={(el) => el && videoState.publisher?.addVideoElement(el)}
                            />
                        )}
                    </div>
                    {/* 타이머 */}
                    <div className="absolute top-[calc(4rem-47%)] left-[calc(1rem+7.5dvh)] w-[clamp(120px,18dvh,140px)] px-[15px] py-[5px] border border-sky-400 bg-chocoletterGiftBoxBg rounded-[17px] justify-end items-center gap-[9px] inline-flex z-20">
                        <div className="w-[18px] h-[18px] relative">
                            <img src={timerIcon} alt="타이머" className="w-[18px] h-[18px] left-0 top-0 absolute" />
                        </div>
                        <div className="text-center text-chocoletterPurpleBold text-2xl font-normal font-sans leading-snug z-20">{leftTime}</div>
                    </div>
                </div>

                {/* 상대방 화면 */}
                <div id="subscriber" className="w-full min-h-screen absolute top-0 left-0">
                    {videoState.subscribers.map((subscriber, index) => (
                        <div key={index} >
                            <video 
                                autoPlay
                                className="w-full h-full object-cover absolute"
                                ref={(el) => el && subscriber.addVideoElement(el)} />
                        </div>
                    ))}
                </div>
                <div className="flex w-full bottom-[10dvh] justify-center gap-x-7 items-center absolute">
                    <div className={`w-[9dvh] h-[9dvh] ${isAudio ? "bg-white" : "bg-black"} rounded-[100px] justify-center items-center gap-2.5 inline-flex z-20`}>
                        <button onClick={muteOrNotHandler} className="w-full h-full aspect-square flex justify-center items-center" >
                            {isAudio ? (
                                <AiOutlineAudio className="w-[50%] h-[50%]" />
                            ) : (
                                <AiOutlineAudioMuted color="white" className="w-[50%] h-[50%]" />
                            )}
                        </button>
                    </div>
                    <div className="w-[9dvh] h-[9dvh] bg-chocoletterWarning rounded-[100px] justify-center items-center gap-2.5 inline-flex z-20">
                        <CloseVideoRoomButton onEnd={onEnd} />
                    </div>
                    <div className={`w-[9dvh] h-[9dvh] ${isVideo ? "bg-white" : "bg-black"} rounded-[100px] justify-center items-center gap-2.5 inline-flex z-20`}>
                        <button onClick={videoOffOrNotHandler} className="w-full h-full aspect-square flex justify-center items-center" >
                            {isVideo ? (
                                <FaVideo className="w-[50%] h-[50%]" />
                            ) : (
                                <FaVideoSlash color="white" className="w-[50%] h-[50%]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default VideoRoomView;
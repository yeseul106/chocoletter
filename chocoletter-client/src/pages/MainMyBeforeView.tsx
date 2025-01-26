import React, { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";

import { availableGiftsAtom, receivedGiftsAtom } from "../atoms/gift/giftAtoms";
import { isFirstLoginAtom } from "../atoms/auth/userAtoms";

import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaHome, FaComments, FaUserCircle } from "react-icons/fa";
import { FiShare, FiCamera } from "react-icons/fi";
import { AiOutlineExclamationCircle } from "react-icons/ai";

import ShareModal from "../components/main/my/before/modal/ShareModal";
import CaptureModal from "../components/main/my/before/modal/CaptureModal";
import FirstLoginTutorialOverlay from "../components/tutorial/FirstLoginTutorialOverlay";
// import { Button } from "../components/common/Button";

// === 공통 Dropdown
import Dropdown from "../components/common/Dropdown";
// === 프로필 드롭다운 내용
import MyPage from "../components/my-page/MyPage";

// === 뷰포트 높이 보정 훅 ===
import useViewportHeight from "../hooks/useViewportHeight";

// 이미지 리소스 예시
import my_gift_box from "../assets/images/giftbox/my_giftbox_main.svg";
import { Button } from "../components/common/Button";
import Backdrop from "../components/common/Backdrop";

const MainMyBeforeView: React.FC = () => {
  const navigate = useNavigate();

  // (1) 주소창 높이 보정 훅
  useViewportHeight();

  // Recoil 상태
  const availableGifts = useRecoilValue(availableGiftsAtom);
  const receivedGifts = useRecoilValue(receivedGiftsAtom);
  const [isFirstLogin, setIsFirstLogin] = useRecoilState(isFirstLoginAtom);

  // 공유 모달
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 캡처 모달
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCaptureModalVisible, setIsCaptureModalVisible] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  // 튜토리얼 아이콘 ref
  const tutorialIconRef = useRef<HTMLButtonElement>(null);

  // 프로필 드롭다운 열림 여부
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 핸들러들
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleCapture = async () => {
    if (captureRef.current) {
      try {
        setIsCaptureModalVisible(true);
        const canvas = await html2canvas(captureRef.current);
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
      } catch (error) {
        toast.error("캡처 실패!");
        setIsCaptureModalVisible(false);
      }
    }
  };

  const handleHome = () => {
    navigate("/");
    toast.info("홈으로 이동!");
  };

  const handleTutorial = () => {
    toast.info("튜토리얼 아이콘 클릭!");
  };

  const handleChat = () => {
    toast.info("채팅방 아이콘 클릭!");
  };

  // 프로필 드롭다운 토글
  const handleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleMyChocolateBox = () => {
    toast.info("내 초콜릿 박스 아이콘 클릭!");
  };

  return (
    <div className="flex justify-center w-full bg-white">
      {/*
        메인 컨테이너:
        h-[calc(var(--vh)*100)]와 min-h-screen 병행
        + 그라디언트 배경
      */}
      <div className="w-full max-w-sm min-h-screen h-[calc(var(--vh)*100)] flex flex-col bg-gradient-to-b from-[#E6F5FF] to-[#F4D3FF]">
        {/** 상단 아이콘 바 (slide-in-bottom 애니메이션) */}
        <div className="mt-6 mb-8 px-6 flex items-center justify-between ">
          <button onClick={handleHome}>
            <FaHome className="w-6 h-6 text-chocoletterPurpleBold" />
          </button>
          <div className="flex items-center gap-7">
            {/**
              튜토리얼 아이콘
              - ref={tutorialIconRef}는 button에 달고
              - 애니메이션은 자식 <span>에만 적용
            */}
            {/**
              튜토리얼 아이콘과 텍스트를 감싸는 div
              ref={tutorialContainerRef}를 부모 div에 할당
            */}
            <div className="flex flex-col items-center">
              <button onClick={handleTutorial} ref={tutorialIconRef}>
                <FaRegCircleQuestion className="w-6 h-6 text-chocoletterPurpleBold" />
              </button>
              {/* "튜토리얼" 텍스트는 오버레이 내에서만 표시되므로 여기서 제거 */}
            </div>

            <button onClick={handleChat}>
              <FaComments className="w-6 h-6 text-chocoletterPurpleBold" />
            </button>
            <button onClick={handleProfile}>
              <FaUserCircle className="w-6 h-6 text-chocoletterPurpleBold" />
            </button>
          </div>
        </div>

        {/** 초콜릿 개봉/받은 정보 카드 (jello-vertical) */}
        <div className="mt-6 mx-auto  bg-white rounded-[30px] border border-black rounded-md w-[258px] jello-vertical">
          <div className="flex flex-col items-center gap-2.5 p-5">
            <div className="text-2xl font-semibold text-center">
              개봉 가능한 🍫 : {availableGifts}개
            </div>
            <div className="text-sm text-[#454451]">지금까지 받은 🍫 : {receivedGifts}개</div>
          </div>
        </div>

        {/** 초콜릿 박스 & 안내 문구 */}
        <div className="mt-8 flex flex-col items-center px-4">
          {/** 캡처 영역 (heartbeat 애니메이션) */}
          <div ref={captureRef} className="heartbeat">
            <button
              onClick={handleMyChocolateBox}
              className="w-[255px] pl-10 rounded-md flex items-center justify-center"
            >
              <img src={my_gift_box} alt="내 선물함" className="p-2 max-h-60" />
            </button>
          </div>

          {/** 안내 문구 (shake-horizontal) */}
          <div className="flex items-start pl-4 gap-1.5 mt-4 w-[225px] shake-horizontal">
            <AiOutlineExclamationCircle className="w-3 h-3" />
            <p className="text-xs text-[#222226] leading-snug">
              개봉 가능한 일반 초콜릿이 있다면
              <br />
              박스를 클릭하여 편지를 읽어볼 수 있어요.
            </p>
          </div>
        </div>

        {/*
          공유 안내 문구를
          "공유하기" 버튼 위에만 나타나도록 수정
          (위아래로 움직이는 애니메이션: shake-vertical)
        */}
        {/*
          공유 안내 문구를
          "공유하기" 버튼 위에만 나타나도록 수정
          (위아래로 움직이는 애니메이션: shake-vertical)
        */}
        <div className="mt-auto mb-24 px-4 flex flex-row items-center gap-2.5">
          {/* 공유하기 버튼을 감싸는 relative div */}
          <div className="relative group">
            {/* 툴팁 */}
            <div className="absolute bottom-full mb-2 left-0 w-max bg-white text-sm text-gray-700 px-3 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              친구에게 공유해 초콜릿을 요청해보세요!
              {/* 화살표 */}
              <div className="absolute top-full left-4 transform -translate-x-1/2 w-0 h-0 border-t-8 border-t-white border-l-8 border-l-transparent border-r-8 border-r-transparent"></div>
            </div>

            {/* 공유하기 버튼 */}
            <Button
              onClick={handleShare}
              className="flex h-14 w-[270px] items-center justify-center gap-2 bg-chocoletterPurpleBold rounded-[15px] border border-black group"
              aria-label="공유하기"
            >
              <FiShare className="w-6 h-6 text-white" />
              <span className="font-display-1 text-white text-xl">공유하기</span>
            </Button>
          </div>

          {/* 캡처 버튼 */}
          <Button
            onClick={handleCapture}
            className="w-[81px] h-14 flex items-center justify-center bg-white border border-gray-300 rounded-md"
            aria-label="캡처"
          >
            <FiCamera className="w-6 h-6" />
          </Button>
        </div>

        {/** 모달 & 튜토리얼 오버레이 */}
        <CaptureModal
          isVisible={isCaptureModalVisible}
          imageSrc={capturedImage}
          onClose={() => setIsCaptureModalVisible(false)}
        />
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
        {isFirstLogin && (
          <FirstLoginTutorialOverlay
            targetRef={tutorialIconRef}
            onClose={() => setIsFirstLogin(false)}
          />
        )}

        {isProfileOpen && (
          <>
            <Backdrop onClick={() => setIsProfileOpen(false)} />
            <MyPage onClose={() => setIsProfileOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
};

export default MainMyBeforeView;

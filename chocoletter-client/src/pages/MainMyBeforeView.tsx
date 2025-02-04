import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useNavigate, useParams } from "react-router-dom";

import { availableGiftsAtom, receivedGiftsAtom } from "../atoms/gift/giftAtoms";
import {
	isFirstLoginAtom,
	giftBoxNumAtom,
	giftBoxIdAtom,
} from "../atoms/auth/userAtoms";

import { FaUserCircle } from "react-icons/fa";
import { AiOutlineExclamationCircle } from "react-icons/ai";

import ShareModal from "../components/main/my/before/modal/ShareModal";
import CaptureModal from "../components/main/my/before/modal/CaptureModal";
import FirstLoginTutorialOverlay from "../components/tutorial/FirstLoginTutorialOverlay";
import ChatModal from "../components/main/my/before/modal/ChatModal";
import TutorialModal from "../components/main/my/before/modal/TutorialModal";

import MyPage from "../components/my-page/MyPage";
import useViewportHeight from "../hooks/useViewportHeight";

import giftbox_before_1 from "../assets/images/giftbox/giftbox_before_1.svg";
import giftbox_before_2 from "../assets/images/giftbox/giftbox_before_2.svg";
import giftbox_before_3 from "../assets/images/giftbox/giftbox_before_3.svg";
import giftbox_before_4 from "../assets/images/giftbox/giftbox_before_4.svg";
import giftbox_before_5 from "../assets/images/giftbox/giftbox_before_5.svg";

import Backdrop from "../components/common/Backdrop";
import share_button from "../assets/images/button/share_button.svg";
import { ImageButton } from "../components/common/ImageButton";
import capture_button from "../assets/images/button/capture_button.svg";
import tutorial_icon from "../assets/images/main/tutorial_icon.svg";
import chat_icon from "../assets/images/main/chat_icon.svg";
import choco_asset from "../assets/images/main/choco_asset.svg";
import tool_tip from "../assets/images/main/tool_tip.svg";
import my_count_background from "../assets/images/main/my_count_background.svg";
import bell_icon from "../assets/images/main/bell_icon.svg";
import calendar_icon from "../assets/images/main/calendar_icon.svg";

import CalendarModal from "../components/main/my/before/modal/CalendarModal";
import { countMyGiftBox } from "../services/giftBoxApi";
import { getAlarmCount } from "../services/alarmApi";

import Notification from "../components/main/my/before/modal/Notification";

// Loading 컴포넌트 import (로딩 중임을 보여줄 오버레이)
import Loading from "../components/common/Loading";

const MainMyBeforeView: React.FC = () => {
	const navigate = useNavigate();

	const { giftBoxId: urlGiftBoxId } = useParams<{ giftBoxId?: string }>();
	const savedGiftBoxId = useRecoilValue(giftBoxIdAtom);
	const giftBoxNum = useRecoilValue(giftBoxNumAtom);

	// 주소창 높이 보정
	useViewportHeight();

	const availableGifts = useRecoilValue(availableGiftsAtom);
	const receivedGifts = useRecoilValue(receivedGiftsAtom);
	const [isFirstLogin, setIsFirstLogin] = useRecoilState(isFirstLoginAtom);

	const setAvailableGifts = useSetRecoilState(availableGiftsAtom);
	const setReceivedGifts = useSetRecoilState(receivedGiftsAtom);

	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [isCaptureModalVisible, setIsCaptureModalVisible] = useState(false);
	const captureRef = useRef<HTMLDivElement>(null);
	const [captureModalKey, setCaptureModalKey] = useState(0);

	const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
	const tutorialIconRef = useRef<HTMLButtonElement>(null);

	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isChatModalOpen, setIsChatModalOpen] = useState(false);
	const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

	// 알림 개수 상태
	const [alarmCount, setAlarmCount] = useState<number>(0);

	// 로딩 상태들 (API 호출 또는 모달 전환 중)
	const [isGiftCountLoading, setIsGiftCountLoading] =
		useState<boolean>(false);
	const [isAlarmCountLoading, setIsAlarmCountLoading] =
		useState<boolean>(false);

	// API 진행 시 로딩 상태가 하나라도 true면 전역 로딩 표시
	const isLoading = isGiftCountLoading || isAlarmCountLoading;

	// URL 파라미터와 Recoil에 저장된 shareCode 검증
	useEffect(() => {
		if (!giftBoxNum) {
			navigate("/select-giftbox");
		}
	}, [giftBoxNum, navigate]);

	useEffect(() => {
		if (urlGiftBoxId && savedGiftBoxId) {
			if (urlGiftBoxId !== savedGiftBoxId) {
				console.warn(
					"URL의 shareCode와 저장된 shareCode가 일치하지 않습니다."
				);
				navigate("/error");
			}
		} else if (!urlGiftBoxId && savedGiftBoxId) {
			navigate(`/main/${savedGiftBoxId}`);
		} else if (urlGiftBoxId && !savedGiftBoxId) {
			console.warn(
				"URL에 shareCode는 있으나 저장된 shareCode가 없습니다."
			);
			navigate("/error");
		} else {
			console.warn("shareCode 정보가 없습니다.");
			navigate("/");
		}
	}, [urlGiftBoxId, savedGiftBoxId, navigate]);

	const giftBoxImages: { [key: number]: string } = {
		1: giftbox_before_1,
		2: giftbox_before_2,
		3: giftbox_before_3,
		4: giftbox_before_4,
		5: giftbox_before_5,
	};

	// 핸들러들
	const handleShare = () => {
		setIsShareModalOpen(true);
	};

	const handleCapture = () => {
		// 캡처 버튼 클릭 시, key 값을 증가시켜 모달을 강제 remount
		setCaptureModalKey((prev) => prev + 1);
		setIsCaptureModalVisible(true);
	};

	const handleTutorial = () => {
		setIsTutorialModalOpen(true);
	};

	const handleCalendar = () => {
		setIsCalendarModalOpen(true);
	};

	// 알림 아이콘 클릭 시 알림 모달을 여는 핸들러 (여기서는 모달 오픈 동작만 처리)
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);

	const handleNotification = () => {
		setAlarmCount(0);
		setIsNotificationOpen(true);
	};

	const handleChat = () => {
		setIsChatModalOpen(true);
	};

	const handleProfile = () => {
		setIsProfileOpen((prev) => !prev);
	};

	const handleMyChocolateBox = () => {
		navigate("/gift-list/before");
	};

	// 선물 개수 API 호출 (로딩 포함)
	useEffect(() => {
		async function fetchGiftCount() {
			setIsGiftCountLoading(true);
			try {
				const { giftCount, canOpenGiftCount } = await countMyGiftBox();
				setAvailableGifts(canOpenGiftCount);
				setReceivedGifts(giftCount);
			} catch (err) {
				console.error("Gift Box count API 실패:", err);
			} finally {
				setIsGiftCountLoading(false);
			}
		}
		fetchGiftCount();
	}, [setAvailableGifts, setReceivedGifts]);

	// 알림 개수 API 호출 (로딩 포함)
	useEffect(() => {
		async function fetchAlarmCount() {
			setIsAlarmCountLoading(true);
			try {
				const count = await getAlarmCount();
				setAlarmCount(count);
			} catch (err) {
				console.error("알림 개수 불러오기 실패:", err);
			} finally {
				setIsAlarmCountLoading(false);
			}
		}
		if (!isNotificationOpen) {
			fetchAlarmCount();
		}
	}, [isNotificationOpen]);

	return (
		<div className="relative">
			{isLoading && (
				// 전역 로딩 오버레이 (API 호출 중)
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
					<Loading />
				</div>
			)}
			<div className="flex justify-center w-full bg-white">
				<div className="w-full max-w-sm min-h-screen h-[calc(var(--vh)*100)] flex flex-col bg-gradient-to-b from-[#E6F5FF] to-[#F4D3FF]">
					{/* 상단 아이콘 바 */}
					<div className="mt-5 ml-6 flex items-center justify-between ">
						<div className="flex items-center gap-6">
							<button
								onClick={handleTutorial}
								ref={tutorialIconRef}
							>
								<img
									src={tutorial_icon}
									className="w-6 h-6"
									alt="tutorial icon"
								/>
							</button>
							<button onClick={handleCalendar}>
								<img
									src={calendar_icon}
									className="w-7 h-7"
									alt="calendar icon"
								/>
							</button>
						</div>

						<div className="flex items-center gap-6 mr-6 relative">
							<div className="relative">
								{alarmCount > 0 && (
									<div className="absolute -top-1 -right-1 bg-red-400 rounded-md h-3 w-[22px] flex items-center justify-center text-white text-xs font-light">
										{alarmCount}
									</div>
								)}
								<button onClick={handleNotification}>
									<img
										src={bell_icon}
										className="w-7 h-7 mt-2"
										alt="notification icon"
									/>
								</button>
							</div>
							<button onClick={handleChat}>
								<img
									src={chat_icon}
									className="w-6 h-6"
									alt="chat icon"
								/>
							</button>
							<button onClick={handleProfile}>
								<FaUserCircle className="w-6 h-6 text-chocoletterPurpleBold hover:text-chocoletterPurple" />
							</button>
						</div>
					</div>
					{/* 초콜릿 개봉/받은 정보 카드 */}
					<div
						className="mt-6 mx-auto relative flex items-center justify-center"
						style={{
							backgroundImage: `url(${my_count_background})`,
							backgroundSize: "cover",
							backgroundPosition: "center",
							width: "75%",
							height: "107px", // 적절한 높이 지정 (필요에 따라 조정)
						}}
					>
						<div className="flex flex-col items-center gap-2.5 px-6 py-4 relative">
							<div className="flex flex-row">
								<div className="text-2xl font-normal text-center text-gray-500">
									개봉 가능한&nbsp;
								</div>
								<img
									src={choco_asset}
									className="w-7 h-7 my-1"
									alt="choco asset"
								/>
								<div className="text-2xl font-normal text-center text-gray-200">
									&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
								</div>
								<div className="text-2xl font-normal text-center text-chocoletterPurple">
									{availableGifts}
								</div>
								<div className="text-2xl font-normal text-center text-gray-500">
									&nbsp;개
								</div>
							</div>
							<div className="flex flex-row">
								<div className="text-sm text-gray-300 text-center">
									지금까지 받은&nbsp;
								</div>
								<img
									src={choco_asset}
									className="h-4 w-4"
									alt="choco asset"
								/>
								<div className="text-sm text-gray-200 text-center">
									&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
								</div>
								<div className="text-sm text-center text-gray-400">
									{receivedGifts}
								</div>
								<div className="text-sm text-gray-300 text-center">
									&nbsp;개
								</div>
							</div>
						</div>
					</div>
					{/* 초콜릿 박스 & 안내 문구 */}
					<div className="mt-8 flex flex-col items-center px-4">
						<div
							ref={captureRef}
							id="capture-target"
							className="heartbeat"
						>
							<button
								onClick={handleMyChocolateBox}
								className="w-[255px] pl-8 flex items-center justify-center"
							>
								<img
									src={giftBoxImages[giftBoxNum]}
									alt={`giftbox_before_${giftBoxNum}`}
									className="p-2 max-h-60"
								/>
							</button>
						</div>
						<div className="flex items-start pl-4 gap-1.5 mt-1 mb-3 w-[225px]">
							<AiOutlineExclamationCircle className="w-3 h-3 text-gray-500" />
							<p className="text-xs text-gray-500 leading-snug">
								개봉 가능한 일반 초콜릿이 있다면
								<br />
								박스를 클릭하여 편지를 읽어볼 수 있어요.
							</p>
						</div>
					</div>
					{/* 공유 및 캡처 버튼 영역 */}
					<div className="mt-14 px-4 flex flex-row items-center gap-2.5">
						<div className="relative group">
							<div className="absolute bottom-full mb-1 left-4 w-max">
								<img src={tool_tip} alt="tooltip" />
							</div>
							<ImageButton
								onClick={handleShare}
								src={share_button}
								className="flex h-14 w-[270px] items-center justify-center hover:bg-chocoletterPurple rounded-[15px] border border-black group"
							/>
						</div>
						<ImageButton
							onClick={handleCapture}
							src={capture_button}
							className="w-[81px] h-14 flex items-center justify-center rounded-[15px] border border-black group"
						/>
					</div>
					{/* 모달 및 오버레이 */}
					<CaptureModal
						key={captureModalKey} // key 추가
						isVisible={isCaptureModalVisible}
						onClose={() => setIsCaptureModalVisible(false)}
						captureTargetId="capture-target"
					/>
					<ShareModal
						isOpen={isShareModalOpen}
						onClose={() => setIsShareModalOpen(false)}
					/>
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
					<ChatModal
						isOpen={isChatModalOpen}
						onClose={() => setIsChatModalOpen(false)}
					/>
					<TutorialModal
						isOpen={isTutorialModalOpen}
						onClose={() => setIsTutorialModalOpen(false)}
					/>
					<CalendarModal
						isOpen={isCalendarModalOpen}
						onClose={() => setIsCalendarModalOpen(false)}
					/>
					<Notification
						isOpen={isNotificationOpen}
						onClose={() => setIsNotificationOpen(false)}
					/>
				</div>
			</div>
		</div>
	);
};

export default MainMyBeforeView;

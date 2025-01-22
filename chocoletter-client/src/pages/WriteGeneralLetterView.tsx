import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoBackButton } from "../components/common/GoBackButton";
import { GoArrowLeft } from "react-icons/go";
import { Button } from "../components/common/Button";
import GeneralLetterForm from "../components/write-letter/GeneralLetterForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import chocoletter_login_view_logo from "../assets/images/logo/chocoletter_login_view_logo.png";

// 편지지 선택 뷰 이후, 자유 형식 편지지 작성 화면
const WriteGeneralLetterView = () => {
    const [nickname, setNickname] = useState("");
    const [content, setContent] = useState("");
    const [contentLength, setContentLength] = useState(0);
    const navigate = useNavigate();

    const goBackMainMyEvent = () => {
        if (contentLength < 10) {
            // 글자 수가 10글자 미만일 경우 toast 알림
            toast.error("메세지는 최소 10글자 이상 작성해야 합니다!", {
                position: "top-center",
                autoClose: 2000,
            });
            return; // 페이지 이동 방지
        }

        navigate("/selectgift");
    };


	return (
		<div className="relative flex flex-col items-center h-screen">
             {/* 뒤로 가기 버튼 */}
            <GoBackButton icon={<GoArrowLeft />} altText="뒤로가기 버튼" />
            
            <div className="absolute mt-24">
                {/* 로고 이미지  */}
                <div className="h-1/3 flex justify-center items-center mb-12">
                    <img
                        src={chocoletter_login_view_logo}
                        alt="chocoletter_login_view_logo"
                        className="max-h-40"
                    />
                </div>
                {/* GeneralLetterForm */}
                <GeneralLetterForm
                    setNickname={setNickname}
                    setContent={setContent}
                />

                {/* 편지 작성 완료 버튼 - 초콜릿 선택 화면으로 이동 */}
                <div className="mb-8 text-center">
                    <Button
                        onClick={goBackMainMyEvent}
                        className="w-[300px] h-[50px] px-1 mb-4" 
                    >
                        편지 작성 완료!✏️
                    </Button>
                </div>
            </div>
		</div>
	);
};

export default WriteGeneralLetterView;

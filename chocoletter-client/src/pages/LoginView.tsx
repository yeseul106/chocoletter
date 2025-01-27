import { Link } from "react-router";
import chocoletter_login_view_logo from "../assets/images/logo/chocoletter_login_view_logo.svg";
import login_view_service_title from "../assets/images/logo/login_view_service_title.svg";
import KakaoLoginButton from "../components/login/button/KakaoLoginButton";
import Onboarding from "../components/onboarding/Onboarding";
import { Button } from "../components/common/Button";

function LoginView() {
  return (
    <div className="h-[calc((var(--vh, 1vh) * 100)-8rem)] flex flex-col items-center justify-center px-4">
      {/* 테스트 페이지 이동 */}
      <div className="w-full flex justify-end mt-1">
        <Link to="/test">
          <Button className="text-xs sm:text-sm text-blue-500 hover:underline px-2 py-1">
            테스트
          </Button>
        </Link>
      </div>

      {/* 로고 이미지 */}
      <div className="flex justify-center items-center mt-8 mb-4">
        <img
          src={chocoletter_login_view_logo}
          alt="chocoletter_login_view_logo"
          className="pl-10 max-h-60"
        />
      </div>

      {/* 서비스 타이틀 및 서브타이틀 */}
      <div className="flex flex-col items-center mb-10">
        <img src={login_view_service_title} alt="login_view_service_title" className="" />
        {/* <h1 className="text-gray-600 font-extrabold">chocoletter</h1> */}
      </div>

      {/* 로그인 버튼들 */}
      <div className="flex flex-col items-center w-full mb-6 max-w-full">
        <KakaoLoginButton />
      </div>

      {/* 온보딩 컴포넌트 */}
      <div className="w-full max-w-sm">
        <Onboarding />
      </div>
    </div>
  );
}

export default LoginView;

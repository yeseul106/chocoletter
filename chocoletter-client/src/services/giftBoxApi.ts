import baseAxios from "axios";

// giftAPI 인스턴스 설정 
export const axios = baseAxios.create({
    baseURL: import.meta.env.VITE_API_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

function getAccessToken(): string | null {
    return localStorage.getItem("accessToken"); 
}

// 선물 카운트 사용
export async function disPreviewCoin() {
    const accessToken = await getAccessToken();
    console.log("이거 뭐여요?", accessToken);

    try {
        if (!accessToken) {
            throw new Error("AccessToken is missing");
        }

        const res = await axios.patch(`/api/v1/gift-box/preview`,{}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = res.data;
        console.log("카운트 사용 성공!", data);
        return data;
    } catch (err) {
        console.error("usePreviewCoin API 호출 중 에러 발생:", err);
        return null;
    }
}

// 내 선물 개수 조회
export async function countMyGiftBox() {
    const accessToken = getAccessToken();
    console.log("이거 뭐예요?", accessToken);

    try {

        if (!accessToken) {
            throw new Error("AccessToken is missing");
        }

        const res = await axios.get(`/api/v1/gift-box/count`,{
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // key: giftCount, canOpenGiftCount
        const data = res.data;
        console.log("개수 조회 성공 :", data);
        return data;
    } catch (err) {
        console.error("usePreviewCoin API 호출 중 에러 발생:", err);
        return err;
    }
}
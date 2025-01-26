import baseAxios from "axios";

// giftAPI 인스턴스 설정 
export const axios = baseAxios.create({
    baseURL: import.meta.env.VITE_API_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
      },
    withCredentials: true,
  });

// AccessToken 가져오기
const accessToken = '123' //  나중에 삭제!!
// function getAccessToken(): string | null {
//     return localStorage.getItem("accessToken"); 
// }


// invitation unboxing 시간 가져오기
export async function getNotFixedUnboxingTime(giftId: number) {
    try {
        // const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error("AccessToken is missing");
        }

        const res = await axios.get(`/api/v1/gift/${giftId}/unboxing/invitation`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = res.data;
        console.log("unboxing time:", data);
        return data;
    } catch (err) {
        console.error("getNotFixedUnboxingTime API 호출 중 에러 발생:", err);
        return null;
    }
  }


// unboxing 전체 일정 조회
  
export async function getUnboxingSchedule(giftBoxId: number) {
    try {
        // const accessToken = getAccessToken();

        if (!accessToken) {
            throw new Error("AccessToken is missing");
        }

        const res = await axios.get(`/api/v1/gift-box/${giftBoxId}/unboxing/schedule`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = res.data;
        // console.log("unboxing schedule:", data);
        return data;
    } catch (err) {
        console.error("getUnboxingSchedule API 호출 중 에러 발생:", err);
        return null;
    }
  }

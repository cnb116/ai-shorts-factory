import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export const saveImageToStorage = async (imageUrl, projectId) => {
    try {
        // 1. 외부 이미지 URL을 Blob으로 변환
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // 2. 저장할 경로 설정 (projects/프로젝트ID/thumbnail.jpg)
        const storageRef = ref(storage, `projects/${projectId}/thumbnail.jpg`);

        // 3. 업로드
        await uploadBytes(storageRef, blob);

        // 4. 영구 다운로드 URL 획득
        const downloadURL = await getDownloadURL(storageRef);

        console.log("이미지 영구 저장 완료:", downloadURL);
        return downloadURL;

    } catch (error) {
        console.error("이미지 저장 중 오류 발생:", error);
        // 실패 시 원본 URL이라도 반환하여 깨짐 방지
        return imageUrl;
    }
};

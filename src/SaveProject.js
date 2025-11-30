import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { saveImageToStorage } from './utils/imageUploader';

export const saveToCloud = async (user, productInput, aiJsonResult) => {
    try {
        // 1. 문서 ID 미리 생성 (이미지 저장 경로에 쓰기 위해)
        const newDocRef = doc(collection(db, "shorts_projects"));
        const projectId = newDocRef.id;

        // 2. HTML에서 이미지 URL 추출
        let finalImageUrl = '';
        const imgMatch = aiJsonResult.html_code?.match(/src="(https:\/\/image\.pollinations\.ai\/prompt\/[^"]+)"/);
        const tempImageUrl = imgMatch ? imgMatch[1] : null;

        // 3. 이미지 영구 저장 (Storage)
        if (tempImageUrl) {
            console.log("이미지 업로드 시작...", tempImageUrl);
            finalImageUrl = await saveImageToStorage(tempImageUrl, projectId);
        }

        // 4. Firestore에 데이터 저장
        await setDoc(newDocRef, {
            ownerId: user?.uid || 'anonymous',
            isPublic: false,
            status: "completed",

            inputData: {
                productName: productInput.name,
                rawDescription: productInput.desc
            },

            aiOutput: aiJsonResult,

            assets: {
                generatedImageUrl: finalImageUrl, // 영구 저장된 URL
                audioSettings: {
                    bgmType: 'default', // 추후 연동
                    ttsVoice: 'ko-KR'
                }
            },

            monetization: {
                affiliateLink: productInput.link
            },

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log("프로젝트가 안전하게 저장되었습니다! ID: ", projectId);
        return projectId;

    } catch (e) {
        console.error("클라우드 저장 실패: ", e);
        throw e;
    }
};

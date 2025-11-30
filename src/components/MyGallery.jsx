import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const MyGallery = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;

            try {
                // 쿼리: 내 ID와 일치하는 문서를 최신순으로 가져오기
                const q = query(
                    collection(db, "shorts_projects"),
                    where("ownerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const projectList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setProjects(projectList);
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user]);

    if (loading) return <div className="p-8 text-center text-gray-400">로딩 중... 뇌세포 깨우는 중... 🧠</div>;

    if (!user) return <div className="p-8 text-center text-gray-400">로그인이 필요합니다.</div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {projects.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">
                    <p>아직 생성된 콘텐츠가 없습니다. 첫 쇼츠를 만들어보세요!</p>
                </div>
            ) : (
                projects.map((proj) => (
                    <div key={proj.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all shadow-lg">
                        {/* 2단계에서 저장한 영구 이미지 URL 사용 */}
                        <div className="relative aspect-[9/16] overflow-hidden">
                            <img
                                src={proj.assets?.generatedImageUrl || "https://via.placeholder.com/150x266?text=No+Image"}
                                alt={proj.inputData?.productName}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <span className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase
                    ${proj.status === 'completed' ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}>
                                {proj.status}
                            </span>
                        </div>
                        <div className="p-3">
                            <h3 className="text-sm font-bold text-white truncate mb-1">{proj.inputData?.productName || "제목 없음"}</h3>
                            <p className="text-xs text-gray-400">{proj.createdAt?.toDate().toLocaleDateString()}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyGallery;

import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './Profile.css';

const Profile = ({ onNavigate }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            alert("로그인에 실패했습니다.");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("로그아웃 되었습니다.");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <div className="profile-container justify-center items-center">로딩 중...</div>;

    if (!user) {
        return (
            <div className="profile-container justify-center items-center text-center">
                <div className="login-section">
                    <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
                    <p className="text-gray-400 mb-8">AI 쇼츠 메이커의 모든 기능을 이용하려면<br />로그인해주세요.</p>
                    <button
                        onClick={handleLogin}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-gray-200 transition-colors"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                        Google로 계속하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1 className="text-xl font-bold">마이 페이지</h1>
                <button className="settings-btn" onClick={() => onNavigate('settings')}>⚙️</button>
            </header>

            <div className="profile-content">
                {/* Profile Card */}
                <div className="profile-card">
                    <div className="avatar-wrapper">
                        <img src={user.photoURL || "https://via.placeholder.com/100"} alt="Profile" className="profile-avatar" />
                        <span className="tier-badge tier-pro">FREE</span>
                    </div>
                    <h2 className="profile-name">{user.displayName}</h2>
                    <p className="profile-email">{user.email}</p>
                    <p className="profile-joined">가입일: {formatDate(user.metadata.creationTime)}</p>
                </div>

                {/* Stats Grid (Mock Data for now) */}
                <div className="stats-grid">
                    <div className="stat-item" onClick={() => onNavigate('my-projects')} style={{ cursor: 'pointer' }}>
                        <span className="stat-value">0</span>
                        <span className="stat-label">총 프로젝트</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">0</span>
                        <span className="stat-label">발행 완료</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">0</span>
                        <span className="stat-label">총 조회수</span>
                    </div>
                </div>

                {/* Menu List */}
                <div className="menu-list">
                    <button className="menu-item" onClick={() => onNavigate('my-projects')}>
                        <span>📁 내 프로젝트 관리</span>
                        <span className="arrow">›</span>
                    </button>
                    <button className="menu-item" onClick={() => onNavigate('settings')}>
                        <span>🔔 알림 설정</span>
                        <span className="arrow">›</span>
                    </button>
                    <button className="menu-item">
                        <span>❓ 고객 센터</span>
                        <span className="arrow">›</span>
                    </button>
                </div>

                <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
            </div>
        </div>
    );
};

export default Profile;

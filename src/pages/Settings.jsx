import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ onBack }) => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);

    return (
        <div className="settings-container">
            <header className="settings-header">
                <button onClick={onBack} className="back-btn">⬅️</button>
                <h1 className="text-xl font-bold">설정</h1>
            </header>

            {/* App Settings */}
            <div className="settings-section">
                <h3 className="section-title">앱 설정</h3>

                <div className="setting-item">
                    <div>
                        <div className="setting-label">다크 모드</div>
                        <div className="setting-desc">어두운 테마를 사용합니다.</div>
                    </div>
                    <label className="toggle-switch">
                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <div>
                        <div className="setting-label">효과음</div>
                        <div className="setting-desc">버튼 클릭 및 알림 소리</div>
                    </div>
                    <label className="toggle-switch">
                        <input type="checkbox" checked={soundEffects} onChange={() => setSoundEffects(!soundEffects)} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="settings-section">
                <h3 className="section-title">알림</h3>

                <div className="setting-item">
                    <div>
                        <div className="setting-label">푸시 알림</div>
                        <div className="setting-desc">새로운 기능 및 업데이트 소식 받기</div>
                    </div>
                    <label className="toggle-switch">
                        <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* Account Settings */}
            <div className="settings-section">
                <h3 className="section-title">계정 정보</h3>
                <div className="account-info">
                    <div className="info-row">
                        <span className="info-label">이메일</span>
                        <span className="info-value">vibe_coder@gmail.com</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">요금제</span>
                        <span className="info-value text-blue-400">PRO Plan</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">버전</span>
                        <span className="info-value">v1.2.0</span>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
                <button className="delete-account-btn" onClick={() => alert('정말 탈퇴하시겠습니까? (기능 미구현)')}>
                    회원 탈퇴
                </button>
            </div>
        </div>
    );
};

export default Settings;

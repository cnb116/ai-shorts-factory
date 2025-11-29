import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
    const [clickCount, setClickCount] = useState(0);

    const handleSignUp = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        console.log(`Sign Up Button Clicked: ${newCount}`);

        // Visual feedback
        if (newCount === 10) {
            alert('테스트 완료: 회원가입 버튼을 10번 클릭했습니다!');
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profile</h1>
            </div>
            <div className="profile-content">
                <div className="login-section">
                    <p>로그인이 필요합니다.</p>
                    <button className="signup-btn" onClick={handleSignUp}>
                        회원가입 (Sign Up)
                    </button>
                    <p className="click-counter">Click Count: {clickCount}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;

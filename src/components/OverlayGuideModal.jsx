import React, { useState } from 'react';
import './OverlayGuideModal.css';

const OverlayGuideModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overlay');

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'overlay':
                return (
                    <div className="guide-section">
                        <h3>🖼️ 투명 레이어 활용 (추천)</h3>
                        <p className="section-desc">내 영상 위에 <strong>상품 정보(이름, 가격)</strong>만 깔끔하게 얹고 싶을 때 사용하세요.</p>

                        <div className="guide-steps">
                            <div className="guide-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>배경 제거 (크로마키)</h4>
                                    <p>화면 상단의 <strong>테마 버튼(🌙/☀️)</strong>을 눌러 <strong>녹색 화면(🟩)</strong>으로 바꿔주세요. 배경이 녹색으로 변하면 준비 끝!</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>화면 녹화</h4>
                                    <p>PC나 폰의 <strong>화면 녹화 기능</strong>을 켜고, 상품 정보가 잘 보이게 10초 정도 녹화하세요.</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>영상 편집 (PIP)</h4>
                                    <p>편집 앱(캡컷 등)에서 내 영상 위에 녹화한 영상을 올리고, <strong>'크로마키'</strong> 기능을 켜서 녹색을 지우면 글자만 남습니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'intro':
                return (
                    <div className="guide-section">
                        <h3>📹 고품질 인트로 만들기</h3>
                        <p className="section-desc">쇼츠 시작 부분에 <strong>"오늘 소개할 상품은?"</strong> 하고 짠! 보여줄 때 쓰세요.</p>

                        <div className="guide-steps">
                            <div className="guide-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>분위기 맞추기</h4>
                                    <p>상단 <strong>테마 버튼(🌙/☀️)</strong>을 눌러 영상 분위기에 맞는 배경색(검정/흰색)을 고르세요.</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>주목시키기</h4>
                                    <p>상단 <strong>반짝이 버튼(✨)</strong>을 누르면 상품명이 깜빡거립니다. 시선을 확 끌 수 있어요!</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>편집 팁</h4>
                                    <p>이 화면을 3초 정도 녹화해서 영상 맨 앞에 <strong>전체 화면</strong>으로 넣으세요. 제목 자막을 따로 달 필요가 없습니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'ux':
                return (
                    <div className="guide-section">
                        <h3>🖱️ 구매 과정 보여주기</h3>
                        <p className="section-desc">"이거 사는 거 진짜 쉬워요!"라고 보여줘서 <strong>구매를 유도</strong>하는 방법입니다.</p>

                        <div className="guide-steps">
                            <div className="guide-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>상황 연출</h4>
                                    <p>화면 녹화를 켠 상태에서, 마우스나 손가락으로 <strong>'바로 구매하기' 버튼</strong>을 직접 눌러보세요.</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>쇼츠에 넣기</h4>
                                    <p>이 장면을 영상 중간에 넣고 <strong>"버튼만 누르면 바로 이동!"</strong> 같은 자막을 달아주세요.</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>효과</h4>
                                    <p>고객이 "아, 복잡하지 않구나"라고 느껴서 구매 버튼을 누를 확률이 올라갑니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="guide-modal-overlay" onClick={onClose}>
            <div className="guide-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <h2>쇼츠 제작 꿀팁 🍯</h2>

                <div className="guide-tabs">
                    <button
                        className={`guide-tab ${activeTab === 'overlay' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overlay')}
                    >
                        🖼️ 투명 레이어
                    </button>
                    <button
                        className={`guide-tab ${activeTab === 'intro' ? 'active' : ''}`}
                        onClick={() => setActiveTab('intro')}
                    >
                        📹 인트로
                    </button>
                    <button
                        className={`guide-tab ${activeTab === 'ux' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ux')}
                    >
                        🖱️ UX 시연
                    </button>
                </div>

                <div className="guide-body">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default OverlayGuideModal;

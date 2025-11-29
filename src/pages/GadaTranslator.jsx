import React, { useState } from 'react';
import './GadaTranslator.css';

const GadaTranslator = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState('여기에 뜻이 나옵니다');
    const [isFound, setIsFound] = useState(false);

    const dictionary = {
        "단도리": "준비, 채비, 단속",
        "나라시": "평탄화, 땅 고르기",
        "샷보드": "거푸집 지지대",
        "공구리": "콘크리트 타설",
        "야리끼리": "할당량 도급 (끝나면 퇴근)",
        "시마이": "작업 종료, 마감",
        "반생": "굵은 철선",
        "데모도": "보조공, 조수",
        "곰방": "자재 운반",
        "가베": "벽",
        "바라시": "해체, 뜯어내기",
        "노가다": "막일, 육체노동"
    };

    const handleSearch = (e) => {
        const input = e.target.value;
        setSearchTerm(input);

        if (dictionary[input]) {
            setResult(dictionary[input]);
            setIsFound(true);
        } else {
            setResult("사전에 없는 단어입니다");
            setIsFound(false);
        }
    };

    return (
        <div className="gada-container">
            <button onClick={onBack} className="gada-back-btn">← 뒤로가기</button>
            <h1 className="gada-title">🔨 현장 용어 번역기</h1>
            <input
                type="text"
                className="gada-input"
                placeholder="예: 단도리, 나라시, 공구리..."
                value={searchTerm}
                onChange={handleSearch}
            />
            <div className={`gada-result ${isFound ? 'found' : ''}`}>
                {result}
            </div>
            <div className="gada-footer">Created by SONESON</div>
        </div>
    );
};

export default GadaTranslator;

import React, { useState } from 'react';
import './GadaTranslator.css';
import { constructionTerms } from '../data/constructionTerms';

const GadaTranslator = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState('여기에 뜻이 나옵니다');
    const [isFound, setIsFound] = useState(false);

    const dictionary = constructionTerms;

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
            <p style={{ textAlign: 'center', color: '#888', marginBottom: '20px' }}>
                현재 {Object.keys(dictionary).length}개의 용어가 등록되어 있습니다
            </p>
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

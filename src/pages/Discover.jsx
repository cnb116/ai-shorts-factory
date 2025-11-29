import { useState } from 'react';
import { mockVideos } from '../data/mockVideos';
import './Discover.css';

const Discover = ({ onVideoSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = mockVideos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="discover-container">
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search products, trends..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="video-grid">
                {filteredVideos.map((video) => (
                    <div
                        key={video.id}
                        className="grid-item"
                        onClick={() => onVideoSelect(video.id)}
                    >
                        <video
                            src={video.url}
                            className="grid-video-thumb"
                            muted
                            playsInline
                            onMouseOver={e => e.target.play()}
                            onMouseOut={e => {
                                e.target.pause();
                                e.target.currentTime = 0;
                            }}
                        />
                        <div className="grid-overlay">
                            <span className="grid-views">▶ {video.likes}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Discover;

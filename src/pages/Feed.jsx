import { useState, useEffect, useRef } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import './Feed.css';

const Feed = ({ isHighlightActive, videos }) => {
    const [activeVideoId, setActiveVideoId] = useState(videos && videos.length > 0 ? videos[0].id : null);
    const observer = useRef();

    // Update active video if videos change (e.g. new upload)
    useEffect(() => {
        if (videos && videos.length > 0 && !activeVideoId) {
            setActiveVideoId(videos[0].id);
        }
    }, [videos, activeVideoId]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6
        };

        observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const videoId = Number(entry.target.dataset.id);
                    setActiveVideoId(videoId);
                }
            });
        }, options);

        const videoElements = document.querySelectorAll('.video-container');
        videoElements.forEach((el) => observer.current.observe(el));

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [videos]); // Re-run observer when videos change

    if (!videos || videos.length === 0) return <div className="feed-empty">No videos yet</div>;

    return (
        <div className="feed-container">
            {videos.map((video) => (
                <VideoPlayer
                    key={video.id}
                    video={video}
                    isActive={activeVideoId === video.id}
                    isHighlightActive={isHighlightActive}
                />
            ))}
        </div>
    );
};

export default Feed;

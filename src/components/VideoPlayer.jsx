import { useRef, useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { trackEvent } from '../utils/analytics';
import './VideoPlayer.css';

const VideoPlayer = ({ video, isActive, isHighlightActive }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(video.likes);
    const [showCopiedToast, setShowCopiedToast] = useState(false);

    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        if (isActive && !isModalOpen) {
            videoRef.current.currentTime = 0;
            // Autoplay with mute is usually allowed by browsers
            videoRef.current.muted = true;
            videoRef.current.play().catch(error => console.log("Autoplay prevented", error));
            setIsPlaying(true);
            setIsMuted(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, isModalOpen]);

    const togglePlay = () => {
        if (isModalOpen) return;

        // If muted, first click just unmutes
        if (isMuted) {
            videoRef.current.muted = false;
            setIsMuted(false);
            // Ensure it's playing
            if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
            }
            return;
        }

        // Standard toggle
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleLike = (e) => {
        e.stopPropagation();
        if (isLiked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    const openModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(true);
        videoRef.current.pause();
        setIsPlaying(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (isActive) {
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(video.product.name).then(() => {
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 2000);
        });
    };

    const handleBuyClick = (e) => {
        e.stopPropagation();
        trackEvent('buy_click', {
            productId: video.product.id,
            productName: video.product.name
        });
        const productUrl = `https://your-shop-link.com/${video.product.id}`;
        window.open(productUrl, '_blank');
    };

    return (
        <div className="video-container">
            <video
                ref={videoRef}
                className="video-element"
                src={video.url}
                loop
                playsInline
                onClick={togglePlay}
            />



            <div className={`video-overlay ${isModalOpen ? 'hidden' : ''}`}>
                {isMuted && (
                    <div className="mute-indicator">
                        🔇 Tap to Unmute
                    </div>
                )}

                <div className="video-info">
                    <div className="user-info">
                        <img src={video.user.avatar} alt={video.user.name} className="user-avatar" />
                        <span className="username">@{video.user.name}</span>
                    </div>
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-desc">{video.description}</p>
                </div>

                <div className="right-actions">
                    <div className="action-item" onClick={toggleLike}>
                        <span className="icon" style={{ color: isLiked ? '#ef4444' : 'white', transition: 'color 0.2s' }}>
                            {isLiked ? '❤️' : '🤍'}
                        </span>
                        <span className="count">{likeCount}</span>
                    </div>
                    <div className="action-item">
                        <span className="icon">💬</span>
                        <span className="count">{video.comments}</span>
                    </div>
                    <div className="action-item">
                        <span className="icon">🔗</span>
                        <span className="count">Share</span>
                    </div>
                </div>

                <div className={`product-card ${isHighlightActive ? 'highlight-active' : ''}`} onClick={openModal}>
                    <img src={video.product.image} alt={video.product.name} className="product-thumb" />
                    <div className="product-details">
                        {video.product.promoText && (
                            <span className="promo-text-inline">
                                {video.product.promoText}
                            </span>
                        )}
                        <p
                            className="product-name"
                            onClick={handleCopy}
                            title="Click to copy"
                        >
                            {video.product.name}
                        </p>
                        <p className="product-price">{video.product.price}</p>
                    </div>
                    <button className="shop-btn" onClick={handleBuyClick}>바로 구매하기</button>

                    {showCopiedToast && (
                        <div className="copied-toast">
                            복사됨! ✅
                        </div>
                    )}
                </div>
            </div>

            <ProductModal
                product={video.product}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
};

export default VideoPlayer;

import { useState, useEffect } from 'react';
import './ProductModal.css';

const ProductModal = ({ product, isOpen, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [selectedSize, setSelectedSize] = useState('S');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Match animation duration
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`modal-content ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-handle"></div>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="modal-product-img" />
                </div>

                <div className="modal-body">
                    <div className="modal-info-row">
                        <h2 className="modal-title">{product.name}</h2>
                        <span className="modal-price">{product.price}</span>
                    </div>

                    <p className="modal-description">
                        This is a premium quality {product.name} perfect for your style.
                        Limited stock available. Order now to get it delivered by tomorrow!
                    </p>

                    <div className="modal-options">
                        <div className="option-group">
                            <label>Size</label>
                            <div className="option-chips">
                                {['S', 'M', 'L'].map((size) => (
                                    <span
                                        key={size}
                                        className={`chip ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="buy-now-btn">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;

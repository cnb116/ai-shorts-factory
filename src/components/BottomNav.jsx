import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange, onOpenCreate }) => {
    return (
        <nav className="bottom-nav">
            <div
                className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => onTabChange('home')}
            >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">Home</span>
            </div>
            <div
                className="nav-item"
                onClick={() => window.open('/shorts-physics-tool.html', '_blank')}
            >
                <span className="nav-icon">🛠️</span>
                <span className="nav-label">Studio</span>
            </div>
            <div className="nav-item center-btn" onClick={onOpenCreate}>
                <div className="plus-btn">+</div>
            </div>
            <div className="nav-item">
                <span className="nav-icon">🛒</span>
                <span className="nav-label">Cart</span>
            </div>
            <div
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => onTabChange('profile')}
            >
                <span className="nav-icon">👤</span>
                <span className="nav-label">Profile</span>
            </div>
        </nav>
    );
};

export default BottomNav;

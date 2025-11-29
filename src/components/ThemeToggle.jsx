import './ThemeToggle.css';

const ThemeToggle = ({ currentTheme, onThemeChange }) => {
    const themes = [
        { id: 'dark', icon: '🌙', label: 'Dark' },
        { id: 'light', icon: '☀️', label: 'Light' },
        { id: 'green', icon: '🟩', label: 'Green Screen' }
    ];

    const nextTheme = () => {
        const currentIndex = themes.findIndex(t => t.id === currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        onThemeChange(themes[nextIndex].id);
    };

    const currentIcon = themes.find(t => t.id === currentTheme)?.icon;

    return (
        <button className="control-btn theme-toggle-btn" onClick={nextTheme} title="Switch Theme">
            {currentIcon}
        </button>
    );
};

export default ThemeToggle;

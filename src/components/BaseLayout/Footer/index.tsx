import { useState } from 'react';
import { S } from './Footer.styles';

interface Props {
    type?: 'default' | 'light';
    handleBackgroundColorChange: () => void;
    nextBackgroundColor: string;
}

function getTextColor(backgroundColor: string): string {
    if (!backgroundColor.startsWith('#')) return '#4A4A4A';
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6? '#4A4A4A': '#D3D3D3';
}

export function AppFooter({ type = 'default', handleBackgroundColorChange, nextBackgroundColor }: Props) {
    const [isClicked, setIsClicked] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const textColor = getTextColor(nextBackgroundColor);

    const handleCloseSurvey = () => {
        setShowSurvey(false);
    };

    return (
        <S.Footer className={`_${type}`} style={{ position: 'relative' }}>
            <S.Content
                onClick={() => {
                    setIsClicked(true);
                    handleBackgroundColorChange();
                }}
                style={{
                    cursor: 'pointer',
                    padding: '1px 10px',
                    borderRadius: '6px',
                    backgroundColor: isClicked? nextBackgroundColor: 'rgba(255, 255, 255, 0)',
                    color: textColor,
                    fontSize: '16px',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    display: 'inline-block',
                    userSelect: 'none',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = nextBackgroundColor)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0)')}
            >
                MoxieLink
            </S.Content>

            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: nextBackgroundColor,
                    color: getTextColor(nextBackgroundColor),
                    padding: '10px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                }}
                onClick={() => setShowSurvey(!showSurvey)}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                Feedback
            </div>

            {showSurvey && (
                <div style={{
                    position: 'fixed',  // Changed to 'fixed'
                    bottom: '70px',   // Adjust as needed
                    right: '20px',    // Adjust as needed
                    width: '300px',
                    height: '400px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    background: 'white',
                    zIndex: 3,          // Ensure it's above the button
                }}>
                    <div style={{ position: 'absolute', top: '5px', right: '5px', cursor: 'pointer', zIndex: 1 }} onClick={handleCloseSurvey}>
                        <span style={{ fontSize: '20px', color: 'gray' }}>x</span>
                    </div>
                    <iframe
                        src="https://app.formbricks.com/s/cm7dto8or0000kz03kzzt7dfu"
                        frameBorder="0"
                        style={{ width: '100%', height: '100%', border: '0' }}
                    />
                </div>
            )}
        </S.Footer>
    );
}
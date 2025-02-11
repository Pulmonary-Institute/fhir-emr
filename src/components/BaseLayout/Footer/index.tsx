import { S } from './Footer.styles';

interface Props {
    type?: 'default' | 'light';
    handleBackgroundColorChange: () => void;
    nextBackgroundColor: string;
}

// Function to determine text color based on background brightness
function getTextColor(backgroundColor: string): string {
    if (!backgroundColor.startsWith('#')) return '#4A4A4A'; // Default to dark gray

    // Convert HEX to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance (per WCAG standard)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // If luminance is high, use dark gray (#4A4A4A), otherwise use light gray (#D3D3D3)
    return luminance > 0.6 ? '#4A4A4A' : '#D3D3D3';
}

export function AppFooter({ type = 'default', handleBackgroundColorChange, nextBackgroundColor }: Props) {
    const textColor = getTextColor(nextBackgroundColor); // Get dynamic text color

    return (
        <S.Footer className={`_${type}`}>
            <S.Content
                onClick={handleBackgroundColorChange}
                style={{
                    cursor: 'pointer',
                    padding: '1px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    color: textColor, // Corrected dynamic text color
                    fontSize: '16px',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    display: 'inline-block',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = nextBackgroundColor)}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0)';
                    e.currentTarget.style.color = textColor;
                }}
            >
                MoxieLink
            </S.Content>
        </S.Footer>
    );
}

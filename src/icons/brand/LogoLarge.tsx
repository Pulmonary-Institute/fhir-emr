// components/Logo.tsx
import React from 'react';

import logo from '../../images/vertical-logo.svg';

interface LogoProps {
    height: number;
}

export const LogoLarge: React.FC<LogoProps> = ({ height }) => {
    return (
        <div>
            <img src={logo} alt="Logo" width={'100%'} height={height} />
        </div>
    );
};

export default LogoLarge;

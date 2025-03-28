// components/Logo.tsx
import React from 'react';

import logo from '../../images/sm-logo.svg'

interface LogoProps {
  width: number;
  height: number;
}

export const LogoSmall: React.FC<LogoProps> = ({ width, height }) => {
  return (
    <div>
      <img
        src={logo} 
        alt="Logo" 
        width={width}
        height={height}
      />
    </div>
  );
};

export default LogoSmall;

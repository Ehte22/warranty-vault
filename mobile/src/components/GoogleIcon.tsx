import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Use } from 'react-native-svg';

const GoogleIcon = ({ width = 20, height = 20 }) => (
    <Svg width={width} height={height} viewBox="0 0 46 46">
        <Defs>
            <Path
                id="a"
                d="M44.5 20H24v6h11.8C34.3 31.5 29.7 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l4.9-4.9C32.6 7.1 28.6 5.5 24 5.5 13.8 5.5 5.5 13.8 5.5 24S13.8 42.5 24 42.5 42.5 34.2 42.5 24c0-1.3-.1-2-.3-3z"
            />
        </Defs>
        <ClipPath id="b">
            <Use href="#a" />
        </ClipPath>
        <G clipPath="url(#b)">
            <Path fill="#FBBC05" d="M0 37V11l17 13z" />
            <Path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
            <Path fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
            <Path fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
        </G>
    </Svg>
);

export default GoogleIcon;

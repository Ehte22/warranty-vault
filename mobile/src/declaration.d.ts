// declarations.d.ts
declare module '*.svg' {
    import * as React from 'react';
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
}

declare module 'react-native-vector-icons/MaterialIcons'
declare module 'react-native-razorpay'
declare module 'react-native-vector-icons/MaterialCommunityIcons'
declare module 'react-native-vector-icons/FontAwesome6'
declare module 'react-native-onboarding-swiper'

import { ReactNode } from 'react';
import React, { useState, useEffect } from 'react'; // Import useRef

import { S } from './BaseLayout.styles';
import { AppFooter } from './Footer';
import { AppSidebar } from './Sidebar';
import { AppTabBar } from './TabBar';

interface Props {
    children: ReactNode;
    style?: React.CSSProperties;
    className?: string | undefined;
}

export function BaseLayout({ children, style, className }: Props) {
    const [backgroundColor, setBackgroundColor] = useState(() => {
        return localStorage.getItem('backgroundColor') || 'white';
    });

    useEffect(() => {
        localStorage.setItem('backgroundColor', backgroundColor);
    }, [backgroundColor]);

    const handleBackgroundColorChange = () => {
        setBackgroundColor(getNextBackgroundColor(backgroundColor));
    };

    function getNextBackgroundColor(currentColor: string) {
        switch (currentColor) {
            case 'white': return 'lightblue';
            case 'lightblue': return 'lightgreen';
            case 'lightgreen': return '#ff7875';
            case '#ff7875': return '#6c757d';
            case '#6c757d': return '#ffc107';
            case '#ffc107': return 'white';
            default: return 'white';
        }
    }

    return (
        <S.Container style={{ ...style, backgroundColor }} className={className}>
            <AppSidebar />
            <AppTabBar />
            <S.Layout>
                {children}
                {/* Pass handleBackgroundColorChange and the next background color */}
                <AppFooter 
                    handleBackgroundColorChange={handleBackgroundColorChange} 
                    nextBackgroundColor={getNextBackgroundColor(backgroundColor)}
                />
            </S.Layout>
        </S.Container>
    );
}


export function AnonymousLayout({ children, style, className }: Props) {
    return (
        <S.Container style={style} className={className}>
            <AppSidebar />
            <S.Layout>
                {children}
                <AppFooter handleBackgroundColorChange={function (): void {
                    throw new Error('Function not implemented.');
                } } nextBackgroundColor={''} />
            </S.Layout>
        </S.Container>
    );
}

export type BasePageHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    maxWidth?: number | string;
};

export function BasePageHeader(props: BasePageHeaderProps) {
    const { maxWidth, ...rest } = props;

    return (
        <S.PageHeaderContainer>
            <S.PageHeader {...rest} $maxWidth={maxWidth} />
        </S.PageHeaderContainer>
    );
}

export type BasePageContentProps = React.HTMLAttributes<HTMLDivElement> & {
    maxWidth?: number | string;
};

export function BasePageContent(props: BasePageContentProps) {
    const { maxWidth, ...rest } = props;

    return (
        <S.PageContentContainer>
            <S.PageContent {...rest} $maxWidth={maxWidth} />
        </S.PageContentContainer>
    );
}

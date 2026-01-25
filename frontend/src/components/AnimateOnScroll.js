import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

// Only inject styles on Web
if (isWeb) {
    const style = document.createElement('style');
    style.textContent = `
        .aos-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                        transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .aos-visible {
            opacity: 1;
            transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
            .aos-item {
                transition: none;
                opacity: 1;
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
}

const AnimateOnScroll = ({ children, style, delay = 0 }) => {
    const viewRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isWeb) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add delay if specified using inline style on the DOM element
                    if (delay > 0 && viewRef.current) {
                        viewRef.current.style.transitionDelay = `${delay}ms`;
                    }
                    if (viewRef.current) {
                        viewRef.current.classList.add('aos-visible');
                    }
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        if (viewRef.current) {
            viewRef.current.classList.add('aos-item');
            observer.observe(viewRef.current);
        }

        return () => {
            if (viewRef.current) observer.unobserve(viewRef.current);
        };
    }, [delay]);

    if (!isWeb) {
        // Native fallback: Just show content (or add simple generic animation if desired later)
        return <View style={style}>{children}</View>;
    }

    // On Web, passing classes via className prop to View might not work in RNW easily without hacking.
    // However, we can manipulate the classList in the effect as done above.
    return (
        <View ref={viewRef} style={style}>
            {children}
        </View>
    );
};

export default AnimateOnScroll;

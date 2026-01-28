"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

const CHARS = "0123456789ABCDEF!@#$%^&*()_+";

interface EncryptedTextProps {
    text: string;
    enabled?: boolean;
    className?: string;
    onHover?: boolean;
}

export function EncryptedText({
    text,
    enabled = true,
    className = "",
    onHover = false,
}: EncryptedTextProps) {
    const shouldAnimate = enabled || onHover;
    const initialText = useMemo(() => shouldAnimate ? text : "••••••", [shouldAnimate, text]);
    const [displayText, setDisplayText] = useState(initialText);
    const [isHovered, setIsHovered] = useState(false);

    const isActive = enabled || isHovered;

    useEffect(() => {
        if (!isActive) {
            return;
        }

        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText((prev) =>
                prev
                    .split("")
                    .map((_, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text, isActive]);

    const shownText = isActive ? displayText : "••••••";

    return (
        <motion.div
            className={className}
            onMouseEnter={() => onHover && setIsHovered(true)}
            onMouseLeave={() => onHover && setIsHovered(false)}
        >
            {shownText}
        </motion.div>
    );
}

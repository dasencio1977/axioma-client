import React from 'react';

/**
 * Componente base para renderizar un ícono SVG.
 * Acepta clases de Tailwind para personalizar el tamaño, color, etc.
 * @param {string} className - Clases de Tailwind (ej. "w-5 h-5 text-blue-500")
 * @param {node} children - Los elementos <path> o <circle> del SVG
 */
const Icon = ({ children, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        // Clases base + clases personalizadas
        className={`w-5 h-5 flex-shrink-0 ${className}`}
    >
        {children}
    </svg>
);

export default Icon;
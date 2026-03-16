import React from 'react';

export const TECH_ICONS: Record<string, React.ReactNode> = {
  laravel: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M22.1 11.1l-4.2-2.4v-4.8l-4.2-2.4-4.2 2.4v4.8l-4.2 2.4v4.8l4.2 2.4 4.2-2.4v-4.8l4.2-2.4v4.8l4.2 2.4v-4.8zM13.7 3.9l2.1 1.2v2.4l-2.1-1.2V3.9zm-4.2 2.4l2.1 1.2v2.4l-2.1-1.2V6.3zm0 4.8l2.1 1.2v2.4l-2.1-1.2v-2.4zm-4.2 2.4l2.1 1.2v2.4l-2.1-1.2v-2.4zm8.4 4.8l-2.1-1.2v-2.4l2.1 1.2v2.4zm4.2-2.4l-2.1-1.2v-2.4l2.1 1.2v2.4z" />
    </svg>
  ),
  react: (
    <svg viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor" className="w-3 h-3">
      <circle cx="0" cy="0" r="2.05" fill="currentColor"/>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2"/>
        <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
        <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
      </g>
    </svg>
  ),
  vue: (
    <svg viewBox="0 0 256 221" fill="currentColor" className="w-3 h-3">
      <path d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" fill="#41B883"/>
      <path d="M0 0l128 220.8L256 0h-51.2L128 132.48L51.2 0H0Z" fill="#35495E"/>
    </svg>
  ),
  typescript: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M1.5 1.5h125v125H1.5V1.5z" fill="#3178c6"/>
      <path d="M118.7 102.9c-1.1 6.3-5.5 10.6-12.1 11.9-4.2.8-8.2.3-11.7-2.1-3.1-2.1-4.9-5.1-5.6-8.8l7.6-1.5c.5 3.3 2.1 5.4 4.9 6.4 2.5.9 5.2.7 7.4-.7 2.3-1.4 3.4-3.7 3.3-6.4-.1-2.4-1.2-4.1-3.7-5.3-1.8-.8-3.8-1.5-5.8-2.2-2.4-.8-4.8-1.7-7.1-2.9-3.9-2.1-6.4-5.2-7.1-9.7-.7-4.5 1.2-8.7 5.2-11.5 3.5-2.5 7.7-3.4 12-2.6 4.5.8 8.1 3.2 10.4 7.2 1.3 2.3 2 4.8 2.2 7.5l-7.6 1c-.3-3.1-1.4-5.4-3.7-6.8-2.3-1.4-5-1.5-7.4-.5-2.3.9-3.4 2.8-3.3 5.3.1 2.2 1.2 3.8 3.5 4.9 1.6.8 3.4 1.4 5.2 2 2.6.9 5.2 1.8 7.7 3 4.1 2 6.8 5.1 7.7 9.8.8 4.7-1.1 9.1-5.1 12.1zM73.5 43.4H41.1v7.1h12.6v63.1h7.7V50.5h12.1v-7.1z" fill="#fff"/>
    </svg>
  ),
  nodejs: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M117.4 31.7L67.9 3.1c-2.4-1.4-5.4-1.4-7.8 0L10.6 31.7c-2.4 1.4-3.9 4-3.9 6.7v57.1c0 2.8 1.5 5.3 3.9 6.7l49.5 28.6c2.4 1.4 5.4 1.4 7.8 0l49.5-28.6c2.4-1.4 3.9-4 3.9-6.7V38.4c0-2.7-1.5-5.3-3.9-6.7zM64 115.3L18.7 89.2V37.2L64 11.1l45.3 26.1v52.1L64 115.3z" fill="#339933"/>
    </svg>
  ),
  express: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M117.4 31.7L67.9 3.1c-2.4-1.4-5.4-1.4-7.8 0L10.6 31.7c-2.4 1.4-3.9 4-3.9 6.7v57.1c0 2.8 1.5 5.3 3.9 6.7l49.5 28.6c2.4 1.4 5.4 1.4 7.8 0l49.5-28.6c2.4-1.4 3.9-4 3.9-6.7V38.4c0-2.7-1.5-5.3-3.9-6.7z" fill="#000"/>
    </svg>
  ),
  nestjs: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M117.4 31.7L67.9 3.1c-2.4-1.4-5.4-1.4-7.8 0L10.6 31.7c-2.4 1.4-3.9 4-3.9 6.7v57.1c0 2.8 1.5 5.3 3.9 6.7l49.5 28.6c2.4 1.4 5.4 1.4 7.8 0l49.5-28.6c2.4-1.4 3.9-4 3.9-6.7V38.4c0-2.7-1.5-5.3-3.9-6.7z" fill="#E0234E"/>
    </svg>
  ),
  flutter: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M73.4 1.5L14.7 60.2l19.6 19.6L93 21.1z" fill="#40D1FB"/>
      <path d="M14.7 60.2l19.6 19.6 34.2-34.2L48.9 26z" fill="#40D1FB"/>
      <path d="M34.3 79.8l39.1 39.1 39.1-39.1-39.1-39.1z" fill="#055394"/>
      <path d="M73.4 118.9l19.6-19.6-19.6-19.6-19.6 19.6z" fill="#40D1FB"/>
    </svg>
  ),
  php: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M64 1.5C29.5 1.5 1.5 29.5 1.5 64s28 62.5 62.5 62.5 62.5-28 62.5-62.5S98.5 1.5 64 1.5z" fill="#777BB4"/>
    </svg>
  ),
  python: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M64 1.5c-34.5 0-62.5 28-62.5 62.5s28 62.5 62.5 62.5 62.5-28 62.5-62.5S98.5 1.5 64 1.5z" fill="#3776AB"/>
    </svg>
  ),
  django: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M64 1.5c-34.5 0-62.5 28-62.5 62.5s28 62.5 62.5 62.5 62.5-28 62.5-62.5S98.5 1.5 64 1.5z" fill="#092E20"/>
    </svg>
  ),
  fastapi: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M64 1.5c-34.5 0-62.5 28-62.5 62.5s28 62.5 62.5 62.5 62.5-28 62.5-62.5S98.5 1.5 64 1.5z" fill="#05998B"/>
    </svg>
  ),
  gutenberg: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M64 1.5c-34.5 0-62.5 28-62.5 62.5s28 62.5 62.5 62.5 62.5-28 62.5-62.5S98.5 1.5 64 1.5z" fill="#000"/>
    </svg>
  ),
  chrome: (
    <svg viewBox="0 0 128 128" fill="currentColor" className="w-3 h-3">
      <path d="M64 1.5c-34.5 0-62.5 28-62.5 62.5s28 62.5 62.5 62.5 62.5-28 62.5-62.5S98.5 1.5 64 1.5z" fill="#4285F4"/>
    </svg>
  ),
};

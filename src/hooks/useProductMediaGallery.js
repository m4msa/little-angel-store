import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to encapsulate all product media gallery behavior:
 * - Auto-flip between images/videos every N seconds
 * - Full video playback controls (play/pause, mute/unmute)
 * - Magnifier lens hover zoom positioning
 * - Mobile touch swipe gestures
 * - Fullscreen lightbox display
 */
export function useProductMediaGallery(mediaItems = [], autoFlipInterval = 3500) {
  const initialIndex = Math.max(0, mediaItems.findIndex(m => m.isPrimary));
  const [activeMediaIndex, setActiveMediaIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [isManualInteracted, setIsManualInteracted] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);

  const videoRef = useRef(null);

  // Sync active media index if mediaItems list changes
  useEffect(() => {
    const primaryIdx = Math.max(0, mediaItems.findIndex(m => m.isPrimary));
    setActiveMediaIndex(primaryIdx);
    setIsFullscreenImage(false);
    setIsPlaying(true);
    setIsMuted(true);
    setIsZoomed(false);
    setIsManualInteracted(false);
  }, [mediaItems.length]);

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0] || { type: 'image', url: '' };

  // Auto-flip media every interval until user interacts manually
  useEffect(() => {
    if (isManualInteracted || mediaItems.length <= 1) return;
    if (currentMedia.type === 'video' && isPlaying) return;

    const timer = setInterval(() => {
      setActiveMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    }, autoFlipInterval);

    return () => clearInterval(timer);
  }, [isManualInteracted, mediaItems.length, currentMedia.type, isPlaying, autoFlipInterval]);

  const handleNextMedia = useCallback((isManual = true) => {
    if (isManual) setIsManualInteracted(true);
    setActiveMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  }, [mediaItems.length]);

  const handlePrevMedia = useCallback((isManual = true) => {
    if (isManual) setIsManualInteracted(true);
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  }, [mediaItems.length]);

  const handleSelectMedia = useCallback((idx) => {
    setIsManualInteracted(true);
    setActiveMediaIndex(idx);
  }, []);

  const toggleVideoPlayback = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Touch Swipe Handlers
  const handleTouchStart = useCallback((e) => {
    setDragStartX(e.touches ? e.touches[0].clientX : e.clientX);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (dragStartX === null) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX - clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        handleNextMedia(true);
      } else {
        handlePrevMedia(true);
      }
    }
    setDragStartX(null);
  }, [dragStartX, handleNextMedia, handlePrevMedia]);

  // Interactive Magnifier Zoom
  const handleMouseMove = useCallback((e) => {
    if (currentMedia.type !== 'image') return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
    setIsZoomed(true);
  }, [currentMedia.type]);

  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
  }, []);

  return {
    activeMediaIndex,
    setActiveMediaIndex,
    currentMedia,
    isPlaying,
    isMuted,
    isZoomed,
    zoomPos,
    isFullscreenImage,
    setIsFullscreenImage,
    videoRef,
    toggleVideoPlayback,
    toggleMute,
    handleNextMedia,
    handlePrevMedia,
    handleSelectMedia,
    handleTouchStart,
    handleTouchEnd,
    handleMouseMove,
    handleMouseLeave
  };
}

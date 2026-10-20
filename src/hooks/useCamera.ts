import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCameraOptions {
  /** JPEG data URL quality from 0 to 1. Defaults to 0.9. */
  quality?: number;
  /** Camera facing mode. Defaults to the rear-facing camera where available. */
  facingMode?: 'user' | 'environment';
}

/** Manages live camera access, taking a photo, and stopping media tracks. */
export function useCamera({
  quality = 0.9,
  facingMode = 'environment',
}: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!cameraActive) {
      stopCamera();
      return;
    }

    let cancelled = false;

    const start = async () => {
      setCameraError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not supported by this browser.');
        setCameraActive(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;

        if (!video) {
          stopCamera();
          setCameraError('The camera preview is not available.');
          setCameraActive(false);
          return;
        }

        video.srcObject = stream;
        await video.play();
      } catch (error) {
        if (cancelled) return;
        setCameraError(
          error instanceof Error ? error.message : 'Unable to access the camera.',
        );
        setCameraActive(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraActive, facingMode, stopCamera]);

  const takePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('The camera is not ready yet.');
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not capture the photo.');
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg', quality);

    setCapturedImage(image);
    setPhotoTaken(true);
    setCameraActive(false);
    setCameraError(null);
    return image;
  }, [quality]);

  const resetPhoto = useCallback(() => {
    setCapturedImage(null);
    setPhotoTaken(false);
    setCameraError(null);
  }, []);

  const startCamera = useCallback(() => {
    setCameraError(null);
    setCameraActive(true);
  }, []);

  const closeCamera = useCallback(() => {
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    videoRef,
    canvasRef,
    cameraActive,
    photoTaken,
    capturedImage,
    cameraError,
    startCamera,
    stopCamera: closeCamera,
    takePhoto,
    resetPhoto,
    setCapturedImage,
  };
}

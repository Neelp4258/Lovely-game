import * as THREE from 'three';

// Detect if device is mobile or has limited WebGL capabilities
export function isMobileOrLowEnd() {
  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;

  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) return true; // No WebGL, definitely low-end

  // Check max texture units (mobile usually has 16, desktop 32+)
  const maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  const isLowTextures = maxTextureUnits <= 16;

  return isMobile || isSmallScreen || isLowTextures;
}

// Get appropriate material based on device capabilities
export function createOptimizedMaterial(color, options = {}) {
  const isLowEnd = isMobileOrLowEnd();

  if (isLowEnd) {
    // Use MeshLambertMaterial for mobile (uses fewer samplers)
    return new THREE.MeshLambertMaterial({
      color: color,
      flatShading: options.flatShading || false,
      transparent: options.transparent || false,
      opacity: options.opacity || 1,
      emissive: options.emissive || 0x000000,
      emissiveIntensity: options.emissiveIntensity || 0
    });
  } else {
    // Use MeshStandardMaterial for desktop
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: options.roughness || 0.7,
      metalness: options.metalness || 0.2,
      transparent: options.transparent || false,
      opacity: options.opacity || 1,
      emissive: options.emissive || 0x000000,
      emissiveIntensity: options.emissiveIntensity || 0
    });
  }
}

// Shared materials to reduce material count
const materialCache = new Map();

export function getSharedMaterial(key, color, options = {}) {
  const cacheKey = `${key}-${color}`;

  if (!materialCache.has(cacheKey)) {
    materialCache.set(cacheKey, createOptimizedMaterial(color, options));
  }

  return materialCache.get(cacheKey);
}

export function optimizeForMobile() {
  const isLowEnd = isMobileOrLowEnd();

  return {
    shadowsEnabled: !isLowEnd,
    maxLights: isLowEnd ? 3 : 8,
    antialias: !isLowEnd,
    pixelRatio: isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2),
    useFlatShading: isLowEnd
  };
}

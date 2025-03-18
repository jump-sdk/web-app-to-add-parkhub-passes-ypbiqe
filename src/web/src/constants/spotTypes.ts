/**
 * Constants for parking spot types used throughout the application.
 * Provides consistent terminology and human-readable labels for spot types.
 * 
 * @version 1.0.0
 */

import { SpotType } from '../types/api.types';

/**
 * Maps spot type enum values to human-readable labels for display in the UI.
 */
export const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  [SpotType.REGULAR]: 'Regular',
  [SpotType.VIP]: 'VIP',
  [SpotType.PREMIUM]: 'Premium'
};

/**
 * Provides detailed descriptions for each spot type for tooltips or help text.
 */
export const SPOT_TYPE_DESCRIPTIONS: Record<SpotType, string> = {
  [SpotType.REGULAR]: 'Standard parking space available for general admission',
  [SpotType.VIP]: 'Premium parking space located closer to the venue entrance',
  [SpotType.PREMIUM]: 'Exclusive parking space with dedicated access and additional amenities'
};

/**
 * Array of all spot types for iteration and validation.
 */
export const SPOT_TYPES_ARRAY: SpotType[] = [
  SpotType.REGULAR,
  SpotType.VIP,
  SpotType.PREMIUM
];
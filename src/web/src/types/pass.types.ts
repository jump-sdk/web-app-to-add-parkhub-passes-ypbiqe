import { SortDirection, PaginationOptions } from './common.types';
import { ParkHubPass, SpotType } from './api.types';
import { Event } from './event.types';
import React from 'react';

/**
 * Enum representing possible pass statuses in the application.
 */
export enum PassStatus {
  /** Pass is currently active */
  ACTIVE = 'active',
  /** Pass is inactive */
  INACTIVE = 'inactive',
  /** Pass has been used */
  USED = 'used',
  /** Pass was cancelled */
  CANCELLED = 'cancelled'
}

/**
 * Enum representing possible parking spot types.
 */
export enum PassSpotType {
  /** Regular parking spot */
  REGULAR = 'Regular',
  /** VIP parking spot */
  VIP = 'VIP',
  /** Premium parking spot */
  PREMIUM = 'Premium'
}

/**
 * Enum representing possible fields for sorting passes.
 */
export enum PassSortField {
  /** Sort by pass ID */
  ID = 'id',
  /** Sort by barcode */
  BARCODE = 'barcode',
  /** Sort by customer name */
  CUSTOMER_NAME = 'customerName',
  /** Sort by spot type */
  SPOT_TYPE = 'spotType',
  /** Sort by lot ID */
  LOT_ID = 'lotId',
  /** Sort by creation date */
  CREATED_AT = 'createdAt',
  /** Sort by status */
  STATUS = 'status'
}

/**
 * Interface representing a parking pass in the application.
 * This is the application's internal model converted from the ParkHubPass API model.
 */
export interface Pass {
  /** Unique identifier for the pass */
  id: string;
  /** Event ID associated with this pass */
  eventId: string;
  /** Account ID associated with this pass */
  accountId: string;
  /** Unique barcode for the pass */
  barcode: string;
  /** Name of the customer associated with this pass */
  customerName: string;
  /** Type of parking spot */
  spotType: PassSpotType;
  /** Identifier for the parking lot */
  lotId: string;
  /** Date and time when the pass was created */
  createdAt: Date;
  /** Formatted date-time string for display */
  formattedCreatedAt: string;
  /** Current status of the pass */
  status: PassStatus;
  /** Associated event, if available */
  event: Event | null;
}

/**
 * Interface for filtering options specific to passes.
 */
export interface PassFilterOptions {
  /** Filter by pass status */
  status: PassStatus | null;
  /** Filter by spot type */
  spotType: PassSpotType | null;
  /** Filter by lot ID */
  lotId: string | null;
  /** Filter by search term (searches in barcode and customer name) */
  searchTerm: string | null;
}

/**
 * Interface for sorting options specific to passes.
 */
export interface PassSortOptions {
  /** Field to sort by */
  field: PassSortField;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Interface representing the complete state for passes management.
 */
export interface PassesState {
  /** Complete list of passes */
  passes: Pass[];
  /** Filtered list of passes based on current filter options */
  filteredPasses: Pass[];
  /** Paginated list of passes to display */
  paginatedPasses: Pass[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filter options */
  filterOptions: PassFilterOptions;
  /** Current sort options */
  sortOptions: PassSortOptions;
  /** Current pagination state */
  pagination: PaginationOptions;
  /** Currently selected pass ID */
  selectedPassId: string | null;
  /** Currently selected event ID */
  selectedEventId: string | null;
}

/**
 * Interface for pass creation form data.
 */
export interface PassFormData {
  /** Event ID associated with this pass */
  eventId: string;
  /** Account ID associated with this pass */
  accountId: string;
  /** Unique barcode for the pass */
  barcode: string;
  /** Name of the customer associated with this pass */
  customerName: string;
  /** Type of parking spot */
  spotType: PassSpotType;
  /** Identifier for the parking lot */
  lotId: string;
}

/**
 * Interface representing the result of a single pass creation operation.
 */
export interface PassCreationResult {
  /** Indicates whether the pass creation was successful */
  success: boolean;
  /** The created pass object if successful, null otherwise */
  pass: Pass | null;
  /** Error information if the creation failed, null otherwise */
  error: Error | null;
}

/**
 * Interface representing a summary of batch pass creation results.
 */
export interface PassCreationSummary {
  /** Event ID for which passes were created */
  eventId: string;
  /** Event details, if available */
  event: Event | null;
  /** Array of successfully created passes */
  successful: Pass[];
  /** Array of failed pass creation attempts */
  failed: Array<{ barcode: string; customerName: string; error: Error }>;
  /** Total number of passes successfully created */
  totalSuccess: number;
  /** Total number of passes that failed to create */
  totalFailed: number;
}

/**
 * Interface for table column configuration specific to passes.
 */
export interface PassTableColumn {
  /** Unique column identifier */
  id: string;
  /** Display label for column header */
  label: string;
  /** Field of the Pass interface this column displays */
  field: keyof Pass;
  /** Whether this column is sortable */
  sortable: boolean;
  /** Column width */
  width: string | number;
  /** Column text alignment */
  align: 'left' | 'right' | 'center';
  /** Optional formatter function for cell values */
  format?: (value: any, pass: Pass) => React.ReactNode;
}

/**
 * Interface representing the return value of the usePasses hook.
 */
export interface PassesHookResult {
  /** Complete list of passes */
  passes: Pass[];
  /** Filtered list of passes based on current filter options */
  filteredPasses: Pass[];
  /** Paginated list of passes to display */
  paginatedPasses: Pass[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filter options */
  filterOptions: PassFilterOptions;
  /** Current sort options */
  sortOptions: PassSortOptions;
  /** Current pagination state */
  pagination: PaginationOptions;
  /** Currently selected pass ID */
  selectedPassId: string | null;
  /** Currently selected event ID */
  selectedEventId: string | null;
  /** Set filter options */
  setFilterOptions: (options: PassFilterOptions) => void;
  /** Set sort options */
  setSortOptions: (options: PassSortOptions) => void;
  /** Set pagination configuration */
  setPagination: (config: Partial<PaginationOptions>) => void;
  /** Select a pass by ID */
  selectPass: (passId: string | null) => void;
  /** Create a single parking pass */
  createPass: (passData: PassFormData) => Promise<PassCreationResult>;
  /** Create multiple parking passes in a batch */
  createMultiplePasses: (passesData: PassFormData[]) => Promise<PassCreationSummary>;
  /** Refetch passes data */
  refetch: () => Promise<void>;
}
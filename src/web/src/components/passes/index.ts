/**
 * Barrel file for pass-related components
 * 
 * This file consolidates and re-exports all pass-related components and their
 * props interfaces for simplified imports throughout the application.
 */

// Component imports
import PassItem from './PassItem';
import PassesTable from './PassesTable';
import PassesList from './PassesList';
import PassesFilter from './PassesFilter';
import PassResultsDisplay from './PassResultsDisplay';

// Props interface imports
import { PassItemProps } from './PassItem';
import { PassesTableProps } from './PassesTable';
import { PassesListProps } from './PassesList';
import { PassesFilterProps } from './PassesFilter';
import { PassResultsDisplayProps } from './PassResultsDisplay';

// Re-export components and interfaces
export {
  // Components
  PassItem,
  PassesTable,
  PassesList,
  PassesFilter,
  PassResultsDisplay,
  
  // Props interfaces
  PassItemProps,
  PassesTableProps,
  PassesListProps,
  PassesFilterProps,
  PassResultsDisplayProps
};
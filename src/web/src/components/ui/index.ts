/**
 * This file serves as the main export point for all UI components in the application.
 * By exporting all UI components from a single file, consumers can import from one location 
 * rather than importing from individual component files.
 * 
 * @example
 * // Instead of:
 * import Button from '../components/ui/Button';
 * import Input from '../components/ui/Input';
 * 
 * // You can do:
 * import { Button, Input } from '../components/ui';
 */

// Component imports
import { Alert, AlertProps } from './Alert';
import Button, { CustomButtonProps } from './Button';
import Card, { CustomCardProps } from './Card';
import Input, { InputProps } from './Input';
import LoadingSpinner, { LoadingSpinnerProps } from './LoadingSpinner';
import Modal, { ModalProps } from './Modal';
import Notification, { NotificationProps } from './Notification';
import Select, { SelectProps } from './Select';
import Table, { TableProps, TableColumn } from './Table';

// Re-export all UI components and their props interfaces
export {
  // Components
  Alert,
  Button,
  Card,
  Input,
  LoadingSpinner,
  Modal,
  Notification,
  Select,
  Table,
  
  // Component prop interfaces
  AlertProps,
  CustomButtonProps,
  CustomCardProps,
  InputProps,
  LoadingSpinnerProps,
  ModalProps,
  NotificationProps,
  SelectProps,
  TableProps,
  TableColumn
};
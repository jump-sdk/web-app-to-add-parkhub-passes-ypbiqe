import React from 'react'; // ^18.2.0
import { Box, Stack, Typography } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // ^5.14.0

import Button from '../ui/Button';
import FormValidationMessage from './FormValidationMessage';
import { BatchPassFormState } from '../../types/form.types';

/**
 * Props interface for the BatchFormControls component
 */
export interface BatchFormControlsProps {
  /** Current state of the batch form */
  formState: BatchPassFormState;
  /** Handler for adding a new pass to the batch */
  onAddPass: () => void;
  /** Handler for removing a pass from the batch */
  onRemovePass: (id: string) => void;
  /** Handler for submitting the batch form */
  onSubmit: () => Promise<void>;
  /** Error message to display, if any */
  error: string | null;
}

/**
 * Styled container for the batch form controls
 */
export const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

/**
 * Styled container for the action buttons
 */
export const ButtonsContainer = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

/**
 * A component that provides controls for batch form operations, including
 * adding new passes, removing passes, and submitting the batch for creation.
 * Displays appropriate loading states and validation feedback.
 * 
 * @param {BatchFormControlsProps} props - The component props
 * @returns {JSX.Element} The rendered batch form controls
 */
const BatchFormControls: React.FC<BatchFormControlsProps> = ({
  formState,
  onAddPass,
  onRemovePass,
  onSubmit,
  error,
}) => {
  // Extract relevant state from the form state
  const { isValid, isSubmitting, passes } = formState;
  
  // Determine if the form is empty (no passes)
  const isEmpty = passes.length === 0;
  
  return (
    <ControlsContainer>
      <ButtonsContainer spacing={2} direction="row">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={onAddPass}
          disabled={isSubmitting}
          data-testid="add-pass-button"
        >
          Add Pass
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={!isValid || isEmpty || isSubmitting}
          loading={isSubmitting}
          data-testid="submit-batch-button"
        >
          Create All Passes
        </Button>
      </ButtonsContainer>
      
      {error && <FormValidationMessage error={error} />}
    </ControlsContainer>
  );
};

export default BatchFormControls;
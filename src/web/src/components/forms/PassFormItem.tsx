import React from 'react';
import { Box, Grid } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // ^5.14.0

import FormField from './FormField';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { PASS_CREATION_FIELDS } from '../../constants/formFields';
import { FormFieldState, PassFormData } from '../../types/form.types';

/**
 * Props interface for the PassFormItem component
 */
export interface PassFormItemProps {
  /** Index of this pass in the batch (for labeling and handlers) */
  index: number;
  /** The event ID that all passes in this batch belong to */
  eventId: string;
  /** Current form data for this pass */
  formData: PassFormData;
  /** Current validation state for all fields */
  formState: Record<string, FormFieldState>;
  /** Handler for field value changes */
  onChange: (index: number, fieldName: string, value: string) => void;
  /** Handler for field blur events */
  onBlur: (index: number, fieldName: string) => void;
  /** Handler to remove this pass form from the batch */
  onRemove: () => void;
}

/**
 * Styled container for the pass form with consistent spacing
 */
export const FormContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%',
  // Add responsive padding adjustments
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
}));

/**
 * A component that renders an individual pass form item within the batch pass creation interface.
 * It provides input fields for all required pass data, validation feedback, and a remove button
 * to delete the form from the batch.
 *
 * @param props - Component props
 * @returns Rendered pass form item
 */
const PassFormItem: React.FC<PassFormItemProps> = ({
  index,
  eventId,
  formData,
  formState,
  onChange,
  onBlur,
  onRemove,
}) => {
  /**
   * Handler for field value changes
   */
  const handleChange = (fieldName: string, value: string) => {
    onChange(index, fieldName, value);
  };

  /**
   * Handler for field blur events
   */
  const handleBlur = (fieldName: string) => {
    onBlur(index, fieldName);
  };

  return (
    <FormContainer data-testid={`pass-form-item-${index}`}>
      <Card
        title={`PASS #${index + 1}`}
        actions={
          <Button
            variant="text"
            color="error"
            onClick={onRemove}
            startIcon={<DeleteOutlineIcon />}
            aria-label={`Remove pass ${index + 1}`}
            data-testid={`remove-pass-button-${index}`}
          >
            Remove
          </Button>
        }
      >
        <Grid container spacing={2}>
          {PASS_CREATION_FIELDS.map((field) => {
            // Skip the eventId field as it's set at the batch level
            if (field.name === 'eventId') return null;

            // Determine grid sizes for responsive layout
            const gridSizes = {
              xs: 12, 
              sm: field.name === 'customerName' ? 12 : 6, 
              md: field.name === 'customerName' ? 12 : 
                  field.name === 'spotType' ? 4 : 6
            };

            return (
              <Grid 
                item 
                xs={gridSizes.xs} 
                sm={gridSizes.sm} 
                md={gridSizes.md} 
                key={field.name}
              >
                <FormField
                  field={field}
                  fieldState={formState[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={field.disabled}
                />
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </FormContainer>
  );
};

export default PassFormItem;
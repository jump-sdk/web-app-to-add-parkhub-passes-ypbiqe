import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles'; // v5.14.0
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useForm } from '../../hooks/useForm';
import { EventSelectionFormData, FieldType } from '../../types/form.types';
import { EVENT_ID_REGEX } from '../../constants/validation';

/**
 * Props interface for the EventSelectionForm component
 */
export interface EventSelectionFormProps {
  /**
   * Initial event ID value
   * @default ''
   */
  initialEventId?: string;
  
  /**
   * Callback function called when form is submitted with a valid event ID
   */
  onSubmit: (eventId: string) => void;
  
  /**
   * Whether the form is in a loading state (disables inputs and shows loading indicator)
   * @default false
   */
  loading?: boolean;
  
  /**
   * Label text for the event ID input field
   * @default 'Event ID'
   */
  label?: string;
}

/**
 * Styled container for the event selection form
 */
export const FormContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

/**
 * A form component that allows users to select an event by entering an event ID.
 * This component is used in the Passes and Pass Creation pages to set the context
 * for viewing passes or creating new passes for a specific event.
 * 
 * Features:
 * - Event ID validation with specific format (EV##### where # is a digit)
 * - Loading state support for asynchronous operations
 * - Customizable label text
 * - Integration with form validation system
 */
const EventSelectionForm: React.FC<EventSelectionFormProps> = ({
  initialEventId = '',
  onSubmit,
  loading = false,
  label = 'Event ID'
}) => {
  // Configure form with event ID field and validation rules
  const formConfig = {
    fields: [
      {
        name: 'eventId',
        label,
        type: FieldType.TEXT,
        required: true,
        validation: EVENT_ID_REGEX,
        validationMessage: 'Event ID must be in the format EV##### (where # is a digit)',
      }
    ],
    initialValues: {
      eventId: initialEventId
    },
    onSubmit: async (values: Record<string, string>) => {
      onSubmit(values.eventId);
    },
    validateOnBlur: true,
    validateOnChange: false
  };

  // Initialize form state and handlers
  const {
    formState,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    validateField
  } = useForm(formConfig);

  // Update form when initialEventId prop changes
  useEffect(() => {
    if (initialEventId !== formState.fields.eventId?.value) {
      setFieldValue('eventId', initialEventId);
      
      // Validate the field if it has a value
      if (initialEventId) {
        validateField('eventId');
      }
    }
  }, [initialEventId, formState.fields.eventId?.value, setFieldValue, validateField]);

  // Handle form submission
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit();
    } catch (error) {
      // Form validation failed, errors will be displayed inline
      console.error('Event selection form validation failed:', error);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={submitForm} aria-label="Event selection form" data-testid="event-selection-form">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Input
              name="eventId"
              label={label}
              type="text"
              value={formState.fields.eventId?.value || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formState.fields.eventId?.error || null}
              placeholder="Enter event ID (e.g., EV12345)"
              required
              autoFocus
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              type="submit"
              disabled={!formState.isValid || loading}
              loading={loading}
              fullWidth
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </FormContainer>
  );
};

export default EventSelectionForm;
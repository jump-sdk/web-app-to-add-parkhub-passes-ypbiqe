import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Grid, Typography, Divider } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import EventSelectionForm from './EventSelectionForm';
import PassFormItem from './PassFormItem';
import BatchFormControls from './BatchFormControls';
import ResultsSummary from '../feedback/ResultsSummary';
import Alert from '../ui/Alert';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

import { useBatchForm } from '../../hooks/useForm';
import usePasses from '../../hooks/usePasses';
import useEvents from '../../hooks/useEvents';
import { PassFormData, BatchPassFormState } from '../../types/form.types';
import { PassCreationSummary } from '../../types/pass.types';
import { formatDate } from '../../utils/date-helpers';

/**
 * Props interface for the PassCreationForm component
 */
export interface PassCreationFormProps {
  /**
   * Initial event ID to pre-select
   */
  initialEventId?: string;
  
  /**
   * Callback function called when passes are successfully created
   */
  onSuccess?: (summary: PassCreationSummary) => void;
  
  /**
   * Callback function called when the user wants to view all passes for an event
   */
  onViewPasses?: (eventId: string) => void;
}

/**
 * Styled component for the form container
 */
export const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

/**
 * Styled component for the passes container
 */
export const PassesContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

/**
 * Styled component for the event info container
 */
export const EventInfoContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

/**
 * A form component that provides a form interface for creating multiple parking passes for a specific event 
 * in the ParkHub system. It allows users to select an event, add multiple pass forms, fill in pass details, 
 * and submit the batch for creation.
 */
const PassCreationForm: React.FC<PassCreationFormProps> = ({
  initialEventId = '',
  onSuccess,
  onViewPasses
}) => {
  // State for tracking form flow
  const [creationResults, setCreationResults] = useState<PassCreationSummary | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Get event data using useEvents hook
  const { getEventById } = useEvents();

  // Get pass creation functionality using usePasses hook
  const { createMultiplePasses, loading, error, selectEvent } = usePasses();

  // Initialize the batch form state using useBatchForm hook
  const {
    batchFormState,
    handleFieldChange,
    handleFieldBlur,
    handleAddForm,
    handleRemoveForm,
    handleSubmit: submitBatchForm,
    resetBatchForm,
    setEventId
  } = useBatchForm({
    eventId: initialEventId,
    onSubmit: async (passes: PassFormData[]) => {
      // This is just a validation callback
      // The actual API call is made in the handleSubmit function below
    }
  });

  // Set initial event ID when provided
  useEffect(() => {
    if (initialEventId) {
      setEventId(initialEventId);
      selectEvent(initialEventId);
    }
  }, [initialEventId, setEventId, selectEvent]);

  // Handle event selection
  const handleEventSelect = useCallback((selectedEventId: string) => {
    setEventId(selectedEventId);
    selectEvent(selectedEventId);
    // Reset creation results when event changes
    setCreationResults(null);
    setFormError(null);
  }, [setEventId, selectEvent]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      setFormError(null);
      
      // Validate that we have at least one pass
      if (batchFormState.passes.length === 0) {
        setFormError('Please add at least one pass to create.');
        return;
      }
      
      // Validate form data
      await submitBatchForm();
      
      // Get the passes data from the validated form
      const passesData = batchFormState.passes.map(pass => pass.data);
      
      // Submit the passes to the API
      const result = await createMultiplePasses(passesData);
      
      // Set the creation results
      setCreationResults(result);
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // Handle form submission errors
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unknown error occurred while creating passes.');
      }
    }
  }, [batchFormState.passes, submitBatchForm, createMultiplePasses, onSuccess]);

  // Handle "Create More" button click
  const handleCreateMore = useCallback(() => {
    resetBatchForm();
    setCreationResults(null);
  }, [resetBatchForm]);

  // Handle "View All Passes" button click
  const handleViewAllPasses = useCallback(() => {
    if (onViewPasses && batchFormState.eventId) {
      onViewPasses(batchFormState.eventId);
    }
  }, [onViewPasses, batchFormState.eventId]);

  // Handle "Retry Failed" button click
  const handleRetryFailed = useCallback((failedPasses: Array<{ barcode: string; customerName: string; error: Error }>) => {
    if (!creationResults) return;
    
    // Keep the current event ID
    const currentEventId = batchFormState.eventId;
    
    // Reset the form but keep the event
    resetBatchForm();
    setEventId(currentEventId);
    
    // Add a new form for each failed pass
    failedPasses.forEach(() => {
      handleAddForm();
    });
    
    // Update the forms with failed pass data
    // Note: This approach relies on the forms being added in a predictable order
    // A more robust solution would involve enhancing the useBatchForm hook
    setTimeout(() => {
      failedPasses.forEach((failedPass, index) => {
        handleFieldChange(index, 'barcode', failedPass.barcode);
        handleFieldChange(index, 'customerName', failedPass.customerName);
      });
    }, 100); // Short delay to ensure forms are added
    
    // Clear the creation results
    setCreationResults(null);
  }, [creationResults, batchFormState.eventId, resetBatchForm, setEventId, handleAddForm, handleFieldChange]);

  // Get the current event details for display
  const selectedEvent = useMemo(() => {
    if (!batchFormState.eventId) return null;
    return getEventById(batchFormState.eventId);
  }, [batchFormState.eventId, getEventById]);

  // Determine which view to render based on state
  const renderContent = () => {
    // If we have creation results, show the summary
    if (creationResults) {
      return (
        <ResultsSummary
          results={creationResults}
          onCreateMore={handleCreateMore}
          onViewAllPasses={handleViewAllPasses}
          onRetryFailed={handleRetryFailed}
          eventName={selectedEvent?.name || 'Unknown Event'}
          eventDate={selectedEvent ? `${selectedEvent.formattedDate} ${selectedEvent.formattedTime}` : ''}
        />
      );
    }

    // If we don't have an event ID yet, show the event selection form
    if (!batchFormState.eventId) {
      return (
        <EventSelectionForm
          initialEventId={initialEventId}
          onSubmit={handleEventSelect}
          loading={loading}
          label="Select Event ID"
        />
      );
    }

    // Otherwise, show the pass creation form
    return (
      <FormContainer data-testid="pass-creation-form">
        {/* Event information display */}
        {selectedEvent && (
          <EventInfoContainer>
            <Typography variant="subtitle1" fontWeight="bold">
              Event: {selectedEvent.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedEvent.formattedDate} {selectedEvent.formattedTime} - {selectedEvent.venue}
            </Typography>
          </EventInfoContainer>
        )}

        {/* Pass forms */}
        <PassesContainer>
          <Typography variant="h6" gutterBottom>
            PASS DETAILS
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {batchFormState.passes.length === 0 ? (
            <Card>
              <Typography variant="body1" align="center" py={4}>
                No passes added yet. Click the "Add Pass" button below to create a new pass.
              </Typography>
            </Card>
          ) : (
            batchFormState.passes.map((pass, index) => (
              <PassFormItem
                key={pass.id}
                index={index}
                eventId={batchFormState.eventId}
                formData={pass.data}
                formState={pass.state.fields}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onRemove={() => handleRemoveForm(pass.id)}
              />
            ))
          )}
        </PassesContainer>

        {/* Batch form controls */}
        <BatchFormControls
          formState={batchFormState}
          onAddPass={handleAddForm}
          onRemovePass={handleRemoveForm}
          onSubmit={handleSubmit}
          error={formError}
        />
      </FormContainer>
    );
  };

  // Render the component
  return (
    <Box sx={{ width: '100%' }} role="region" aria-label="Pass Creation Form">
      {/* Show any API errors */}
      {error && (
        <Alert severity="error" data-testid="api-error">
          {error.message || 'An error occurred during the operation.'}
        </Alert>
      )}
      
      {/* Show loading spinner during API operations */}
      {loading ? (
        <LoadingSpinner data-testid="loading-spinner" />
      ) : (
        renderContent()
      )}
    </Box>
  );
};

export default PassCreationForm;
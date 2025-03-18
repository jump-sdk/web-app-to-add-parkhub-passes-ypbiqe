import React, { useMemo } from 'react';
import { Box, Typography, Divider, Grid, Card, CardContent, useMediaQuery, useTheme } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'; // ^5.14.0

import { PassCreationSummary, Pass } from '../../types/pass.types';
import { AppError } from '../../types/error.types';
import Table from '../ui/Table';
import { Alert } from '../ui/';
import { formatDate } from '../../utils/date-helpers';

/**
 * Props interface for the PassResultsDisplay component
 */
export interface PassResultsDisplayProps {
  /** Summary of pass creation results */
  results: PassCreationSummary;
  /** Name of the event for which passes were created */
  eventName: string;
  /** Date of the event for which passes were created */
  eventDate: string;
}

// Styled Card for highlighting success results
const SuccessCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${theme.palette.success.main}`,
}));

// Styled Card for highlighting error results
const ErrorCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${theme.palette.error.main}`,
}));

// Styled Typography for section headers
const SectionHeader = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

/**
 * Displays the results of pass creation operations, showing successful and failed
 * pass creations in a tabular or card format based on screen size.
 */
const PassResultsDisplay: React.FC<PassResultsDisplayProps> = ({ 
  results, 
  eventName, 
  eventDate 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Prepare alert severity and message based on results
  const alertSeverity = results.totalFailed > 0 
    ? (results.totalSuccess > 0 ? 'warning' : 'error') 
    : 'success';
  
  const alertMessage = results.totalFailed > 0 
    ? `${results.totalSuccess} passes created successfully, ${results.totalFailed} failed` 
    : `${results.totalSuccess} passes created successfully`;

  return (
    <Box sx={{ width: '100%' }} data-testid="pass-results-display">
      {/* Summary alert */}
      <Alert severity={alertSeverity}>
        {alertMessage}
      </Alert>
      
      {/* Event information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2">
          Event: {eventName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {formatDate(eventDate, 'MM/DD/YYYY h:mm A')}
        </Typography>
      </Box>
      
      {/* Successful passes section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader variant="h6" component="h3">
          <CheckCircleOutline color="success" />
          SUCCESSFUL CREATIONS
        </SectionHeader>
        
        {isMobile 
          ? renderSuccessCards(results.successful)
          : renderSuccessTable(results.successful)
        }
      </Box>
      
      {/* Failed passes section - only render if there are failures */}
      {results.failed.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Divider sx={{ my: 3 }} />
          
          <SectionHeader variant="h6" component="h3">
            <ErrorOutline color="error" />
            FAILED CREATIONS
          </SectionHeader>
          
          {isMobile 
            ? renderFailedCards(results.failed)
            : renderFailedTable(results.failed)
          }
        </Box>
      )}
    </Box>
  );
};

/**
 * Renders a table of successfully created passes
 */
const renderSuccessTable = (passes: Pass[]) => {
  const columns = [
    { id: 'id', label: 'Pass ID', field: 'id', sortable: true, width: '15%' },
    { id: 'barcode', label: 'Barcode', field: 'barcode', sortable: true, width: '15%' },
    { id: 'customerName', label: 'Customer Name', field: 'customerName', sortable: true, width: '25%' },
    { id: 'spotType', label: 'Spot Type', field: 'spotType', sortable: true, width: '15%' },
    { id: 'lotId', label: 'Lot ID', field: 'lotId', sortable: true, width: '15%' },
    { id: 'status', label: 'Status', field: 'status', sortable: true, width: '15%' }
  ];
  
  return <Table data={passes} columns={columns} />;
};

/**
 * Renders a table of failed pass creations
 */
const renderFailedTable = (failedPasses: Array<{ barcode: string; customerName: string; error: AppError }>) => {
  const columns = [
    { id: 'barcode', label: 'Barcode', field: 'barcode', sortable: true, width: '20%' },
    { id: 'customerName', label: 'Customer Name', field: 'customerName', sortable: true, width: '30%' },
    { 
      id: 'error', 
      label: 'Error', 
      field: 'error', 
      sortable: false, 
      width: '50%',
      format: (value: AppError) => value.message
    }
  ];
  
  return <Table data={failedPasses} columns={columns} />;
};

/**
 * Renders cards for successfully created passes (mobile view)
 */
const renderSuccessCards = (passes: Pass[]) => {
  return (
    <Grid container spacing={2}>
      {passes.map((pass) => (
        <Grid item xs={12} key={pass.id}>
          <SuccessCard>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Pass ID: {pass.id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Barcode: {pass.barcode}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Customer: {pass.customerName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Spot Type: {pass.spotType}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Lot ID: {pass.lotId}
              </Typography>
              <Typography variant="body2" color="success.main">
                Status: {pass.status}
              </Typography>
            </CardContent>
          </SuccessCard>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Renders cards for failed pass creations (mobile view)
 */
const renderFailedCards = (failedPasses: Array<{ barcode: string; customerName: string; error: AppError }>) => {
  return (
    <Grid container spacing={2}>
      {failedPasses.map((failedPass, index) => (
        <Grid item xs={12} key={`${failedPass.barcode}-${index}`}>
          <ErrorCard>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Barcode: {failedPass.barcode}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Customer: {failedPass.customerName}
              </Typography>
              <Typography variant="body2" color="error.main">
                Error: {failedPass.error.message}
              </Typography>
            </CardContent>
          </ErrorCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default PassResultsDisplay;
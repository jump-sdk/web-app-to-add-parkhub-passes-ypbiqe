import React from 'react'; // ^18.2.0
import { Box, Typography, Divider, Grid } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material'; // ^5.14.0
import { useMediaQuery, useTheme } from '@mui/material'; // ^5.14.0

import { PassCreationSummary, Pass } from '../../types/pass.types';
import { AppError } from '../../types/error.types';
import { Alert, Button, Card, Table } from '../ui';

/**
 * Props interface for the ResultsSummary component
 */
interface ResultsSummaryProps {
  /** Summary of pass creation results */
  results: PassCreationSummary;
  /** Callback function when "Create More Passes" button is clicked */
  onCreateMore: () => void;
  /** Callback function when "View All Passes" button is clicked */
  onViewAllPasses: () => void;
  /** Callback function when "Retry Failed" button is clicked */
  onRetryFailed: (failedPasses: Array<{ barcode: string; customerName: string; error: AppError }>) => void;
  /** Name of the event */
  eventName: string;
  /** Date of the event */
  eventDate: string;
}

/**
 * Container for the entire results summary
 */
const SummaryContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: theme.spacing(2, 0),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3)
}));

/**
 * Title for each section (successful/failed)
 */
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

/**
 * Container for event information
 */
const EventInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}));

/**
 * Container for action buttons
 */
const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3)
}));

/**
 * Component that displays a summary of batch pass creation results
 * 
 * @param props Component props
 * @returns Rendered component showing creation results
 */
const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  results,
  onCreateMore,
  onViewAllPasses,
  onRetryFailed,
  eventName,
  eventDate
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  /**
   * Handles retry of failed pass creations
   */
  const handleRetryFailed = () => {
    onRetryFailed(results.failed);
  };

  return (
    <SummaryContainer>
      {/* Summary alert showing results */}
      <Alert 
        severity={results.totalFailed > 0 ? 'warning' : 'success'}
      >
        {results.totalSuccess > 0 && results.totalFailed > 0 ? (
          <>
            {results.totalSuccess} passes created successfully, {results.totalFailed} failed
          </>
        ) : results.totalSuccess > 0 ? (
          <>All {results.totalSuccess} passes created successfully</>
        ) : (
          <>All {results.totalFailed} pass creation attempts failed</>
        )}
      </Alert>

      {/* Event information */}
      <EventInfo>
        <Typography variant="subtitle1" fontWeight="bold">
          Event: {eventName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {eventDate}
        </Typography>
      </EventInfo>

      {/* Successful creations section */}
      {results.successful.length > 0 && (
        <Box>
          <SectionTitle variant="h6">
            <CheckCircleOutline color="success" />
            Successful Creations
          </SectionTitle>
          <Divider sx={{ mb: 2 }} />
          
          {isMobile ? 
            renderSuccessCards(results.successful) : 
            renderSuccessTable(results.successful)
          }
        </Box>
      )}

      {/* Failed creations section */}
      {results.failed.length > 0 && (
        <Box>
          <SectionTitle variant="h6">
            <ErrorOutline color="error" />
            Failed Creations
          </SectionTitle>
          <Divider sx={{ mb: 2 }} />
          
          {isMobile ? 
            renderFailedCards(results.failed) : 
            renderFailedTable(results.failed)
          }
        </Box>
      )}

      {/* Action buttons */}
      <ActionButtons>
        <Button 
          onClick={onCreateMore}
          variant="contained" 
          color="primary"
        >
          Create More Passes
        </Button>
        
        <Button 
          onClick={onViewAllPasses}
          variant="outlined" 
          color="primary"
        >
          View All Passes for Event
        </Button>
        
        {results.failed.length > 0 && (
          <Button 
            onClick={handleRetryFailed}
            variant="contained" 
            color="warning"
          >
            Retry Failed Passes
          </Button>
        )}
      </ActionButtons>
    </SummaryContainer>
  );
};

/**
 * Renders a table of successfully created passes
 * 
 * @param passes Array of successfully created passes
 * @returns Table component with successful passes data
 */
const renderSuccessTable = (passes: Pass[]) => {
  const columns = [
    { id: 'id', label: 'Pass ID', field: 'id', sortable: true, width: '20%', align: 'left' as const },
    { id: 'barcode', label: 'Barcode', field: 'barcode', sortable: true, width: '20%', align: 'left' as const },
    { id: 'customerName', label: 'Customer Name', field: 'customerName', sortable: true, width: '40%', align: 'left' as const },
    { id: 'status', label: 'Status', field: 'status', sortable: true, width: '20%', align: 'left' as const }
  ];

  return (
    <Table 
      data={passes}
      columns={columns}
      emptyMessage="No successful pass creations"
    />
  );
};

/**
 * Renders a table of failed pass creations
 * 
 * @param failedPasses Array of failed pass attempts
 * @returns Table component with failed passes data
 */
const renderFailedTable = (failedPasses: Array<{ barcode: string; customerName: string; error: AppError }>) => {
  const columns = [
    { id: 'barcode', label: 'Barcode', field: 'barcode', sortable: true, width: '20%', align: 'left' as const },
    { id: 'customerName', label: 'Customer Name', field: 'customerName', sortable: true, width: '40%', align: 'left' as const },
    { 
      id: 'error', 
      label: 'Error', 
      field: 'error', 
      sortable: false, 
      width: '40%', 
      align: 'left' as const,
      format: (value: AppError) => value.message
    }
  ];

  return (
    <Table 
      data={failedPasses}
      columns={columns}
      emptyMessage="No failed pass creations"
    />
  );
};

/**
 * Renders cards for successfully created passes (mobile view)
 * 
 * @param passes Array of successfully created passes
 * @returns Grid of Card components with successful passes data
 */
const renderSuccessCards = (passes: Pass[]) => {
  return (
    <Grid container spacing={2}>
      {passes.map((pass) => (
        <Grid item xs={12} key={pass.id}>
          <Card>
            <Typography variant="subtitle1" fontWeight="bold">
              Pass ID: {pass.id}
            </Typography>
            <Typography variant="body2">
              Barcode: {pass.barcode}
            </Typography>
            <Typography variant="body2">
              Customer: {pass.customerName}
            </Typography>
            <Typography variant="body2">
              Status: {pass.status}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Renders cards for failed pass creations (mobile view)
 * 
 * @param failedPasses Array of failed pass attempts
 * @returns Grid of Card components with failed passes data
 */
const renderFailedCards = (failedPasses: Array<{ barcode: string; customerName: string; error: AppError }>) => {
  return (
    <Grid container spacing={2}>
      {failedPasses.map((pass, index) => (
        <Grid item xs={12} key={`${pass.barcode}-${index}`}>
          <Card>
            <Typography variant="subtitle1" fontWeight="bold" color="error">
              Failed Pass
            </Typography>
            <Typography variant="body2">
              Barcode: {pass.barcode}
            </Typography>
            <Typography variant="body2">
              Customer: {pass.customerName}
            </Typography>
            <Typography variant="body2" color="error">
              Error: {pass.error.message}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ResultsSummary;
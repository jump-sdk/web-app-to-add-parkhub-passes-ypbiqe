import React from 'react'; // v18.2.0
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton, 
  Typography 
} from '@mui/material'; // v5.14.0
import { styled } from '@mui/material/styles'; // v5.14.0
import CloseIcon from '@mui/icons-material/Close'; // v5.14.0

// Interface for Modal props
export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** The title of the modal */
  title: string;
  /** The content of the modal */
  children: React.ReactNode;
  /** Function to close the modal */
  onClose: () => void;
  /** Action buttons to display in the modal footer */
  actions?: React.ReactNode;
  /** Maximum width of the modal */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the modal should take up the full width */
  fullWidth?: boolean;
  /** Whether to show the close button in the header */
  showCloseButton?: boolean;
  /** Whether to disable closing the modal when clicking the backdrop */
  disableBackdropClick?: boolean;
  /** Whether to disable closing the modal when pressing escape key */
  disableEscapeKeyDown?: boolean;
  /** Additional class name to apply to the modal */
  className?: string;
}

// Styled components for customizing Material UI Dialog components
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(2),
      width: `calc(100% - ${theme.spacing(4)})`,
      maxWidth: '100%',
    },
  },
}));

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

/**
 * A reusable modal dialog component that wraps Material UI's Dialog with additional features
 * like customizable width, backdrop click handling, and action buttons.
 */
const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  className,
}: ModalProps): JSX.Element | null => {
  // If modal is not open, return null
  if (!isOpen) return null;

  // Handle backdrop click based on disableBackdropClick prop
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (disableBackdropClick) {
      event.stopPropagation();
    } else {
      onClose();
    }
  };

  return (
    <StyledDialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className={className}
      disableEscapeKeyDown={disableEscapeKeyDown}
      onClick={(e) => e.target === e.currentTarget && handleBackdropClick(e)}
      aria-labelledby="modal-title"
    >
      <StyledDialogTitle id="modal-title">
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            edge="end"
            data-testid="modal-close-button"
          >
            <CloseIcon />
          </IconButton>
        )}
      </StyledDialogTitle>
      
      <StyledDialogContent dividers>{children}</StyledDialogContent>
      
      {actions && <StyledDialogActions>{actions}</StyledDialogActions>}
    </StyledDialog>
  );
};

export default Modal;
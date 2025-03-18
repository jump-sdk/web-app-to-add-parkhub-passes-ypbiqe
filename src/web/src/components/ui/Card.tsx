import React from 'react';
import { Card as MuiCard, CardProps, CardContent, CardHeader, CardActions } from '@mui/material'; // @mui/material version ^5.14.0
import { styled } from '@mui/material/styles'; // @mui/material/styles version ^5.14.0

/**
 * Interface extending Material UI CardProps with additional properties for our custom Card component
 */
interface CustomCardProps extends CardProps {
  children?: React.ReactNode;
  onClick?: () => void;
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  actions?: React.ReactNode;
  selected?: boolean;
  // Note: elevation, className, and variant are inherited from CardProps
}

/**
 * Styled version of Material UI Card with custom styling based on theme variables
 * and enhanced interactive features
 */
const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<CustomCardProps>(({ theme, onClick, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  cursor: onClick ? 'pointer' : 'default',
  boxShadow: selected 
    ? `0 0 0 2px ${theme.palette.primary.main}` 
    : undefined,
  '&:hover': onClick ? {
    boxShadow: theme.shadows[3],
    transform: 'translateY(-2px)',
  } : {},
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  // Ensure touch-friendly targets for mobile
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0.5),
    '& .MuiCardHeader-root': {
      padding: theme.spacing(1.5),
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(1.5),
    },
    '& .MuiCardActions-root': {
      padding: theme.spacing(1),
    },
  },
}));

/**
 * Card component that extends Material UI's Card with additional functionality
 * including clickable behavior, consistent styling, and enhanced accessibility.
 * 
 * @param props - Component props including children, onClick, title, etc.
 * @returns Rendered card component
 */
const Card = ({
  children,
  onClick,
  title,
  subheader,
  actions,
  elevation = 1,
  className,
  selected = false,
  variant = 'elevation',
  ...rest
}: CustomCardProps): JSX.Element => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <StyledCard
      onClick={handleClick}
      elevation={elevation}
      className={className}
      selected={selected}
      variant={variant}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick && selected ? true : undefined}
      {...rest}
    >
      {(title || subheader) && (
        <CardHeader title={title} subheader={subheader} />
      )}
      {children && <CardContent>{children}</CardContent>}
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  );
};

export type { CustomCardProps };
export { StyledCard };
export default Card;
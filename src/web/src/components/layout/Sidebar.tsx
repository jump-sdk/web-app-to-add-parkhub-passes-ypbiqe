import React, { useState, useEffect } from 'react'; // ^18.2.0
import { useNavigate, useLocation } from 'react-router-dom'; // ^6.x
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Divider,
  useTheme
} from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import DashboardIcon from '@mui/icons-material/Dashboard'; // ^5.14.0
import EventIcon from '@mui/icons-material/Event'; // ^5.14.0
import ListAltIcon from '@mui/icons-material/ListAlt'; // ^5.14.0
import AddIcon from '@mui/icons-material/Add'; // ^5.14.0

import { ROUTES } from '../../constants/routes';
import { useApiKeyContext } from '../../context/ApiKeyContext';
import Button from '../ui/Button';

/**
 * Interface for the Sidebar component props
 */
interface SidebarProps {
  /**
   * Whether the sidebar is open (mainly for mobile view)
   */
  open: boolean;
  
  /**
   * Function to call when closing the sidebar
   */
  onClose: () => void;
  
  /**
   * Material UI Drawer variant
   */
  variant: 'permanent' | 'temporary' | 'persistent';
}

/**
 * Interface for navigation item configuration
 */
interface NavigationItem {
  /**
   * Route path
   */
  path: string;
  
  /**
   * Display label for the navigation item
   */
  label: string;
  
  /**
   * Icon to display with the navigation item
   */
  icon: React.ReactNode;
  
  /**
   * Whether this route requires authentication
   */
  requiresAuth: boolean;
}

/**
 * Styled Drawer component for consistent appearance
 */
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  zIndex: theme.zIndex.drawer,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

/**
 * Styled drawer header
 */
const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  minHeight: 64,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

/**
 * Styled navigation item
 */
const NavItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  transition: theme.transitions.create(['background-color', 'color'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.active': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
}));

/**
 * A responsive sidebar navigation component that provides the main navigation menu 
 * for the ParkHub Passes Creation Web Application. It displays navigation links to 
 * different sections of the application and adapts to different screen sizes.
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasApiKey } = useApiKeyContext();
  
  // Define navigation items
  const navigationItems: NavigationItem[] = [
    {
      path: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: <DashboardIcon />,
      requiresAuth: false
    },
    {
      path: ROUTES.EVENTS,
      label: 'Events',
      icon: <EventIcon />,
      requiresAuth: true
    },
    {
      path: ROUTES.PASSES,
      label: 'Passes',
      icon: <ListAltIcon />,
      requiresAuth: true
    },
    {
      path: ROUTES.CREATE_PASSES,
      label: 'Create Passes',
      icon: <AddIcon />,
      requiresAuth: true
    }
  ];

  /**
   * Handles navigation to different routes
   * @param path The route path to navigate to
   * @param requiresAuth Whether this route requires authentication
   */
  const handleNavigation = (path: string, requiresAuth: boolean): void => {
    // If route requires authentication and user is not authenticated,
    // we should show a notification or prompt for API key
    if (requiresAuth && !hasApiKey()) {
      // In a real implementation, this would show a notification or redirect to API key input
      // For this component, we'll just navigate to the dashboard
      navigate(ROUTES.DASHBOARD);
    } else {
      // Navigate to the requested path
      navigate(path);
    }
    
    // Close the sidebar on mobile view after navigation
    if (variant === 'temporary') {
      onClose();
    }
  };

  /**
   * Determines if a route is currently active
   * @param path The route path to check
   * @returns True if the route is active, false otherwise
   */
  const isActiveRoute = (path: string): boolean => {
    // Special case for dashboard which might be '/' or '/dashboard'
    if (path === ROUTES.DASHBOARD) {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <StyledDrawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true // Better open performance on mobile
      }}
    >
      <DrawerHeader>
        <Box 
          display="flex" 
          width="100%" 
          justifyContent="center" 
          alignItems="center" 
          fontWeight="bold"
          fontSize={20}
        >
          ParkHub Passes
        </Box>
      </DrawerHeader>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          // Skip items that require auth if user is not authenticated
          if (item.requiresAuth && !hasApiKey()) {
            return null;
          }
          
          const isActive = isActiveRoute(item.path);
          
          return (
            <NavItem 
              key={item.path}
              onClick={() => handleNavigation(item.path, item.requiresAuth)}
              className={isActive ? 'active' : ''}
              data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: isActive ? 'primary.contrastText' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </NavItem>
          );
        })}
      </List>
      
      {/* If sidebar is temporary (mobile), show a close button at the bottom */}
      {variant === 'temporary' && (
        <Box p={2} mt="auto">
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={onClose}
            startIcon={<DashboardIcon />}
          >
            Close Menu
          </Button>
        </Box>
      )}
    </StyledDrawer>
  );
};

export default Sidebar;
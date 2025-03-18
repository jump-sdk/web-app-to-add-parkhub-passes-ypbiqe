import React from 'react'; // v18.2.0
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useTheme, 
  useMediaQuery 
} from '@mui/material'; // v5.14.0
import { styled } from '@mui/material/styles'; // v5.14.0
import MenuIcon from '@mui/icons-material/Menu'; // v5.14.0
import DashboardIcon from '@mui/icons-material/Dashboard'; // v5.14.0
import EventIcon from '@mui/icons-material/Event'; // v5.14.0
import ListAltIcon from '@mui/icons-material/ListAlt'; // v5.14.0
import AddIcon from '@mui/icons-material/Add'; // v5.14.0
import { useNavigate } from 'react-router-dom'; // v6.x

import { ROUTES } from '../../constants/routes';
import { useApiKeyContext } from '../../context/ApiKeyContext';
import { useNotificationContext } from '../../context/NotificationContext';
import Button from '../ui/Button';

/**
 * Interface for header component props
 */
interface HeaderProps {
  /**
   * Callback function triggered when the mobile menu button is clicked
   */
  onMenuToggle: () => void;
}

/**
 * Styled AppBar with consistent elevation and positioning
 */
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[3],
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

/**
 * Container for the application logo with pointer cursor for navigation
 */
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginRight: theme.spacing(2),
}));

/**
 * Container for navigation items that hides on mobile screens
 */
const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

/**
 * Styled navigation button with consistent spacing and transitions
 */
const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  textTransform: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['background-color', 'color']),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  color: theme.palette.primary.contrastText,
}));

/**
 * Main header component that provides the application's top navigation bar
 * 
 * This component renders the application logo and navigation links, with
 * responsive behavior for mobile devices showing a hamburger menu instead.
 * It also handles navigation with API key validation for protected routes.
 * 
 * @param props Component props including onMenuToggle callback
 * @returns The rendered header component
 */
const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  // Get theme and check screen size for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get API key status from context to determine which navigation items to show
  const { hasApiKey } = useApiKeyContext();
  
  // Get notification context for displaying messages
  const { showInfo } = useNotificationContext();
  
  // Initialize navigate function from react-router-dom
  const navigate = useNavigate();
  
  /**
   * Handles navigation to different routes with API key validation
   * @param path The route path to navigate to
   */
  const handleNavigation = (path: string) => {
    // Check if route requires authentication
    const requiresAuth = path !== ROUTES.DASHBOARD;
    
    if (requiresAuth && !hasApiKey()) {
      // Show notification if API key is required but not available
      showInfo('Please add your API key to access this feature');
    } else {
      // Navigate to the requested path
      navigate(path);
    }
  };
  
  return (
    <StyledAppBar>
      <Toolbar>
        {/* Logo and application name */}
        <LogoContainer 
          onClick={() => handleNavigation(ROUTES.DASHBOARD)}
          role="button"
          aria-label="Go to dashboard"
        >
          <Typography variant="h6" component="div" fontWeight="bold">
            PARKHUB PASSES
          </Typography>
        </LogoContainer>
        
        {/* Mobile menu button or desktop navigation based on screen size */}
        {isMobile ? (
          <Box display="flex" flexGrow={1} justifyContent="flex-end">
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="end"
              onClick={onMenuToggle}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        ) : (
          <NavigationContainer>
            {/* Dashboard navigation button */}
            <NavButton
              startIcon={<DashboardIcon />}
              onClick={() => handleNavigation(ROUTES.DASHBOARD)}
              variant="text"
              aria-label="Dashboard"
            >
              Dashboard
            </NavButton>
            
            {/* Events navigation button */}
            <NavButton
              startIcon={<EventIcon />}
              onClick={() => handleNavigation(ROUTES.EVENTS)}
              variant="text"
              aria-label="Events"
            >
              Events
            </NavButton>
            
            {/* Passes navigation button */}
            <NavButton
              startIcon={<ListAltIcon />}
              onClick={() => handleNavigation(ROUTES.PASSES)}
              variant="text"
              aria-label="Passes"
            >
              Passes
            </NavButton>
            
            {/* Create Passes navigation button */}
            <NavButton
              startIcon={<AddIcon />}
              onClick={() => handleNavigation(ROUTES.CREATE_PASSES)}
              variant="text"
              aria-label="Create Passes"
            >
              Create Passes
            </NavButton>
          </NavigationContainer>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
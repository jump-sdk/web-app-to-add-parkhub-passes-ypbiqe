# ParkHub Passes Creation Web Application User Guide

This user guide provides comprehensive instructions for Jump administrators on how to use the ParkHub Passes Creation Web Application. The application enables you to view game events, manage existing passes, and create new parking passes that will be recognized by ParkHub scanners at stadium entrances.

## 1. Introduction

The ParkHub Passes Creation Web Application is a web-based tool that allows Jump administrators to create and manage parking passes in the ParkHub system. This application bridges the gap between Jump's ticketing system and ParkHub's validation system, enabling legitimate parking validation by creating valid passes that can be properly scanned and validated at stadium entrances.

### 1.1 Purpose

The primary purpose of this application is to enable Jump ticket operations employees to:

- View all game events from the ParkHub system
- View passes for specific events
- Create multiple new parking passes for events

By using this application, you can ensure that parking passes are properly registered in the ParkHub system and will be successfully validated when scanned at stadium entrances.

### 1.2 System Requirements

To use the ParkHub Passes Creation Web Application, you need:

- A modern web browser (Chrome 83+, Firefox 78+, Safari 14+, or Edge 83+)
- A valid ParkHub API key (provided by your administrator)
- Internet connection to access the ParkHub API

### 1.3 Accessing the Application

The application is accessible through a web browser at the URL provided by your administrator. No installation is required.

### 1.4 Project Overview

The ParkHub Passes Creation Web Application is a lightweight, frontend-only solution that directly interfaces with ParkHub APIs. It addresses the core business problem where current parking ticket validation is non-functional, with scanners configured to accept any barcode without actual validation.

This application enables legitimate parking validation by creating valid passes in the ParkHub system that can be properly scanned and validated at stadium entrances. The application is designed for use by Jump ticket operations employees.

## 2. Getting Started

This section covers the basic steps to get started with the ParkHub Passes Creation Web Application.

### 2.1 Logging In

The application uses API key authentication to access the ParkHub system:

1. Open the application URL in your web browser
2. If this is your first time using the application, you will be prompted to enter your ParkHub API key
3. Enter the API key provided by your administrator
4. Click 'Submit' to authenticate

Your API key will be securely stored in your browser for future sessions. You will only need to enter it again if you clear your browser data or if the key is changed.

### 2.2 Application Layout

The application has a consistent layout across all views:

- **Header**: Contains the application title and navigation menu
- **Navigation Menu**: Provides access to different sections of the application
- **Content Area**: Displays the active view (Events, Passes, or Pass Creation)
- **Status Bar**: Shows notifications and current status information

The navigation menu includes the following options:

- **Dashboard**: Overview of the application
- **Events**: View all game events from ParkHub
- **Passes**: View passes for a specific event
- **Create Passes**: Create new passes for an event

### 2.3 API Key Management

If you need to update your API key:

1. Click on the settings icon in the header
2. Select 'Update API Key'
3. Enter your new API key
4. Click 'Submit' to save the new key

If your API key becomes invalid, you will be automatically prompted to enter a new one.

## 3. Viewing Events

The Events view allows you to browse all game events from the ParkHub system.

### 3.1 Accessing the Events View

To access the Events view:

1. Click on 'Events' in the navigation menu
2. The application will load all available events from the ParkHub system
3. Events are displayed in a table format with key details

### 3.2 Event List Features

The Events list provides the following features:

- **Sorting**: Click on column headers to sort events by date, name, or venue
- **Filtering**: Use the filter controls to show only active or upcoming events
- **Search**: Enter text in the search box to find specific events
- **Pagination**: Navigate through multiple pages of events using the pagination controls

Each event row displays:
- Event ID
- Date and time
- Event name
- Venue
- Status (active, completed, cancelled)

### 3.3 Event Actions

From the Events view, you can perform the following actions:

- **View Event Details**: Click on an event row to see more details
- **View Passes**: Click the 'View Passes' button to see all passes for the selected event
- **Create Passes**: Click the 'Create Passes' button to create new passes for the selected event

These actions will navigate you to the appropriate view with the selected event's context already set.

### 3.4 Refreshing Events

To refresh the events list with the latest data from ParkHub:

1. Click the 'Refresh' button at the top of the Events view
2. The application will fetch the latest events data
3. A notification will confirm when the refresh is complete

## 4. Managing Passes

The Passes view allows you to view all parking passes for a specific event.

### 4.1 Accessing the Passes View

There are two ways to access the Passes view:

1. Click on 'Passes' in the navigation menu, then enter an event ID
2. Select an event in the Events view and click the 'View Passes' button

If you navigate directly to the Passes view, you will need to enter an event ID to load passes.

### 4.2 Entering an Event ID

If you need to enter an event ID manually:

1. Navigate to the Passes view
2. Enter the event ID in the input field
3. Click 'Submit' to load passes for that event

The event ID must be in the correct format (e.g., EV12345). If you enter an invalid format or an event ID that doesn't exist, an error message will be displayed.

### 4.3 Passes List Features

The Passes list provides the following features:

- **Sorting**: Click on column headers to sort passes by ID, barcode, customer name, etc.
- **Filtering**: Use the filter controls to filter passes by various criteria
- **Search**: Enter text in the search box to find specific passes
- **Pagination**: Navigate through multiple pages of passes using the pagination controls

Each pass row displays:
- Pass ID
- Barcode
- Customer name
- Spot type (Regular, VIP, Premium)
- Lot ID
- Creation date
- Status

### 4.4 Pass Actions

From the Passes view, you can perform the following actions:

- **View Pass Details**: Click on a pass row to see more details
- **Export Passes**: Click the 'Export CSV' button to download the passes list as a CSV file
- **Create New Passes**: Click the 'Create New Passes' button to create additional passes for the event

The export feature allows you to download the current list of passes for offline use or reporting.

## 5. Creating Passes

The Pass Creation view allows you to create multiple new parking passes for a specific event.

### 5.1 Accessing the Pass Creation View

There are two ways to access the Pass Creation view:

1. Click on 'Create Passes' in the navigation menu, then enter an event ID
2. Select an event in the Events view and click the 'Create Passes' button

If you navigate directly to the Pass Creation view, you will need to enter an event ID to set the context for the new passes.

### 5.2 Selecting an Event

If you need to select an event manually:

1. Navigate to the Pass Creation view
2. Enter the event ID in the input field
3. Click 'Load Event' to set the context for new passes

Once an event is selected, its details will be displayed at the top of the form, and you can begin creating passes for that event.

### 5.3 Adding Pass Forms

To add pass forms for creation:

1. Click the 'Add Pass' button to add a new pass form
2. Each pass form includes fields for all required pass information
3. Add as many pass forms as needed (within reasonable limits)

You can remove individual pass forms by clicking the 'X' button in the top-right corner of each form.

### 5.4 Filling Pass Details

For each pass, you need to fill in the following information:

- **Account ID**: The ParkHub account ID (e.g., ABC123)
- **Barcode**: A unique barcode for the pass (e.g., BC100001)
- **Customer Name**: The name of the customer receiving the pass
- **Spot Type**: The type of parking spot (Regular, VIP, or Premium)
- **Lot ID**: The ID of the parking lot (e.g., LOT-A)

All fields are required and must be in the correct format. The application will validate your input and display error messages for any invalid fields.

### 5.5 Form Validation

The application validates your input in real-time:

- **Required Fields**: All fields must be filled in
- **Format Validation**: Fields must match the expected format
- **Unique Barcodes**: Each barcode must be unique

Validation errors are displayed below the relevant fields with clear instructions on how to correct them.

### 5.6 Submitting Passes for Creation

To submit passes for creation:

1. Ensure all pass forms are filled in correctly
2. Click the 'Create All Passes' button at the bottom of the form
3. The application will submit the passes to the ParkHub API
4. A loading indicator will be displayed during submission

Once submission is complete, you will be navigated to the Results view showing the outcome of the creation process.

## 6. Viewing Creation Results

The Results view displays the outcome of a batch pass creation operation.

### 6.1 Understanding the Results Summary

The Results view provides a summary of the pass creation operation:

- Total number of passes submitted
- Number of passes created successfully
- Number of passes that failed to create

The results are categorized into 'Successful Creations' and 'Failed Creations' sections for easy review.

### 6.2 Successful Creations

The Successful Creations section displays a table of all passes that were created successfully, including:

- Pass ID (assigned by ParkHub)
- Barcode
- Customer name
- Status

This information confirms that these passes have been successfully registered in the ParkHub system and are ready for use.

### 6.3 Failed Creations

The Failed Creations section displays a table of all passes that failed to create, including:

- Barcode
- Customer name
- Error message

The error message provides information about why the pass creation failed, such as duplicate barcodes or validation errors.

### 6.4 Result Actions

From the Results view, you can perform the following actions:

- **Create More Passes**: Click the 'Create More Passes' button to return to the Pass Creation view for the same event
- **View All Passes**: Click the 'View All Passes for Event' button to navigate to the Passes view for the event
- **Retry Failed Passes**: If any passes failed to create, you can click the 'Retry Failed' button to attempt creation again

The 'Retry Failed' option is only available if there were failed creations. It will pre-fill a new Pass Creation form with the data from the failed passes.

## 7. Troubleshooting

This section provides solutions for common issues you might encounter while using the application.

### 7.1 API Connection Issues

If you encounter API connection issues:

1. Check your internet connection
2. Verify that your API key is valid and correctly entered
3. Click the 'Retry' button to attempt the operation again
4. If the issue persists, contact your administrator

Connection issues are typically indicated by error messages stating 'Unable to connect to ParkHub API' or 'Network error'.

### 7.2 Authentication Errors

If you encounter authentication errors:

1. Ensure your API key is correctly entered
2. Try updating your API key through the settings menu
3. Contact your administrator if you need a new API key

Authentication errors are typically indicated by '401 Unauthorized' error messages.

### 7.3 Validation Errors

If you encounter validation errors when creating passes:

1. Review the error messages displayed below each field
2. Correct the input according to the required format
3. Ensure barcodes are unique
4. Verify that all required fields are filled in

Common validation errors include incorrect barcode format, duplicate barcodes, and missing required fields.

### 7.4 Browser Issues

If you encounter browser-related issues:

1. Try refreshing the page
2. Clear your browser cache and cookies
3. Try using a different supported browser
4. Ensure your browser is updated to a supported version

Browser issues might manifest as unexpected behavior, layout problems, or performance issues.

## 8. Best Practices

Follow these best practices to ensure efficient and effective use of the application.

### 8.1 Event Management

Best practices for managing events:

- Regularly refresh the events list to ensure you have the latest data
- Use filters and search to quickly find specific events
- Sort events by date to focus on upcoming events

### 8.2 Pass Management

Best practices for managing passes:

- Regularly export pass lists for backup and reporting
- Use search and filters to locate specific passes
- Review pass details before creating additional passes to avoid duplicates

### 8.3 Pass Creation

Best practices for creating passes:

- Prepare pass information in advance for efficient entry
- Use a consistent naming convention for barcodes
- Create passes in manageable batches (10-20 at a time) rather than very large batches
- Validate all information before submission to minimize errors
- Keep a record of created passes for reference

### 8.4 Security

Best practices for security:

- Keep your API key confidential
- Do not share your browser session with others
- Log out or close the browser when finished using the application
- Regularly update your API key according to your organization's security policies

## 9. Glossary

This glossary defines key terms used throughout the application and this user guide.

### 9.1 Key Terms

- **ParkHub**: Third-party parking management system used for validating parking passes at stadium entrances
- **Pass**: A digital parking permit in the ParkHub system that can be validated by scanners
- **Event**: A game or other occasion at the stadium that requires parking management
- **Barcode**: Unique identifier printed on parking tickets that is scanned for validation
- **Spot Type**: Category of parking space (Regular, VIP, Premium)
- **Lot ID**: Identifier for a specific parking area or lot
- **Jump**: The organization that manages ticketing operations for the stadium
- **API Key**: Authentication credential used to access the ParkHub API

## 10. Support and Feedback

If you need additional support or want to provide feedback about the application:

### 10.1 Getting Support

For technical support:

1. Contact your system administrator
2. Email the support team at [support email address]
3. Call the support hotline at [support phone number]

Please provide detailed information about any issues you encounter, including error messages and steps to reproduce the problem.

### 10.2 Providing Feedback

Your feedback helps us improve the application. To provide feedback:

1. Use the feedback form accessible from the application footer
2. Email your suggestions to [feedback email address]
3. Discuss improvements with your administrator

We welcome suggestions for new features, usability improvements, and reports of any issues you encounter.
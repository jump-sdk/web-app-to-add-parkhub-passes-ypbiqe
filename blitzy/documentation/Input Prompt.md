**WHY - Vision & Purpose**

### **Purpose & Users**

Primary Problem Solved: Currently when fans arrive at the stadium, their ticket parking barcode is scanned by parkub scanner but the scanning is fake, meaning it does not validate the barcode and it is configured to successfully scan their parking ticket barcode.

The parkub passes creation web application is for Jump administrators to create Parkhub passes in the Parkhub system so that ParkHub scanners can scan and validate parking ticket barcodes.

  
TargetUsers:

- Jump ticket operations employee

## **WHAT - Core Requirements**

### **Functional Requirements**

**Core Features:**

System must:

Based on user input, create ParkHub passes using the ParkHub API

**User Capabilities:**

Users must be able to:

- View the list of game events from the ParkHub system

- View the list of passes  from the ParkHub system for a given game event

- Create many new parking passes in the ParkHub system

## **HOW - Planning & Implementation**

### **Technical Implementation**

**Required Stack Components**

- Frontend: Web-based administrative interface

- Backend: no backend, just call ParkHub APIs

- Integrations: ParkHub APIs

- Infrastructure: 

**System Requirements**

- Security requirements: call ParkHub API using api key

- Use React.js for the web application

****

### **User Experience**

**Key User Flows**

1. 1.View ParkHub events

   1.     Entry: Click on a link to see all parkhub events

2.     Steps: List of events appears 

   1.     Success: all Parkhub events appear on the web page

3.     Alternative: in case of errors, display error message

4. 1. 1. 2.View ParkHub passes for a given game event


   1. Entry: Click on tab ‘view passes’

   2. Steps: Enter the ParkHub event id-\>Click submit button → List of passes appears 

   3. Success: all Parkhub passes appear on the web page

   4. Alternative: in case of errors, display error messages

   5. 

5. 3.Create ParkHub passes for a given game event

   1. Entry: Click on a tab to see a form asking for parking passes data

   2. Steps: Populate the form for each parking pass with fields: accountId, barCode, customerName, spot type, lot Id -\> Click ‘create all passes’ button 

   3. Success: all Parkhub created passes ids appear on the web page

   4. Alternative: in case of errors, display error message for each pass that failed creation

**Core Interfaces**

Core Interfaces:

View events screen: display list of ParkHub game events

View event parking passes: display list of ParkHub parking passes for a given event

Create new parking passes: forms that allow creation of new ParkHub parking passes
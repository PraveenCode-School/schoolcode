---
description: Run the School Software Project
---
To run the School Software project, you need to start both the backend server and the frontend development server in separate terminals.

1. **Start the Backend Server:**
   - Open a terminal.
   - Navigate to the backend directory:
     ```powershell
     cd e:\SchoolSoftware\backend
     ```
   - Start the server:
     ```powershell
     npm run dev
     ```
   - The backend will typically run on `http://localhost:3001`.

2. **Start the Frontend Application:**
   - Open a *new* terminal (do not close the backend terminal).
   - Navigate to the frontend directory:
     ```powershell
     cd e:\SchoolSoftware\frontend
     ```
   - Start the Vite development server:
     ```powershell
     npm run dev
     ```
   - The frontend will typically run on `http://localhost:5173`.
   - Open your browser and visit the URL shown in the terminal (usually `http://localhost:5173`) to use the application.

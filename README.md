\# EVENTRA — Event Registration System



A full-stack event registration application built with Flask, SQLite, React, and Vite. EVENTRA allows users to explore events and register online while viewing event seat availability.



\## Features



\- Browse available events.

\- View event details and remaining seats.

\- Register for events using a web form.

\- Validate registration inputs.

\- Prevent duplicate registrations.

\- Check event capacity before accepting registrations.

\- Store registration data using SQLite.

\- Responsive frontend with animated transitions.



\## Tech Stack



\*\*Frontend\*\*

\- React

\- Vite

\- React Router

\- Motion



\*\*Backend\*\*

\- Python

\- Flask

\- SQLite



\## Project Structure



```text

CodeAlpha\_Event\_Registration\_System/

├── app.py

├── database.db

├── requirements.txt

├── templates/

└── frontend/

&#x20;   ├── package.json

&#x20;   ├── src/

&#x20;   └── vite.config.js

```



The local `database.db` file is excluded from GitHub. The application may require its database tables and initial event data to be created or seeded according to the backend setup.



\## Installation and Setup



\### 1. Clone the repository



```bash

git clone https://github.com/Pratyush-Joshi123/CodeAlpha\_Event\_Registration\_System.git

cd CodeAlpha\_Event\_Registration\_System

```



\### 2. Set up the Python backend



Create and activate a virtual environment.



\*\*Windows PowerShell:\*\*



```powershell

python -m venv venv

.\\venv\\Scripts\\Activate.ps1

python -m pip install -r requirements.txt

```



\### 3. Start the backend



```powershell

python app.py

```



\### 4. Set up the frontend



Open a second terminal:



```powershell

cd frontend

npm install

npm run dev

```



Open the local URL printed by Vite in your terminal.



\## API Endpoints



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/api/events` | Retrieve available events |

| POST | `/api/register` | Register for an event |



The registration endpoint accepts JSON containing `name`, `email`, and `event\_id`.



\## Learning Outcomes



This project demonstrates full-stack development, REST API integration, database operations, input validation, and frontend-backend communication.



\## Author



\*\*Pratyush Joshi\*\*



GitHub: \[Pratyush-Joshi123](https://github.com/Pratyush-Joshi123)








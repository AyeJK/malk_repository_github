# Malk.tv

Malk.tv is a platform that connects an Airtable database to a web application, allowing users to manage and view content.

## Project Structure

```
malk_repository/
├── public/                  # Static files
│   ├── css/                 # CSS styles
│   ├── js/                  # JavaScript files
│   └── index.html           # Main HTML file
├── netlify/                 # Netlify configuration
│   └── functions/           # Netlify Functions
├── .env                     # Environment variables (not in git)
├── .gitignore               # Git ignore file
├── netlify.toml             # Netlify configuration
├── package.json             # Node.js dependencies
├── service-account.json     # Firebase service account (not in git)
└── README.md                # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Airtable account
- Netlify account

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Firebase and Airtable configuration
4. Create a `service-account.json` file with your Firebase service account credentials
5. Start the development server:
   ```
   npm run dev
   ```

### Deployment

1. Push your changes to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify
4. Deploy your site

## Features

- User authentication with Firebase
- Content management with Airtable
- Serverless functions with Netlify
- Responsive design

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
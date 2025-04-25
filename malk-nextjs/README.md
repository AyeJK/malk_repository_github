# Malk.tv Next.js Application

This is a Next.js application for Malk.tv, a platform for content management. It uses Airtable as a database and Firebase for authentication.

## Features

- **Modern UI**: Built with Next.js and Tailwind CSS
- **Authentication**: User authentication with Firebase
- **Content Management**: Connect to Airtable for content management
- **Responsive Design**: Works on all devices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Airtable account
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Airtable
   AIRTABLE_PAT=your_airtable_personal_access_token
   AIRTABLE_BASE_ID=your_airtable_base_id

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
malk-nextjs/
├── public/                  # Static files
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── content/         # Content page
│   │   ├── dashboard/       # Dashboard page
│   │   ├── login/           # Login page
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   └── lib/                 # Utility functions
│       ├── airtable.ts      # Airtable integration
│       └── firebase.ts      # Firebase integration
├── .env.local               # Environment variables (not in git)
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Deployment

This application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## License

This project is licensed under the MIT License. // Trigger deployment

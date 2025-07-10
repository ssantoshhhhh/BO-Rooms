# Rooms Frontend

This is the frontend for the **Rooms** application, a modern web platform for listing, browsing, and managing rental rooms. Built with React and Tailwind CSS, it provides a beautiful, responsive, and user-friendly interface for both room seekers and administrators.

## Features
- Browse rooms by category, area, type, and rent
- View detailed room information with image carousel
- Contact room owners via phone or WhatsApp
- Admin dashboard for managing rooms
- Responsive, modern UI with advanced card designs
- Filtering and searching by multiple criteria
- Animated, interactive user experience

## Folder Structure
```
frontend/
  ├── public/           # Static assets and HTML
  ├── src/
  │   ├── components/   # Reusable UI components (e.g., RoomCard)
  │   ├── pages/        # Main pages (Landing, RoomDetails, Admin, etc.)
  │   ├── index.js      # App entry point
  │   ├── App.js        # Main app component
  │   └── index.css     # Tailwind and global styles
  ├── package.json      # Project dependencies and scripts
  ├── tailwind.config.js# Tailwind CSS configuration
  └── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (v6 or higher)

### Installation
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
npm run build
```
The optimized build will be in the `build/` folder.

## Scripts
- `npm start` — Run the app in development mode
- `npm run build` — Build for production
- `npm test` — Run tests (if any)

## Tech Stack
- **React** — UI library
- **Tailwind CSS** — Utility-first CSS framework
- **Swiper** — Image carousel
- **Axios** — HTTP requests
- **React Router** — Routing

## Customization
- UI is built with Tailwind CSS for easy customization.
- Room card design is in `src/components/RoomCard.js`.
- Main pages are in `src/pages/`.
- To change theme colors, edit `tailwind.config.js`.

## Backend
This frontend connects to the backend API (see `backend/` folder) for room data and admin actions. Ensure the backend is running at the expected URL (default: `http://localhost:8000`).

## Contact
For questions or support, contact the project maintainer.

---
**Enjoy using Rooms!**

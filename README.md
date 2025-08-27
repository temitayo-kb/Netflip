# Netflip: A modern, responsive React web application for browsing, searching, and favoriting movies, leveraging the The Movie Database (TMDb) API. This project features a sleek dark theme, intuitive navigation, and a user-friendly interface designed for movie discovery and favorites management.

# Features

## Movie Browsing: Displays popular movies fetched from the TMDb API in a responsive grid layout.

## Search Functionality: Enables real-time movie searches by title using the TMDb API.

## Favorites Management: Allows users to add or remove movies from a favorites list, persisted in localStorage.

## Interactive UI: Includes a navbar with active links in blue (#4F8AFF) and inactive links in grey (#7C7C7C), white and red heart emojis for favoriting and red (#f40612) search/CTA

## Dark Theme: Utilizes a consistent dark design with #242424 page background, #000000 navbar, and #1a1a1a movie card backgrounds.

## Responsive Design: Optimized for mobile devices (<768px) with adjusted layouts.

## Error Handling: Provides feedback for API failures and loading states.

# Stack

## React: Core library for building the user interface.

## React Router: Handles client-side routing for navigation.

## CSS: Custom styles for theming and layout.

## Vite: Fast build tool and development server.

## TMDb API: Source for movie data and search results.

## LocalStorage: Persists user favorites across sessions.

# Installation

## Clone the Repository: git clone https://github.com/temitayo-kb/Netflip.git

## Navigate to Project Directory:Change to the project directory: cd movie-app

## Install Dependencies:Install all required packages listed in package.json

## Set Environment Variables:Create a .env file in the root directory with your TMDb API key.

## REACT_APP_TMDB_API_KEY=your-tmdb-api-key

## Replace your-tmdb-api-key with a valid key from TMDb. https://www.themoviedb.org/

## Run the Development Server:Start the Vite development server:bash

## npm run dev


# GuessIT Game

Welcome to GuessIT, an intriguing guessing game where your ability to estimate matters! Dive into multiple levels, guess closer to the answer, and score big. Top the leaderboard by out-guessing other players.

![GuessIT Logo](src/main/resources/static/images/guessItLogo.PNG) 

Documentation: [here](Dokumentation%20GuessIt.pdf) 

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation and Setup](#installation-and-setup)
- [Credits](#credits)

## Features

- **Player Registration**: Sign up and create your player profile.
- **Multiple Levels**: Challenge yourself across a variety of levels.
- **Scoring**: The closer your guess, the higher you score.
- **Leaderboard**: Check out the top players and see where you rank.

## Technologies

- **Backend**: Developed with the robust Java Spring Boot Framework.
- **Frontend**: Interactive and sleek UI using Svelte.
- **Database**: Uses MongoDB on Atlas for data persistence.
- **Deployment**: The game was hosted on [Azure App Service](https://guess-it-game.azurewebsites.net/). Unfortunately, it's currently not available due to the university decommissioning the project.
- **Authentication**: Secure player authentication using Auth0, with certain parts of the game open to all, while others are accessible only upon logging in.
- **User Roles**: Incorporates at least two authenticated user roles, each having unique permissions.
- **Testing**: 
  - Unit Tests using JUnit for the business logic classes.
  - Integration tests for almost all endpoints based on SpringBootTests and MockMvc. Some tests utilize Mockito.
- **Organization**: Clear project structure with separate directories for Models, Controllers, Repository, and Services.
- **External Integrations**: The backend interacts with at least one third-party system.
- **Data Model**: Features several entity types with relationships, persisting in multiple collections. At least one entity type undergoes multiple states.

## Installation and Setup

1. **Prerequisites**: 
    - Ensure you have [Node.js](https://nodejs.org/) installed.
    - MongoDB installation or access to MongoDB Atlas.

2. **Setup**:
    - Clone the repository: `git clone https://github.com/Svenson-Maximus/guessITgame`.
    - Navigate to the project directory: `cd guessITgame`.
    - Install the necessary npm packages for Svelte: `npm install`.
    - Start the Svelte dev server: `npm run dev`.
    - For MongoDB, ensure you've set up the correct URI connection string to connect to your database.

3. **Running the game**: 
    - After completing the setup, open your browser and navigate to `localhost:5000` (or whatever port you've configured for Svelte) to play the game.

## Credits

Designed and developed by [Svenson Maximus](https://github.com/Svenson-Maximus). 

---
**Note**: Ensure you've got the necessary permissions before interacting with certain parts of the application.

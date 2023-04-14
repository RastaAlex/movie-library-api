# Movie Library API

This project implements a web application for storing and managing movie information. It is a REST API server built using Express.js, Sequelize ORM, and SQLite database.

## Features

1. User authentication
2. Add a movie
3. Delete a movie
4. Show movie information
5. Display a list of movies sorted alphabetically by title
6. Search for a movie by title
7. Search for a movie by actor's name
8. Import movies from a text file through the web interface

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18.x recommended)
- [Docker](https://docs.docker.com/get-docker/) (optional, for containerization)

### Clone the repository

```bash
git clone https://github.com/RastaAlex/movie-library-api.git
cd movie-library-api
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root with the following content:

```
# App
PORT=8000

# JWT
JWT_SECRET=super-password
```

### Run the server

```bash
npm start
```

The server should now be running at `http://localhost:8000`.

### Run tests

```bash
npm test
```

## Docker

### Run the Docker container

```bash
npm run start:docker
```

### Install and run the Docker container from docker hub

```bash
docker run --name movies -p 8000:8000 \
-e PORT=8000 \
-e JWT_SECRET=super-password \
rastaalex/movies
```

The server should now be running at `http://localhost:8000`.

## API Documentation

API specification can be found at [https://documenter.getpostman.com/view/356840/TzkyLeVK](https://documenter.getpostman.com/view/356840/TzkyLeVK).

## Movie List Text File

A sample text file containing movie data for importing can be found at [https://gist.github.com/k0stik/3028d42973544dd61c3b4ad863378cad]

## License

This project is licensed under the MIT License.
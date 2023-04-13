import fs from 'fs';
import readline from 'readline';
import Movie from '../models/Movie.js';

const addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: 'Error while adding movie', error });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.destroy();
    res.status(204).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error while deleting movie', error });
  }
};

const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(400).json({ message: 'Error while getting movie', error });
  }
};

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['title', 'ASC']] });
    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ message: 'Error while getting movies', error });
  }
};

const searchMovieByTitle = async (req, res) => {
  try {
    const title = req.params.title;
    const movie = await Movie.findOne({ where: { title } });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(400).json({ message: 'Error while searching movie by title', error });
  }
};

const searchMovieByActor = async (req, res) => {
  try {
    const actor = req.params.actor;
    const movies = await Movie.findAll({
      where: {
        actors: {
          [Op.like]: `%${actor}%`,
        },
      },
    });

    if (!movies.length) {
      return res.status(404).json({ message: 'No movies found for the given actor' });
    }

    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ message: 'Error while searching movie by actor', error });
  }
};

const importMovies = async (req, res) => {
  const filePath = req.file.path;
  if (!fs.existsSync(filePath)) {
    res.status(400).json({ message: 'File not found' });
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const movieSections = fileContent.split('\n\n');

  for (const movieSection of movieSections) {
    const lines = movieSection.split('\n');
    const movieData = {
      title: '',
      year: null,
      format: '',
      actors: ''
    };

    for (const line of lines) {
      const [key, value] = line.split(': ');

      if (key === 'Title') {
        movieData.title = value;
      } else if (key === 'Release Year') {
        movieData.year = parseInt(value, 10);
      } else if (key === 'Format') {
        movieData.format = value;
      } else if (key === 'Stars') {
        movieData.actors = value;
      }
    }

    try {
      await Movie.create({
        title: movieData.title,
        releaseYear: movieData.year,
        format: movieData.format,
        actors: movieData.actors
      });
    } catch (error) {
      console.error('Error while importing movies:', error);
      res.status(500).json({
        message: 'Error while importing movies',
        error
      });
      return;
    }
  }

  fs.unlinkSync(filePath);
  res.status(200).json({ message: 'Movies imported successfully' });
}

export default {
    addMovie,
    deleteMovie,
    getMovie,
    getMovies,
    searchMovieByTitle,
    searchMovieByActor,
    importMovies,
  };
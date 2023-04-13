import fs from 'fs';
import readline from 'readline';
import Movie from '../models/Movie.js';

const addMovie = async (req, res) => {
  try {
    const { title, year, format, actors } = req.body;

    const movie = await Movie.create({ title, year, format, actors });

    res.status(201).json({ data: movie.toJSON(), status: 1 });
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

    res.status(200).json({ status: 1 });
  } catch (error) {
    res.status(400).json({ message: 'Error while deleting movie', error });
  }
};

const updateMovie = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.update(updateData);

    res.status(200).json({ data: movie.toJSON(), status: 1 });
  } catch (error) {
    res.status(400).json({ message: 'Error while updating movie', error });
  }
};

const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(200).json({ data: movie.toJSON(), status: 1 });
  } catch (error) {
    res.status(400).json({ message: 'Error while getting movie', error });
  }
};

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['title', 'ASC']] });

    if (movies.length === 0) {
      return res.status(404).json({ message: 'Movies not found' });
    }

    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ message: 'Error while getting movies', error });
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
      actors: []
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
        movieData.actors = value.split(', ');
      }
    }

    try {
      await Movie.create({
        title: movieData.title,
        year: movieData.year,
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
};

export default {
    addMovie,
    deleteMovie,
    updateMovie,
    getMovie,
    getMovies,
    importMovies,
  };
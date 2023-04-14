import { promises as fsPromises, existsSync as fsExistsSync } from 'fs';
import { Op } from 'sequelize';
import Movie from '../models/movie.js';

const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const STATUS_CREATED = 201;
const STATUS_OK = 200;
const STATUS_SERVER_ERROR = 500;

/**
 * Add a new movie.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const addMovie = async (req, res) => {
  try {
    const {
      title, year, format, actors,
    } = req.body;

    const movie = await Movie.create({
      title, year, format, actors,
    });

    res.status(STATUS_CREATED).json({ data: movie.toJSON(), status: 1 });
  } catch (error) {
    res.status(STATUS_BAD_REQUEST).json({ message: 'Error while adding movie', error });
  }
};

/**
 * Delete a movie by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(STATUS_NOT_FOUND).json({ message: 'Movie not found' });
    }

    await movie.destroy();

    res.status(STATUS_OK).json({ status: 1 });
  } catch (error) {
    res.status(STATUS_BAD_REQUEST).json({ message: 'Error while deleting movie', error });
  }
};

/**
 * Update a movie by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const updateMovie = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(STATUS_NOT_FOUND).json({ message: 'Movie not found' });
    }

    await movie.update(updateData);

    res.status(STATUS_OK).json({ data: movie.toJSON(), status: 1 });
  } catch (error) {
    res.status(STATUS_BAD_REQUEST).json({ message: 'Error while updating movie', error });
  }
};

/**
 * Get a movie by ID.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.status(STATUS_OK).json({ data: movie.toJSON(), status: 1 });
  } catch (error) {
    res.status(STATUS_BAD_REQUEST).json({ message: 'Error while getting movie', error });
  }
};

/**
 * Get all movies.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getMovies = async (req, res) => {
  try {
    const {
      title, actor, sort, order, limit, offset,
    } = req.query;
    const sorting = sort || 'id';
    const sortOrder = order || 'ASC';
    const limitValue = limit ? parseInt(limit, 10) : 20;
    const offsetValue = offset ? parseInt(offset, 10) : 0;

    const whereOptions = {};

    if (title) {
      whereOptions.title = {
        [Op.like]: `%${title}%`,
      };
    }

    if (actor) {
      whereOptions.actors = {
        [Op.like]: `%${actor}%`,
      };
    }

    const movies = await Movie.findAll({
      where: whereOptions,
      order: [[sorting, sortOrder]],
      limit: limitValue,
      offset: offsetValue,
    });

    if (movies.length === 0) {
      return res.status(STATUS_NOT_FOUND).json({ message: 'Movies not found' });
    }

    res.status(STATUS_OK).json(movies);
  } catch (error) {
    res.status(STATUS_BAD_REQUEST).json({ message: 'Error while getting movies', error });
  }
};

/**
 * Import movies from a text file.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const importMovies = async (req, res) => {
  const filePath = req.file.path;
  if (!fsExistsSync(filePath)) {
    res.status(STATUS_BAD_REQUEST).json({ message: 'File not found' });
    return;
  }

  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  const movieSections = fileContent.split('\n\n');

  let importedCount = 0;
  let totalCount = 0;
  const importedMovies = [];

  for (const movieSection of movieSections) {
    totalCount++;
    const lines = movieSection.split('\n');
    const movieData = {
      title: '',
      year: null,
      format: '',
      actors: [],
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
      const createdMovie = await Movie.create({
        title: movieData.title,
        year: movieData.year,
        format: movieData.format,
        actors: movieData.actors,
      });

      importedMovies.push(createdMovie);
      importedCount++;
    } catch (error) {
      res.status(STATUS_SERVER_ERROR).json({
        message: 'Error while importing movies',
        error,
      });
      continue;
    }
  }

  res.status(STATUS_OK).json({
    data: importedMovies,
    meta: { imported: importedCount, total: totalCount },
    status: 1,
  });
};

export default {
  addMovie,
  deleteMovie,
  updateMovie,
  getMovie,
  getMovies,
  importMovies,
};

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

class Movie extends Model {}

Movie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    format: {
      type: DataTypes.ENUM('VHS', 'DVD', 'Blu-ray'),
      allowNull: false,
    },
    actors: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        return this.getDataValue('actors').split(';');
      },
      set(val) {
        this.setDataValue('actors', val.join(';'));
      },
    },
  },
  {
    sequelize,
    modelName: 'Movie',
    timestamps: false,
  },
);

export default Movie;

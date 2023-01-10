import { CreateMovieDTO } from './createMovie.dto';

const stringFields = ['title'];

export const sortMoviesAlphabetically = (
  movies: Array<CreateMovieDTO>,
  sortField: string,
) => {
  if (stringFields.includes(sortField)) {
    return movies.sort((a, b) => {
      const nameA = a.title.toLocaleLowerCase();
      const nameB = b.title.toLocaleLowerCase();

      return nameA.localeCompare(nameB);
    });
  }

  return movies;
};

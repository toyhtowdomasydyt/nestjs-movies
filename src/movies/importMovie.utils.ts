export const fieldMap = {
  title: 'title',
  'release year': 'year',
  format: 'format',
  stars: 'actors',
};

export const reverseFieldMap = Object.fromEntries(
  Object.entries(fieldMap).map((entry: [string, string]) => entry.reverse()),
);

export const fieldParsers = {
  title: (v: string) => v,
  year: (v: string) => Number(v),
  format: (v: string) => {
    const splitedFormat = v.split('-');

    if (splitedFormat.length > 1) {
      const formattedParts = splitedFormat.map(
        (formatPart: string, idx: number) => {
          if (idx > 0) {
            return formatPart.toLowerCase();
          }

          return formatPart[0].toUpperCase() + formatPart.slice(1);
        },
      );

      return formattedParts.join('-');
    }

    return splitedFormat[0];
  },
  actors: (v: string) => v.split(', ').map((name) => name),
};

export const parseByLine = () => {
  let parsedMovieEntries = [];
  const moviesEntries = [];

  const parse = (line: string) => {
    if (line) {
      const [field, data] = line.split(':');
      const formattedField = fieldMap[field.trim().toLowerCase()];
      const dataValue = fieldParsers[formattedField](data.trim());

      parsedMovieEntries.push([formattedField, dataValue]);
      return;
    }

    if (parsedMovieEntries.length > 0) {
      moviesEntries.push(parsedMovieEntries);
    }

    parsedMovieEntries = [];
  };

  return {
    parse,
    moviesEntries,
  };
};

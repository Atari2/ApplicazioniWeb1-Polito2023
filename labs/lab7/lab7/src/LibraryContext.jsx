import React from 'react';
import { Film, FilmLibrary, Filter } from './Classes';
import dayjs from 'dayjs';

const filmLibrary = new FilmLibrary();
const selectors = {
    "all":  new Filter("All", (_) => true),
    "favorites": new Filter("Favorites", (film) => film.favorite),
    "best-rated": new Filter("Best Rated", (film) => film.score >= 5),
    "seen-last-month": new Filter("Seen Last Month", (film) => film.watchDate !== null && film.watchDate.isAfter(dayjs().subtract(1, 'month'))),
    "unseen": new Filter("Unseen", (film) => film.watchDate === null)
};
filmLibrary.addNewFilm(new Film("Pulp Fiction", true, "March 10, 2023", 5));
filmLibrary.addNewFilm(new Film("21 Grams", true, "March 17, 2023", 4));
filmLibrary.addNewFilm(new Film("Star Wars", false));
filmLibrary.addNewFilm(new Film("Matrix", false));
filmLibrary.addNewFilm(new Film("Shrek", false, "March 21, 2023", 3));

const LibraryContext = React.createContext();

export { LibraryContext, filmLibrary, selectors };
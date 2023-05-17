import React from 'react';
import { Film, FilmLibrary, Filter } from './Classes';
import dayjs from 'dayjs';

const filmLibrary = new FilmLibrary();
const selectors = {
    "all":  new Filter("All"),
    "favorites": new Filter("Favorites"),
    "best-rated": new Filter("Best Rated"),
    "seen-last-month": new Filter("Seen Last Month"),
    "unseen": new Filter("Unseen")
};

const LibraryContext = React.createContext();

export { LibraryContext, filmLibrary, selectors };
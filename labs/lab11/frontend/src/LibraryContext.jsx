import React from 'react';
import { FilmLibrary, Filter, GlobalError } from './Classes';

const filmLibrary = new FilmLibrary();
const globalError = new GlobalError();
const selectors = {
    "all":  new Filter("All"),
    "favorites": new Filter("Favorites"),
    "best-rated": new Filter("Best Rated"),
    "seen-last-month": new Filter("Seen Last Month"),
    "unseen": new Filter("Unseen")
};

const LibraryContext = React.createContext();

export { LibraryContext, filmLibrary, globalError, selectors };
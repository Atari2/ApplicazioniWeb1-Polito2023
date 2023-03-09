"use strict";
const dayjs = require("dayjs");
class Film {
    constructor(id, title, favorite = false, watchDate = null, score = null) {
        this.id = id;
        this.title = title;
        this.favorite = favorite;
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score})`;
    }
}
class FilmLibrary {
    constructor() {
        this.films = [];
    }
    addNewFilm(film) {
        this.films.push(film);
    }
    print() {
        this.films.forEach(film => console.log(film.toString()));
    }
    sortByDate() {
        return [...this.films].sort((a, b) => {
            if (a.watchDate === null && b.watchDate === null) return a.id - b.id;   // if both are null, sort by id
            else if (a.watchDate === null) return 1;
            else if (b.watchDate === null) return -1;
            else return a.watchDate.diff(b.watchDate);
        });
    }
    deleteFilm(id) {
        const filmIndex = this.films.findIndex(film => film.id === id);
        if (filmIndex !== -1) {
            this.films.splice(filmIndex, 1);
        }
    }
    resetWatchedFilms() {
        this.films.forEach(film => film.watchDate = null);
    }
    getRated() {
        return [...this.films].filter(film => film.score !== null).sort((a, b) => b.score - a.score);
    }
}

const filmLibrary = new FilmLibrary();
filmLibrary.addNewFilm(new Film(1, "Pulp Fiction", true, "March 10, 2023", 5));
filmLibrary.addNewFilm(new Film(2, "21 Grams", true, "March 17, 2023", 4));
filmLibrary.addNewFilm(new Film(3, "Star Wars", false));
filmLibrary.addNewFilm(new Film(4, "Matrix", false));
filmLibrary.addNewFilm(new Film(5, "Shrek", false, "March 21, 2023", 3));
filmLibrary.print();
console.log("***** List of films sorted by date *****");
filmLibrary.sortByDate().forEach(film => console.log(film.toString()));
console.log("***** List of films that are rated sorted by decreasing score *****");
filmLibrary.getRated().forEach(film => console.log(film.toString()));
console.log("***** List of films after deleting film with id 3 *****");
filmLibrary.deleteFilm(3);
filmLibrary.print();
console.log("***** List of films after resetting watched films *****");
filmLibrary.resetWatchedFilms();
filmLibrary.print();
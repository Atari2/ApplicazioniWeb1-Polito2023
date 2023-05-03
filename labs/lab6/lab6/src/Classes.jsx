import dayjs from 'dayjs';

class Film {
    constructor(title, favorite = false, watchDate = null, score = null) {
        this.id = FilmLibrary.getNewId();
        this.title = title;
        this.favorite = favorite;
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score})`;
    }

}
function createFilmWithModification(obj, attributes) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), { ...obj, ...attributes });
}
class FilmLibrary {
    static lastID = 0;
    constructor() {
        this.films = [];
    }
    addNewFilm(film) {
        this.films.push(film);
    }
    print() {
        this.films.forEach(film => console.log(film.toString()));
    }
    static from(films) {
        const filmLibrary = new FilmLibrary();
        films.forEach(film => filmLibrary.addNewFilm(film));
        return filmLibrary;
    }
    static getNewId() {
        FilmLibrary.lastID++;
        return FilmLibrary.lastID;
    }
}

class Filter {
    constructor(name, func) {
        this.name = name;
        this.func = func;
    }
    toString() {
        return `Filter(name: ${this.name}, func: ${this.func})`;
    }
    apply(arrayLike) {
        return Array.prototype.filter.call(arrayLike, this.func)
    }
}

export { Film, FilmLibrary, Filter, createFilmWithModification };
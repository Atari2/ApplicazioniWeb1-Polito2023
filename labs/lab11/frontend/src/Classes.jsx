import dayjs from 'dayjs';

class Film {
    constructor(id, title, favorite = false, watchDate = null, score = null, user_id = null) {
        this.id = id;
        this.title = title;
        this.favorite = favorite;
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
        this.userId = user_id;
    }
    static fromFilm(film) {
        return new Film(film.id, film.title, film.favorite, film.watchDate, film.score, film.userId);
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score}, user: ${this.userId})`;
    }

}
function createFilmWithModification(obj, attributes) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), { ...obj, ...attributes });
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
    getFilmById(id) {
        return this.films.find(film => film.id === id);
    }
    static from(films) {
        const filmLibrary = new FilmLibrary();
        films.forEach(film => filmLibrary.addNewFilm(film));
        return filmLibrary;
    }
    static fromJSON(jsonArray, userid) {
        const filmLibrary = new FilmLibrary();
        jsonArray.forEach(jsonFilm => {
            const film = new Film(jsonFilm.id, jsonFilm.title, jsonFilm.favorite, jsonFilm.watchDate, jsonFilm.score, userid);
            filmLibrary.addNewFilm(film);
        });
        return filmLibrary;
    }
}

function makeUrlFriendly(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
}

class Filter {
    constructor(name) {
        this.urlfriendlyname = makeUrlFriendly(name); 
        this.name = name;
    }
    toString() {
        return `Filter(name: ${this.name}, urlfriendlyname: ${this.urlfriendlyname})`;
    }
}

class GlobalError {
    constructor() {
        this.message = "";
        this.isError = false;
    }
}

export { Film, FilmLibrary, Filter, GlobalError, createFilmWithModification };
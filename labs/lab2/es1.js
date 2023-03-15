"use strict";
const dayjs = require("dayjs");
const sqlite3 = require("sqlite3");

class Film {
    constructor(id, title, favorite = false, watchDate = null, score = null) {
        this.id = id;
        this.title = title;
        this.favorite = Boolean(favorite);
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score})`;
    }
}
class FilmLibrary {
    constructor(db_name) {
        this.films = [];
        this.db = new sqlite3.Database(db_name);
    }
    async _internalExecuteQuery(sql_object, param, for_each_callback, resolve_object) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(param)) {
                sql_object.each(...param, function (err, row) {
                    if (err) reject(err);
                    if (typeof row === "undefined") return;
                    for_each_callback(row);
                }, function (err, _) {
                    if (err) reject(err);
                    if (typeof sql_object.finalize === "function") {
                        sql_object.finalize();
                    }
                    resolve(resolve_object);
                })
            } else {
                sql_object.each(param, function (err, row) {
                    if (err) reject(err);
                    if (typeof row === "undefined") return;
                    for_each_callback(row);
                }, function (err, _) {
                    if (err) reject(err);
                    if (typeof sql_object.finalize === "function") {
                        sql_object.finalize();
                    }
                    resolve(resolve_object);
                })
            }
        });
    }
    async getAllFromDb() {
        const films = [];
        return this._internalExecuteQuery(this.db, "SELECT * FROM films", (row) => {
            films.push(new Film(row.id, row.title, row.favorite, row.watchdate, row.rating));
        }, films);
    }
    async getFavouriteFromDb() {
        const films = [];
        return this._internalExecuteQuery(this.db, "SELECT * FROM films WHERE favorite = 1", (row) => {
            films.push(new Film(row.id, row.title, row.favorite, row.watchdate, row.rating));
        }, films);
    }
    async getWatchedTodayFromDb() {
        const films = [];
        const today_date_string = dayjs().format('YYYY-MM-DD');
        const stmt = this.db.prepare("SELECT * FROM films WHERE watchdate = ?");
        return this._internalExecuteQuery(stmt, today_date_string, (row) => {
            films.push(new Film(row.id, row.title, row.favorite, row.watchdate, row.rating));
        }, films);
    }
    async getWatchedBeforeFromDb(date) {
        const films = [];
        if (typeof date === "string") date = dayjs(date);
        const fmt_date_string = date.format('YYYY-MM-DD');
        const stmt = this.db.prepare("SELECT * FROM films WHERE watchdate < ?");
        return this._internalExecuteQuery(stmt, fmt_date_string, (row) => {
            films.push(new Film(row.id, row.title, row.favorite, row.watchdate, row.rating));
        }, films);
    }
    async getRatedAtLeastFromDb(rating) {
        const films = [];
        const stmt = this.db.prepare("SELECT * FROM films WHERE rating >= ?");
        return this._internalExecuteQuery(stmt, rating, (row) => {
            films.push(new Film(row.id, row.title, row.favorite, row.watchdate, row.rating));
        }, films);
    }
    async getTitleLikeFromDb(title) {
        const films = [];
        const stmt = this.db.prepare("SELECT * FROM films WHERE title LIKE ?");
        return this._internalExecuteQuery(stmt, `%${title}%`, (row) => {
            films.push(new Film(row.id, row.title, row.favorite, row.watchdate, row.rating));
        }, films);
    }
    async addNewFilmToDb(title, favorite, watchDate, score) {
        let lastId = 0;
        await this._internalExecuteQuery(this.db, "SELECT MAX(id) AS max_id FROM films", (row) => { lastId = row.max_id; }, null);
        const stmt = this.db.prepare("INSERT INTO films (id, title, favorite, watchdate, rating) VALUES (?, ?, ?, ?, ?)");
        stmt.run(lastId + 1, title, favorite, watchDate, score, function (err) {
            if (err) {
                console.log(`Inserting film ${title} failed: ${err}`);
            } else {
                console.log(`Inserted film ${title} with id ${this.lastID}`)
            }
        });
        stmt.finalize();
    }
    async deleteFilmFromDb(filmId) {
        const stmt = this.db.prepare("DELETE FROM films WHERE id = ?");
        stmt.run(filmId, function (err) {
            if (err) {
                console.log(`Deleting film with id ${filmId} failed: ${err}`);
            } else {
                console.log(`Deleted film with id ${this.lastID}`)
            }
        });
        stmt.finalize();
    }
    async resetWatchedFilmsInDb() {
        const stmt = this.db.prepare("UPDATE films SET watchdate = NULL");
        stmt.run(function (err) {
            if (err) {
                console.log(`Resetting watched films failed: ${err}`);
            } else {
                console.log("Resetted watched films");
            }
        });
        stmt.finalize();
    }
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err) reject(err);
                resolve();
            });
        });
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

async function main() {
    const filmLibrary = new FilmLibrary("films.db");
    const films = await filmLibrary.getAllFromDb();
    films.forEach(film => console.log(film.toString()));
    console.log("Favourite films:");
    const fav_films = await filmLibrary.getFavouriteFromDb();
    fav_films.forEach(film => console.log(film.toString()));
    console.log("Films watched today:");
    const today_films = await filmLibrary.getWatchedTodayFromDb();
    today_films.forEach(film => console.log(film.toString()));
    console.log("Films watched before 2023-03-17:");
    const before_films = await filmLibrary.getWatchedBeforeFromDb("2023-03-17");
    before_films.forEach(film => console.log(film.toString()));
    console.log("Films with rating of at least 3:");
    const rated_films = await filmLibrary.getRatedAtLeastFromDb(3);
    rated_films.forEach(film => console.log(film.toString()));
    console.log("Films with 'Wars' in the title:");
    const title_films = await filmLibrary.getTitleLikeFromDb("Wars");
    title_films.forEach(film => console.log(film.toString()));
    await filmLibrary.addNewFilmToDb("Interstellar", 0, "2023-03-12", 5);
    await filmLibrary.deleteFilmFromDb(7);
    await filmLibrary.resetWatchedFilmsInDb();
    await filmLibrary.close();
}

main();
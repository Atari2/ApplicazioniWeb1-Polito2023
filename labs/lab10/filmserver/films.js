const dayjs = require("dayjs");
const sqlite3 = require("sqlite3");

const USER_ID = 1;

class Film {
    constructor(id, title, favorite = false, watchDate = null, score = null, user = USER_ID) {
        this.userId = user;    
        this.id = id;
        this.title = title;
        this.favorite = Boolean(favorite);
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score}, user: ${this.userId})`;
    }
    static fromRow(row) {
        return new Film(row.id, row.title, row.favorite, row.watchdate, row.rating, row.user);
    }
}
class FilmLibrary {
    constructor(db_name) {
        this.films = [];
        this.db = new sqlite3.Database(db_name);
    }
    async _internalExecuteQuery(...params) {
        if (params.length < 2) throw new Error("Invalid number of parameters");
        const resolve_object = params.pop();
        const callback = params.pop();
        return new Promise((resolve, reject) => {
            this.db.each(...params, function (err, row) {
                if (err) reject(err);
                if (typeof row === "undefined") return;
                callback(row, resolve_object);
            }, function (err, _) {
                if (err) reject(err);
                resolve(resolve_object);
            })
        });
    }
    async getAllFromDb() {
        return this._internalExecuteQuery("SELECT * FROM films", (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getFilmFromDb(filmId) {
        const nRows = await this._internalExecuteQuery("SELECT COUNT(*) AS n_rows FROM films WHERE id = ?", filmId, (row, obj) => {
            Object.assign(obj, row);
        }, {});

        if (nRows.n_rows === 0) throw new Error(`Film with id ${filmId} not found`);

        return this._internalExecuteQuery("SELECT * FROM films WHERE id = ?", filmId, (row, obj) => {
            Object.assign(obj, Film.fromRow(row));
        }, {});
    }
    async getFavouriteFromDb() {
        return this._internalExecuteQuery("SELECT * FROM films WHERE favorite = 1", (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getWatchedLastMonthFromDb() {
        return this._internalExecuteQuery("select * from films where DATE(watchdate) BETWEEN date('now', 'start of month', '-1 month') AND date('now', 'start of month', '-1 day')", (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getWatchedBeforeFromDb(date) {
        if (typeof date === "string") date = dayjs(date);
        const fmt_date_string = date.format('YYYY-MM-DD');
        return this._internalExecuteQuery("SELECT * FROM films WHERE watchdate < ?", fmt_date_string, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getRatedAtLeastFromDb(rating) {
        return this._internalExecuteQuery("SELECT * FROM films WHERE rating >= ?", rating, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getTitleLikeFromDb(title) {
        return this._internalExecuteQuery("SELECT * FROM films WHERE title LIKE ?", `%${title}%`, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getUnseenFromDb() {
        return this._internalExecuteQuery("SELECT * FROM films WHERE watchdate IS NULL", (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async addNewFilmToDb(userId, title, favorite, watchDate, score) {
        let lastId = 0;
        await this._internalExecuteQuery("SELECT MAX(id) AS max_id FROM films", (row, _) => { lastId = row.max_id; }, null);
        return new Promise((resolve, reject) => {
            this.db.run("INSERT INTO films (id, title, favorite, watchdate, rating, user) VALUES (?, ?, ?, ?, ?, ?)", lastId + 1, title, favorite, watchDate, score, userId, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(lastId + 1);
                }
            })
        });
    }

    getQueryFromParams(paramobj) {
        return Object.keys(paramobj).map((k) => `${k} = ?`).join(', ');
    }
    async modifyFilmFromDb(filmId, paramobj) {
        const watchDateType = typeof paramobj['watchDate'];
        if (watchDateType === "string") paramobj['watchDate'] = dayjs(paramobj['watchDate']).format('YYYY-MM-DD');
        else if (watchDateType === "object") paramobj['watchDate'] = paramobj['watchDate'].format('YYYY-MM-DD');
        const query = `UPDATE films SET ${this.getQueryFromParams(paramobj)} WHERE id = ? RETURNING id`;
        const res = await this._internalExecuteQuery(query, ...Object.values(paramobj), filmId, (row, arr) => {
            arr.push(row.id);
        }, []); 
        if (res.length === 0) throw new Error(`Film with id ${filmId} not found`);
        return res[0];
    }
    async deleteFilmFromDb(filmId) {
        const res = await this._internalExecuteQuery("DELETE FROM films WHERE id = ? RETURNING id", filmId, (row, arr) => {
            arr.push(row.id);
        }, []);
        if (res.length === 0) throw new Error(`Film with id ${filmId} not found`);
        return res[0];
    }
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}

module.exports = FilmLibrary;
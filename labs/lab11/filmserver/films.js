'use strict';
const dayjs = require("dayjs");
const { sqliteDriver } = require("./dbdriver.js");

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
        sqliteDriver.openDatabase(db_name).then(db => {
            this.db = db;
        }).catch(err => {
            console.error(err);
            // rethrow the error to the caller
            throw err;
        });
    }
    async getAllFromDb(userId) {
        return this.db.executeQuery("SELECT * FROM films WHERE user = ?", userId, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getFilmFromDb(filmId, userId) {
        const nRows = await this.db.executeQuery("SELECT COUNT(*) AS n_rows FROM films WHERE id = ? AND user = ?", filmId, userId, (row, obj) => {
            Object.assign(obj, row);
        }, {});

        if (nRows.n_rows === 0) throw new Error(`Film with id ${filmId} not found`);

        return this.db.executeQuery("SELECT * FROM films WHERE id = ? AND user = ?", filmId, userId, (row, obj) => {
            Object.assign(obj, Film.fromRow(row));
        }, {});
    }
    async getFavouriteFromDb(userId) {
        return this.db.executeQuery("SELECT * FROM films WHERE favorite = 1 AND user = ?", userId, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getWatchedLastMonthFromDb(userId) {
        return this.db.executeQuery("select * from films where user = ? AND DATE(watchdate) BETWEEN date('now', 'start of month', '-1 month') AND date('now', 'start of month', '-1 day')", userId, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getRatedAtLeastFromDb(rating, userId) {
        return this.db.executeQuery("SELECT * FROM films WHERE rating >= ? AND user = ?", rating, userId, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getTitleLikeFromDb(title, userId) {
        return this.db.executeQuery("SELECT * FROM films WHERE title LIKE ? AND user = ?", `%${title}%`, userId, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async getUnseenFromDb(userId) {
        return this.db.executeQuery("SELECT * FROM films WHERE watchdate IS NULL AND user = ?", userId, (row, obj) => {
            obj.push(Film.fromRow(row));
        }, []);
    }
    async addNewFilmToDb(userId, title, favorite, watchDate, score) {
        let lastId = 0;
        await this.db.executeQuery("SELECT MAX(id) AS max_id FROM films", (row, _) => { lastId = row.max_id; }, null);
        if (typeof watchDate === "object" && watchDate !== undefined && watchDate !== null) watchDate = watchDate.format('YYYY-MM-DD');
        return new Promise((resolve, reject) => {
            this.db.db().run("INSERT INTO films (id, title, favorite, watchdate, rating, user) VALUES (?, ?, ?, ?, ?, ?)", lastId + 1, title, favorite, watchDate, score, userId, function (err) {
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
    async modifyFilmFromDb(filmId, userId, paramobj) {
        const watchDateType = typeof paramobj['watchDate'];
        if (watchDateType === "string") paramobj['watchDate'] = dayjs(paramobj['watchDate']).format('YYYY-MM-DD');
        else if (watchDateType === "object") paramobj['watchDate'] = paramobj['watchDate'].format('YYYY-MM-DD');
        const query = `UPDATE films SET ${this.getQueryFromParams(paramobj)} WHERE id = ? AND user = ? RETURNING id`;
        const res = await this.db.executeQuery(query, ...Object.values(paramobj), filmId, userId, (row, arr) => {
            arr.push(row.id);
        }, []); 
        if (res.length === 0) throw new Error(`Film with id ${filmId} not found`);
        return res[0];
    }
    async deleteFilmFromDb(filmId, userId) {
        const res = await this.db.executeQuery("DELETE FROM films WHERE id = ? AND user = ? RETURNING id", filmId, userId, (row, arr) => {
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
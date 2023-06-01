'use strict';
const sqlite3 = require("sqlite3");

class SqliteDb {
    constructor(dbName, dbObject) {
        this.dbName = dbName;
        this.dbObject = dbObject;
    }
    async executeQuery(query, ...params) {
        if (params.length < 2) throw new Error("Invalid number of parameters");
        const resolve_object = params.pop();
        const callback = params.pop();
        return new Promise((resolve, reject) => {
            this.dbObject.each(query, ...params, function (err, row) {
                if (err) reject(err);
                if (typeof row === "undefined") return;
                callback(row, resolve_object);
            }, function (err, _) {
                if (err) reject(err);
                resolve(resolve_object);
            })
        });
    }
    db() {
        return this.dbObject;
    }
}

class SqliteDriver {
    constructor() {
        this.openDatabases = {};
    }

    async openDatabase(dbName) {
        if (dbName in this.openDatabases)
            return this.openDatabases[dbName];

        const db = new SqliteDb(dbName, new sqlite3.Database(dbName));
        this.openDatabases[dbName] = db;
        return db;
    }
}

const sqliteDriver = new SqliteDriver();

exports.sqliteDriver = sqliteDriver;
exports.SqliteDb = SqliteDb;

'use strict';
const crypto = require('crypto');
const { sqliteDriver } = require("./dbdriver.js");

const KEYLEN = 32;

class User {
    constructor(id, email, name, hash, salt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.hash = hash;
        this.salt = salt;
    }
    toString() {
        return `User(id: ${this.id}, email: ${this.email}, name: ${this.name})`;
    }
    static fromRow(row) {
        return new User(row.id, row.email, row.name, row.hash, row.salt);
    }
    pruneSensitiveInfo() {
        return {
            id: this.id,
            email: this.email,
            name: this.name
        };
    }
}

class UserTable {
    constructor(dbName) {
        sqliteDriver.openDatabase(dbName).then(db => {
            this.db = db;
        }).catch(err => {
            console.error(err);
            // rethrow the error to the caller
            throw err;
        });
    }
    async getUserById(id) {
        const user = await this.db.executeQuery("SELECT * FROM users WHERE id = ?", id, (row, obj) => {
            Object.assign(obj, User.fromRow(row));
        }, {});
        return new Promise((resolve, _) => {
            if (user === undefined)
                resolve({ error: "User not found" });
            else
                resolve(User.fromRow(user).pruneSensitiveInfo());
        });
    }
    async getUserByParams(email, password) {
        const user = await this.db.executeQuery("SELECT * FROM users WHERE email = ?", email, (row, obj) => {
            Object.assign(obj, User.fromRow(row));
        }, {});
        return new Promise((resolve, reject) => {
            if (user === undefined || Object.keys(user).length === 0)
                resolve({ error: "User not found" });
            else {
                crypto.scrypt(password, user.salt, KEYLEN, (err, hashedPassword) => {
                    if (err) reject(err);

                    const passwordHex = Buffer.from(user.hash, 'hex');
                    if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
                        resolve({ error: "Wrong password" });
                    else
                        resolve(User.fromRow(user).pruneSensitiveInfo());
                })
            }
        });
    }
}

module.exports = UserTable;
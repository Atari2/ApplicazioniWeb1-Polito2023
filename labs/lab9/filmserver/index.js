'use strict';

const { check, validationResult } = require('express-validator'); // validation middleware
const FilmLibrary = require('./films');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const filmLibrary = new FilmLibrary("films.db");

app.use(morgan('dev'));
app.use(express.json());
app.use(cors())
//  Retrieve the list of all the available films.
app.get('/api/films', async (req, res) => {
    try {
        const films = await filmLibrary.getAllFromDb();
        res.json(films);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
//  Retrieve a list of all the films that fulfill a given filter (i.e., the same filters described so far).
app.get('/api/films/filter/:filter', async (req, res) => {
    switch (req.params.filter) {
        case "all":
            const films = await filmLibrary.getAllFromDb();
            res.json(films);
            break;
        case "favorites":
            const favouriteFilms = await filmLibrary.getFavouriteFromDb();
            res.json(favouriteFilms);
            break;
        case "best-rated":
            const bestRatedFilms = await filmLibrary.getRatedAtLeastFromDb(5);
            res.json(bestRatedFilms);
            break;
        case "seen-last-month":
            const lastMonthFilms = await filmLibrary.getWatchedLastMonthFromDb();
            res.json(lastMonthFilms);
            break;
        case "unseen":
            const unseenFilms = await filmLibrary.getUnseenFromDb();
            res.json(unseenFilms);
            break;
        default:
            res.status(404).send({ error: `${req.params.filter} is not a valid filter` });
            break;
    }
});

//  Retrieve a film, given its “id”.
app.get('/api/films/:id', async (req, res) => {
    try {
        const film = await filmLibrary.getFilmFromDb(req.params.id);
        res.json(film);
    } catch (err) {
        res.status(404).send({error: err.message});
    }
});

//  Create a new film, by providing all relevant information – except the “id” that will be automatically assigned by the back-end.
app.post('/api/films', [
    check('title').isString().isLength({ min: 1 }),
    check('favorite').isBoolean(),
    check('watchDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }),
    check('score').isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const ret = await filmLibrary.addNewFilmToDb(req.body.title, req.body.favorite, req.body.watchDate, req.body.score);
        res.status(201).json({ id: ret });
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Update an existing film, by providing all the relevant information, i.e., all the properties except the “id” will overwrite the current properties of the existing film. The “id” will not change after the update
app.put('/api/films/:id', [
    check('title').isString().isLength({ min: 1 }),
    check('favorite').isBoolean(),
    check('watchDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }),
    check('score').isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        await filmLibrary.modifyFilmFromDb(req.params.id, req.body.title, req.body.favorite, req.body.watchDate, req.body.score);
        res.status(201).json({ id: req.params.id });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

//  Update the rating of a specific film.
app.put('/api/films/:id/rate', [
    check('score').isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let film = null;
    try {
        film = await filmLibrary.getFilmFromDb(req.params.id);
    } catch (err) {
        res.status(404).json({ error: err.message });
        return;
    }
    try {
        await filmLibrary.modifyFilmFromDb(req.params.id, film.title, film.favorite, film.watchDate, req.body.score);
        res.status(201).json({ id: req.params.id });
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Update the rating of a specific film.
app.put('/api/films/:id/favorite', [
    check('is').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let film = null;
    try {
        film = await filmLibrary.getFilmFromDb(req.params.id);
    } catch (err) {
        res.status(404).json({ error: err.message });
        return;
    }
    try {
        await filmLibrary.modifyFilmFromDb(req.params.id, film.title, req.body.is, film.watchDate, film.score);
        res.status(201).json({ id: req.params.id });
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Delete an existing film, given its “id”.
app.delete('/api/films/:id', async (req, res) => {
    try {
        await filmLibrary.getFilmFromDb(req.params.id);
    } catch (err) {
        res.status(404).json({ error: err.message });
        return;
    }
    try {
        await filmLibrary.deleteFilmFromDb(req.params.id);
        res.status(204).json({ id: req.params.id });
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

// Activate server
app.listen(3000, () =>
    console.log('Server ready'));
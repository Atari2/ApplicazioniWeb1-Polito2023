'use strict';

const { check, validationResult } = require('express-validator'); // validation middleware
const FilmLibrary = require('./films');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dayjs = require('dayjs');

const app = express();
const filmLibrary = new FilmLibrary("films.db");

const ENABLE_ARTIFICIAL_DELAY = true;
const ARTIFICIAL_DELAY_MS = 2000;

function conditionallyReplyWithDelay(functor) {
    if (ENABLE_ARTIFICIAL_DELAY)
        setTimeout(() => functor(), ARTIFICIAL_DELAY_MS);
    else
        functor();
}

app.use(morgan('dev'));
app.use(express.json());
app.use(cors())
//  Retrieve the list of all the available films.
app.get('/api/films', async (req, res) => {
    try {
        const films = await filmLibrary.getAllFromDb();
        conditionallyReplyWithDelay(() => res.json(films));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
//  Retrieve a list of all the films that fulfill a given filter (i.e., the same filters described so far).
app.get('/api/films/filter/:filter', async (req, res) => {
    switch (req.params.filter) {
        case "all":
            const films = await filmLibrary.getAllFromDb();
            conditionallyReplyWithDelay(() => res.json(films));
            break;
        case "favorites":
            const favouriteFilms = await filmLibrary.getFavouriteFromDb();
            conditionallyReplyWithDelay(() => res.json(favouriteFilms));
            break;
        case "best-rated":
            const bestRatedFilms = await filmLibrary.getRatedAtLeastFromDb(5);
            conditionallyReplyWithDelay(() => res.json(bestRatedFilms));
            break;
        case "seen-last-month":
            const lastMonthFilms = await filmLibrary.getWatchedLastMonthFromDb();
            conditionallyReplyWithDelay(() => res.json(lastMonthFilms));
            break;
        case "unseen":
            const unseenFilms = await filmLibrary.getUnseenFromDb();
            conditionallyReplyWithDelay(() => res.json(unseenFilms));
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
        conditionallyReplyWithDelay(() => res.json(film));
    } catch (err) {
        res.status(404).send({ error: err.message });
    }
});

function normalizeScore(score) {
    if (score === undefined || score === null)
        return null;
    if (score === 0 || score === "0" || score === "")
        return null;
    return score;
}

//  Create a new film, by providing all relevant information – except the “id” that will be automatically assigned by the back-end.
app.post('/api/films', [
    check('title').isString().isLength({ min: 1 }),
    check('favorite').isBoolean(),
    check('watchDate').optional({ values: 'null' }).custom(async value => {
        let date = dayjs(value);
        if (!date.isValid()) {
            throw new Error('Invalid date');
        }
    }),
    check('score').optional({ values: 'falsy' }).isInt({ min: 1, max: 5 }),
    check('userId').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const ret = await filmLibrary.addNewFilmToDb(req.body.userId, req.body.title, req.body.favorite, req.body.watchDate, normalizeScore(req.body.score));
        conditionallyReplyWithDelay(() => res.status(201).json({ id: ret }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Update an existing film, by providing all the relevant information, i.e., all the properties except the “id” will overwrite the current properties of the existing film. The “id” will not change after the update
app.put('/api/films/:id', [
    check('title').isString().isLength({ min: 1 }),
    check('favorite').isBoolean(),
    check('watchDate').optional({ values: 'null' }).custom(async value => {
        let date = dayjs(value);
        if (!date.isValid()) {
            throw new Error('Invalid date');
        }
    }),
    check('score').optional({ values: 'falsy' }).isInt({ min: 1, max: 5 }),
    check('userId').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const modifiedFilmId = await filmLibrary.modifyFilmFromDb(req.params.id, {
            title: req.body.title,
            favorite: req.body.favorite,
            watchdate: req.body.watchDate,
            rating: normalizeScore(req.body.score),
            user: req.body.userId
        });
        conditionallyReplyWithDelay(() => res.status(201).json({ id: modifiedFilmId }));
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

//  Update the rating of a specific film.
app.put('/api/films/:id/rate', [
    check('score').optional({ values: 'falsy' }).isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const modifiedFilmId = await filmLibrary.modifyFilmFromDb(req.params.id, {
            rating: normalizeScore(req.body.score)
        });
        conditionallyReplyWithDelay(() => res.status(201).json({ id: modifiedFilmId }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Update the favorite status of a specific film.
app.put('/api/films/:id/favorite', [
    check('is').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const modifiedFilmId = await filmLibrary.modifyFilmFromDb(req.params.id, {
            favorite: req.body.is
        });
        conditionallyReplyWithDelay(() => res.status(201).json({ id: modifiedFilmId }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Delete an existing film, given its “id”.
app.delete('/api/films/:id', async (req, res) => {
    try {
        const deletedFilmId = await filmLibrary.deleteFilmFromDb(req.params.id);
        conditionallyReplyWithDelay(() => res.status(204).json({ id: deletedFilmId }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

// Activate server
app.listen(3000, () =>
    console.log('Server ready'));
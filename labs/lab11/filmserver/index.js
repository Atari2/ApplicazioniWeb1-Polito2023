'use strict';

const { check, validationResult } = require('express-validator'); // validation middleware
const FilmLibrary = require('./films');
const UserTable = require('./users');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dayjs = require('dayjs');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

const userTable = new UserTable("films.db");

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, done) {
        userTable.getUserByParams(email, password).then(user => {
            if (user.error)
                return done(null, false, { message: "Incorrect username and/or password." });
            else
                return done(null, user);
        }).catch(err => {
            return done(err);
        })
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    userTable.getUserById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err);
    })
})

const app = express();
const filmLibrary = new FilmLibrary("films.db");

const ENABLE_ARTIFICIAL_DELAY = true;
const ARTIFICIAL_DELAY_MS = 500;

function conditionallyReplyWithDelay(functor) {
    if (ENABLE_ARTIFICIAL_DELAY)
        setTimeout(functor, ARTIFICIAL_DELAY_MS);
    else
        functor();
}

app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    res.status(401).json({ error: 'Not authenticated' });
};

app.use(session({
    secret: '7qhf#hE!4kXB?frmCq9Hh&c!d4cgbx9T',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//  Retrieve the list of all the available films.
app.get('/api/films', isLoggedIn, async (req, res) => {
    try {
        const films = await filmLibrary.getAllFromDb(req.user.id);
        conditionallyReplyWithDelay(() => res.json(films));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
//  Retrieve a list of all the films that fulfill a given filter (i.e., the same filters described so far).
app.get('/api/films/filter/:filter', isLoggedIn, async (req, res) => {
    switch (req.params.filter) {
        case "all":
            const films = await filmLibrary.getAllFromDb(req.user.id);
            conditionallyReplyWithDelay(() => res.json(films));
            break;
        case "favorites":
            const favouriteFilms = await filmLibrary.getFavouriteFromDb(req.user.id);
            conditionallyReplyWithDelay(() => res.json(favouriteFilms));
            break;
        case "best-rated":
            const bestRatedFilms = await filmLibrary.getRatedAtLeastFromDb(5, req.user.id);
            conditionallyReplyWithDelay(() => res.json(bestRatedFilms));
            break;
        case "seen-last-month":
            const lastMonthFilms = await filmLibrary.getWatchedLastMonthFromDb(req.user.id);
            conditionallyReplyWithDelay(() => res.json(lastMonthFilms));
            break;
        case "unseen":
            const unseenFilms = await filmLibrary.getUnseenFromDb(req.user.id);
            conditionallyReplyWithDelay(() => res.json(unseenFilms));
            break;
        default:
            res.status(404).send({ error: `${req.params.filter} is not a valid filter` });
            break;
    }
});

//  Retrieve a film, given its “id”.
app.get('/api/films/:id', isLoggedIn, async (req, res) => {
    try {
        const film = await filmLibrary.getFilmFromDb(req.params.id, req.user.id);
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
app.post('/api/films', isLoggedIn, [
    check('title').isString().isLength({ min: 1 }),
    check('favorite').isBoolean(),
    check('watchDate').optional({ values: 'null' }).custom(async value => {
        let date = dayjs(value);
        if (!date.isValid()) {
            throw new Error('Invalid date');
        }
    }),
    check('score').optional({ values: 'falsy' }).isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const ret = await filmLibrary.addNewFilmToDb(req.user.id, req.body.title, req.body.favorite, req.body.watchDate, normalizeScore(req.body.score));
        conditionallyReplyWithDelay(() => res.status(201).json({ id: ret }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Update an existing film, by providing all the relevant information, i.e., all the properties except the “id” will overwrite the current properties of the existing film. The “id” will not change after the update
app.put('/api/films/:id', isLoggedIn, [
    check('title').isString().isLength({ min: 1 }),
    check('favorite').isBoolean(),
    check('watchDate').optional({ values: 'null' }).custom(async value => {
        let date = dayjs(value);
        if (!date.isValid()) {
            throw new Error('Invalid date');
        }
    }),
    check('score').optional({ values: 'falsy' }).isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const modifiedFilmId = await filmLibrary.modifyFilmFromDb(req.params.id, req.user.id, {
            title: req.body.title,
            favorite: req.body.favorite,
            watchdate: req.body.watchDate,
            rating: normalizeScore(req.body.score)
        });
        conditionallyReplyWithDelay(() => res.status(201).json({ id: modifiedFilmId }));
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

//  Update the rating of a specific film.
app.put('/api/films/:id/rate', isLoggedIn, [
    check('score').optional({ values: 'falsy' }).isInt({ min: 1, max: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const modifiedFilmId = await filmLibrary.modifyFilmFromDb(req.params.id, req.user.id, {
            rating: normalizeScore(req.body.score)
        });
        conditionallyReplyWithDelay(() => res.status(201).json({ id: modifiedFilmId }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Update the favorite status of a specific film.
app.put('/api/films/:id/favorite', isLoggedIn, [
    check('is').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const modifiedFilmId = await filmLibrary.modifyFilmFromDb(req.params.id, req.user.id, {
            favorite: req.body.is
        });
        conditionallyReplyWithDelay(() => res.status(201).json({ id: modifiedFilmId }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

//  Delete an existing film, given its “id”.
app.delete('/api/films/:id', isLoggedIn, async (req, res) => {
    try {
        const deletedFilmId = await filmLibrary.deleteFilmFromDb(req.params.id, req.user.id);
        conditionallyReplyWithDelay(() => res.status(204).json({ id: deletedFilmId }));
    } catch (err) {
        res.status(503).json({ error: err.message });
    }
});

app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).json(info);
        req.logIn(user, err => {
            if (err)
                return next(err);
            return res.json(req.user);
        })
    })(req, res, next);
});

app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
    req.logout(() => res.end());
});

app.get('/api/sessions/current', isLoggedIn, (req, res) => {
    if (req.isAuthenticated())
        res.status(200).json(req.user);
    else
        res.status(401).json({ error: 'Unauthenticated user!' });
});

// Activate server
app.listen(3000, () =>
    console.log('Server ready'));
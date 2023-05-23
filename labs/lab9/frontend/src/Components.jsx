import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form, Table, ListGroup, Navbar, Nav, InputGroup, Modal, Offcanvas, Spinner } from 'react-bootstrap';
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Route, Routes, Link, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import fillStar from './assets/star-fill.svg';
import emptyStar from './assets/star.svg';
import trash from './assets/trash.svg';
import person_circle from './assets/person-circle.svg';
import collectionplay from './assets/collection-play.svg';
import pencil from './assets/pencil.svg';
import { LibraryContext, selectors, filmLibrary } from './LibraryContext';
import { Film, FilmLibrary, createFilmWithModification } from './Classes';
import { getAllFilms, getFilmsFiltered } from './Api';

let filter = selectors["all"];

function getFilterByUrl() {
    const loc = useLocation();
    const filterRegex = /\/filter\/(?<name>.*)/g;
    const res = [...loc.pathname.matchAll(filterRegex)];

    if (res.length !== 1) {
        // use old filter if page is not a filter page
        return filter;
    } else {
        // update filter and return new filter
        filter = selectors[res[0].groups.name];
        return filter;
    }
}

function MyHeader(props) {
    const onSearch = props.onSearch;
    const setShowOffcanvas = props.setShowOffcanvas;
    return (
        <header>
            <Navbar variant="dark" bg="primary">
                <Container fluid className="d-flex justify-content-between">
                    <Navbar.Brand className="p-2 d-flex">
                        <img style={{ width: "1.7em", height: "1.7em" }} className="hide-on-small-screen filter-white img-fluid p-2" src={collectionplay} />
                        <Container className="hide-on-small-screen">Film Library</Container>
                        <Button onClick={() => setShowOffcanvas(true)} className="hide-on-large-screen" style={{ backgroundColor: "rgb(9, 76, 176)" }}>
                            <span className="navbar-toggler-icon"></span>
                        </Button>
                    </Navbar.Brand>
                    <Container fluid className="d-flex flex-fill justify-content-center hide-on-small-screen">
                        <input
                            className="form-control me-2"
                            style={{ width: "30%" }}
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            onInput={(e) => onSearch(e.target.value)}
                        />
                    </Container>
                    <Navbar.Brand className="p-2 d-flex">
                        <Container className="hide-on-large-screen">Film Library</Container>
                    </Navbar.Brand>
                    <Nav className="p-2">
                        <Nav.Item>
                            <img style={{ width: "2.2em", height: "2.2em" }} className="filter-white img-fluid" src={person_circle} />
                        </Nav.Item>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    );
}

function AddFilmForm() {
    const [validated, setValidated] = useState(false);
    const { _, updateLibrary } = useContext(LibraryContext);
    const navigate = useNavigate();

    const [filmName, setFilmName] = useState("");
    const [filmFavorite, setFilmFavourite] = useState(false);
    const [filmWatchDate, setFilmDate] = useState(null);
    const [filmRating, setFilmRating] = useState("");

    const addFilmCallback = (film) => {
        updateLibrary((library) => {
            return FilmLibrary.from([...library.films, film])
        });
    }

    const wrapSetter = (setter) => {
        return (event) => { setter(event.target.value); }
    };

    const handleHide = () => {
        setValidated(false);
        navigate("/");
    };

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            const newFilm = new Film(filmName, filmFavorite, filmWatchDate === "" ? null : filmWatchDate, filmRating);
            addFilmCallback(newFilm);
            form.reset();
            navigate("/");
        }
        setValidated(true);
    };
    return (
        <>
            <h1>Add new film</h1>
            <Form className="p-2 pb-0" noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Control className="mb-2" type="input" onChange={wrapSetter(setFilmName)} placeholder="Film title" required></Form.Control>
                <InputGroup className="mb-3">
                    <Form.Control type="number" min="0" max="5" onChange={wrapSetter(setFilmRating)} placeholder="Rating (1-5)"></Form.Control>
                    <InputGroup.Checkbox label="Favorite" onChange={wrapSetter(setFilmFavourite)} aria-label="Favorite" />
                </InputGroup>
                <Form.Control className="mb-2" onChange={wrapSetter(setFilmDate)} type="date"></Form.Control>
                <Form.Control.Feedback type="invalid">
                    Please enter a film title.
                </Form.Control.Feedback>
                <Container fluid className="d-flex justify-content-evenly pt-2">
                    <Button variant="secondary" onClick={handleHide}>Close</Button>
                    <Button type="submit" variant="primary">Add new film</Button>
                </Container>
            </Form>
        </>
    )
}

function ModifyFilmForm() {
    const [validated, setValidated] = useState(false);
    const { filmId } = useParams();
    const intFilmId = parseInt(filmId);
    const { library, updateLibrary } = useContext(LibraryContext);
    const film = library.getFilmById(intFilmId);
    if (isNaN(intFilmId) || film === undefined) {
        return <>
            <h1>Invalid film id</h1>
            <Link to="/">
                <Button className="btn-sm" variant="primary">
                    Back to home
                </Button>
            </Link>
        </>
    }
    const navigate = useNavigate();
    let filmTitle = film.title;
    let filmFavorite = film.favorite;
    let filmWatchDate = film.watchDate;
    let filmScore = film.score;
    const modifyFilmCallback = (id, film) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from(oldLibrary.films.map((old_film) => {
                if (old_film.id === id) {
                    return film;
                } else {
                    return old_film;
                }
            }));
        })
    };

    const setFilmTitle = (title) => {
        filmTitle = title;
    };
    const setFilmFavorite = (favorite) => {
        filmFavorite = favorite;
    };
    const setFilmDate = (date) => {
        filmWatchDate = date;
    };
    const setFilmScore = (score) => {
        filmScore = score;
    };

    const setFilmDateWrapper = (date) => {
        if (date === null || date === "") {
            setFilmDate(null);
        } else {
            setFilmDate(dayjs(date));
        }
    };

    const wrapSetter = (setter) => {
        return (event) => {
            if (event.target.type === "checkbox") {
                setter(event.target.checked);
            } else {
                setter(event.target.value);
            }
        }
    };

    const handleHide = () => {
        setValidated(false);
        navigate("/");
    };

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            const newFilm = new Film(filmTitle, filmFavorite, filmWatchDate === "" ? null : filmWatchDate, filmScore);
            modifyFilmCallback(Number.parseInt(filmId), newFilm);
            form.reset();
            navigate("/");
        }
        setValidated(true);
    };
    return (
        <>
            <h1>Modify film</h1>
            <Form className="p-2 pb-0" noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Control className="mb-2" type="input" onChange={wrapSetter(setFilmTitle)} placeholder="Film title" defaultValue={filmTitle} required></Form.Control>
                <InputGroup className="mb-3">
                    <Form.Control type="number" min="0" max="5" onChange={wrapSetter(setFilmScore)} placeholder="Rating (1-5)" defaultValue={filmScore}></Form.Control>
                    <InputGroup.Checkbox label="Favorite" onChange={wrapSetter(setFilmFavorite)} aria-label="Favorite" defaultChecked={filmFavorite} />
                </InputGroup>
                <Form.Control className="mb-2" onChange={wrapSetter(setFilmDateWrapper)} defaultValue={filmWatchDate === null ? "" : filmWatchDate.format("YYYY-MM-DD")} type="date"></Form.Control>
                <Form.Control.Feedback type="invalid">
                    Please enter a film title.
                </Form.Control.Feedback>
                <Container fluid className="d-flex justify-content-evenly pt-2">
                    <Button variant="secondary" onClick={handleHide}>Close</Button>
                    <Button type="submit" variant="primary">Save modifications</Button>
                </Container>
            </Form>
        </>
    )
}

function MyFooter() {
    const loc = useLocation();
    const isAddPage = loc.pathname === "/add";
    const isModifyPage = loc.pathname.startsWith("/modify");
    if (isAddPage || isModifyPage) {
        return null;
    }
    return (
        <Link to='/add'>
            <Button variant="primary" className="btn-lg round-button fixed-bottom-right">&#xFF0B;</Button>
        </Link>
    );
}

function MyRow(props) {
    const [film, setFilm] = useState(props.film);
    const deleteFilm = props.deleteHandler;
    const updateFavouriteCallback = props.updateFavouriteHandler;
    const updateScoreCallback = props.updateScoreHandler;

    const updateScore = (score) => {
        setFilm((oldFilm) => {
            return createFilmWithModification(oldFilm, { score: score });
        });
        updateScoreCallback(score);
    };
    const updateFavourite = () => {
        setFilm((oldFilm) => {
            return createFilmWithModification(oldFilm, { favorite: !oldFilm.favorite });
        });
        updateFavouriteCallback();
    }

    const createRating = () => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            const filled = film.score === null ? false : i <= film.score;
            let elem = <img key={`${film.id}_rating_${i}`} src={filled ? fillStar : emptyStar} onClick={() => updateScore(i)} />;
            stars.push(elem);
        }
        return stars;
    }
    return (
        <tr>
            <td>
                <div style={film.favorite ? { color: "red" } : {}}>
                    <Button className="btn-sm" variant="danger" onClick={deleteFilm}>
                        <img src={trash} className="filter-white align-center" style={{ paddingBottom: "0.2em" }} />
                    </Button>
                    {' '}
                    <Link to={`/modify/${film.id}`}>
                        <Button className="btn-sm" variant="primary">
                            <img src={pencil} className="filter-white align-center" style={{ paddingBottom: "0.2em" }} />
                        </Button>
                    </Link>
                    {' ' + film.title}
                </div>
            </td>
            <td>
                <div>
                    <Form.Check type="checkbox" label="Favorite" checked={film.favorite} onChange={updateFavourite} />
                </div>
            </td>
            <td>
                {film.watchDate === null ? "Not watched" : film.watchDate.format('MMMM DD, YYYY')}
            </td>
            <td>
                <div className="rating">
                    {createRating()}
                </div>
            </td>
        </tr>
    );
}

function ErrorModal(props) {
    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>{props.message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function MyTable(props) {
    const { library, updateLibrary } = useContext(LibraryContext);
    const searchTerm = props.searchTerm;
    const filter = getFilterByUrl();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);

    async function populateState(filter) {
        setLoading(true);
        try {
            updateLibrary(FilmLibrary.from([]));
            const q = await getFilmsFiltered(filter.urlfriendlyname);
            updateLibrary(FilmLibrary.fromJSON(q));
        } catch (e) {
            setError(true);
            setErrorMessage(e.message);
        }
        setLoading(false);
    }

    useEffect(() => {
        populateState(filter);
    }, [filter.name]);

    const deleteRow = (id) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from(oldLibrary.films.filter((film) => film.id !== id));
        });
    }

    const updateFilm = (id, film) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from(oldLibrary.films.map((oldFilm) => {
                if (oldFilm.id === id) {
                    return film;
                } else {
                    return oldFilm;
                }
            }));
        });
    };

    const updateFavouriteFilm = (id) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from(oldLibrary.films.map((film) => {
                if (film.id === id) {
                    return createFilmWithModification(film, { favorite: !film.favorite });
                } else {
                    return film;
                }
            }));
        })
    };

    const updateScoreFilm = (id, score) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from(oldLibrary.films.map((film) => {
                if (film.id === id) {
                    return createFilmWithModification(film, { score: score });
                } else {
                    return film;
                }
            }));
        })
    };

    const filterBySearch = (film) => {
        if (searchTerm === null || searchTerm === "") {
            return true;
        }
        return film.title.toLowerCase().includes(searchTerm.toLowerCase());
    };

    return (
        <>
            {error && <ErrorModal message={errorMessage} />}
            <h1>{filter.name}</h1>
            {loading && <Spinner animation="border" />}
            <Table>
                {/* <Table striped bordered hover> */}
                <tbody>
                    {library.films.filter(filterBySearch).map((film) =>
                        <MyRow film={film} key={film.id}
                            deleteHandler={() => deleteRow(film.id)}
                            updateFavouriteHandler={() => updateFavouriteFilm(film.id)}
                            updateScoreHandler={(score) => updateScoreFilm(film.id, score)}
                            updateFilmHandler={(newFilm) => updateFilm(film.id, newFilm)}
                        />)
                    }
                </tbody>
            </Table>
        </>
    )
}

function FilterSelector() {

    const filter = getFilterByUrl();

    const navigate = useNavigate();
    const makeListItem = (selector) => {
        let groupItem = null;
        let url = `/filter/${selector.urlfriendlyname}`;
        if (selector.name === filter.name) {
            groupItem = <ListGroup.Item className="color-grey" key={selector.name} action active onClick={() => navigate(url)}>
                {selector.name}
            </ListGroup.Item>
        } else {
            groupItem = <ListGroup.Item className="color-grey" key={selector.name} action onClick={() => navigate(url)}>
                {selector.name}
            </ListGroup.Item>
        }
        return groupItem;
    };

    return (
        <ListGroup variant="flush" className="color-grey p-2">
            {Object.values(selectors).map(makeListItem)}
        </ListGroup>
    )
}


function Main(props) {
    const show = props.showOffcanvas;
    const setShow = props.setShowOffcanvas;

    const handleClose = () => setShow(false);

    const filterRoutes = Object.values(selectors).map((selector) => {
        return <Route path={`/filter/${selector.urlfriendlyname}/*`} key={selector.urlfriendlyname} element={<MyTable searchTerm={props.searchTerm} />} />
    });

    return (
        <Container fluid className="full-height">
            <Row className="full-height">
                <Col xs={3} className="color-grey hide-on-small-screen">
                    <FilterSelector />
                </Col>
                <Offcanvas show={show} onHide={handleClose}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Filters</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <FilterSelector />
                    </Offcanvas.Body>
                </Offcanvas>
                <Col>
                    <Routes>
                        <Route path="/add" element={<AddFilmForm />} />
                        <Route path="/modify/:filmId" element={<ModifyFilmForm />} />
                        <Route path="/*" element={<MyTable searchTerm={props.searchTerm} />} />
                        <Route path="/filter/*" element={<MyTable searchTerm={props.searchTerm} />} />
                        {filterRoutes}
                    </Routes>
                </Col>
            </Row>
        </Container>
    );
}

function HomePage(props) {
    return (
        <>
            <MyHeader className="full-height" onSearch={props.setSearchTerm} setShowOffcanvas={props.setShowOffcanvas} />
            <Main searchTerm={props.searchTerm} showOffcanvas={props.showOffcanvas} setShowOffcanvas={props.setShowOffcanvas} />
            <MyFooter />
        </>
    )
}

function MainComponent() {
    const [searchTerm, setSearchTerm] = useState(() => null);
    const [library, updateLibrary] = useState(() => filmLibrary);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    return (
        <Container fluid className="p-0 full-viewport">
            <LibraryContext.Provider value={{ library: library, updateLibrary: updateLibrary }}>
                <HomePage searchTerm={searchTerm} setSearchTerm={setSearchTerm} showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
            </LibraryContext.Provider>
        </Container>
    )
}

export default MainComponent;
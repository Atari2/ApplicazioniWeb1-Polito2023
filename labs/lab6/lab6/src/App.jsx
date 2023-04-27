import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form, Table, ListGroup, Navbar, Nav, InputGroup, Modal, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';
import dayjs from 'dayjs';
import fillStar from './assets/star-fill.svg';
import emptyStar from './assets/star.svg';
import trash from './assets/trash.svg';
import person_circle from './assets/person-circle.svg';
import collectionplay from './assets/collection-play.svg';
import pencil from './assets/pencil.svg';
import './App.css';

class Film {
    constructor(title, favorite = false, watchDate = null, score = null) {
        this.id = FilmLibrary.getNewId();
        this.title = title;
        this.favorite = favorite;
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score})`;
    }

}
function createFilmWithModification(obj, attributes) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), { ...obj, ...attributes });
}
class FilmLibrary {
    static lastID = 0;
    constructor() {
        this.films = [];
    }
    addNewFilm(film) {
        this.films.push(film);
    }
    print() {
        this.films.forEach(film => console.log(film.toString()));
    }
    static from(films) {
        const filmLibrary = new FilmLibrary();
        films.forEach(film => filmLibrary.addNewFilm(film));
        return filmLibrary;
    }
    static getNewId() {
        FilmLibrary.lastID++;
        return FilmLibrary.lastID;
    }
}

class Filter {
    constructor(name, func) {
        this.name = name;
        this.func = func;
    }
    toString() {
        return `Filter(name: ${this.name}, func: ${this.func})`;
    }
    apply(arrayLike) {
        return Array.prototype.filter.call(arrayLike, this.func)
    }
}

const filmLibrary = new FilmLibrary();
const selectors = {
    ALL:  new Filter("All", (_) => true),
    FAVORITE: new Filter("Favorites", (film) => film.favorite),
    BEST_RATER: new Filter("Best Rated", (film) => film.score >= 5),
    SEEN_LAST_MONTH: new Filter("Seen Last Month", (film) => film.watchDate !== null && film.watchDate.isAfter(dayjs().subtract(1, 'month'))),
    UNSEEN: new Filter("Unseen", (film) => film.watchDate === null)
};
filmLibrary.addNewFilm(new Film("Pulp Fiction", true, "March 10, 2023", 5));
filmLibrary.addNewFilm(new Film("21 Grams", true, "March 17, 2023", 4));
filmLibrary.addNewFilm(new Film("Star Wars", false));
filmLibrary.addNewFilm(new Film("Matrix", false));
filmLibrary.addNewFilm(new Film("Shrek", false, "March 21, 2023", 3));

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
                        <Button onClick={() => setShowOffcanvas(true)} className="hide-on-large-screen" style={{backgroundColor: "rgb(9, 76, 176)"}}>
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

function AddFilmForm(props) {
    const show = props.show;
    const onHide = props.onHide;
    const [validated, setValidated] = useState(false);

    const [filmName, setFilmName] = useState("");
    const [filmFavorite, setFilmFavourite] = useState(false);
    const [filmWatchDate, setFilmDate] = useState(null);
    const [filmRating, setFilmRating] = useState("");

    const wrapSetter = (setter) => {
        return (event) => { setter(event.target.value); }
    };

    const handleHide = () => {
        setValidated(false);
        onHide();
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
        }
        setValidated(true);
    };
    return (
        <Modal show={show} onHide={handleHide}>
            <Modal.Header closeButton>
                <Modal.Title>Add new film</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="p-2 pb-0" noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Control className="mb-2" type="input" onChange={wrapSetter(setFilmName)} placeholder="Film title" required></Form.Control>
                    <InputGroup className="mb-3">
                        <Form.Control type="number" min="0" max="5" onChange={wrapSetter(setFilmRating)} placeholder="Rating (1-5)"></Form.Control>
                        <InputGroup.Checkbox label="Favorite" onChange={wrapSetter(setFilmFavourite)} aria-label="Favorite"/>
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
            </Modal.Body>
        </Modal>
    )
}

function ModifyFilmForm(props) {
    const show = props.show;
    const onHide = props.onHide;
    const [validated, setValidated] = useState(false);
    let filmTitle = props.film.title;
    let filmFavorite = props.film.favorite;
    let filmWatchDate = props.film.watchDate;
    let filmScore = props.film.score;
    const modifyFilmCallback = props.modifyFilmCallback;

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
        onHide();
    };

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            const newFilm = new Film(filmTitle, filmFavorite, filmWatchDate === "" ? null : filmWatchDate, filmScore);
            modifyFilmCallback(newFilm);
            form.reset();
        }
        setValidated(true);
    };
    return (
        <Modal show={show} onHide={handleHide}>
            <Modal.Header closeButton>
                <Modal.Title>Modify film</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="p-2 pb-0" noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Control className="mb-2" type="input" onChange={wrapSetter(setFilmTitle)} placeholder="Film title" defaultValue={filmTitle} required></Form.Control>
                    <InputGroup className="mb-3">
                        <Form.Control type="number" min="0" max="5" onChange={wrapSetter(setFilmScore)} placeholder="Rating (1-5)" defaultValue={filmScore}></Form.Control>
                        <InputGroup.Checkbox label="Favorite" onChange={wrapSetter(setFilmFavorite)} aria-label="Favorite" defaultChecked={filmFavorite}/>
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
            </Modal.Body>
        </Modal>
    )
}

function MyFooter(props) {
    const addFilmCallback = props.addFilmCallback;
    const [show, setShow] = useState(false);

    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(!show);

    const addFilmCallbackAdder = (film) => {
        addFilmCallback(film);
        handleClose();
    };

    if (show) {
        return (<Container>
            <AddFilmForm addFilmCallback={addFilmCallbackAdder} show={show} onHide={handleClose}/>
        </Container>
        );
    } else {
        return (
            <Container>
                <AddFilmForm addFilmCallback={addFilmCallbackAdder} show={show} onHide={handleClose}/>
                <Button variant="primary" className="btn-lg round-button fixed-bottom-right" onClick={ () => handleShow() }>&#xFF0B;</Button>
            </Container>
        );
    }
}

function MyRow(props) {
    const [film, setFilm] = useState(props.film);
    const [show, setShow] = useState(false);
    const deleteFilm = props.deleteHandler;
    const updateFavouriteCallback = props.updateFavouriteHandler;
    const updateScoreCallback = props.updateScoreHandler;
    const updateFilmCallback = props.updateFilmHandler;

    const handleClose = () => setShow(!show);

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
    const updateFilm = (film) => {
        setFilm((_) => film);
        updateFilmCallback(film);
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
                    { ' ' }
                    <ModifyFilmForm modifyFilmCallback={updateFilm} film={film} show={show} onHide={handleClose}/>
                    <Button className="btn-sm" variant="primary" onClick={() => handleClose()}>
                        <img src={pencil} className="filter-white align-center" style={{ paddingBottom: "0.2em" }} />
                    </Button>
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

function MyTable(props) {
    const library = props.library;
    const updateLibrary = props.updateLibrary;
    const searchTerm = props.searchTerm;
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
        <Table>
            {/* <Table striped bordered hover> */}
            <tbody>
                {props.filter.apply(library.films.filter(filterBySearch)).map((film) =>
                    <MyRow film={film} key={film.id} 
                        deleteHandler={() => deleteRow(film.id)} 
                        updateFavouriteHandler={() => updateFavouriteFilm(film.id)}
                        updateScoreHandler={(score) => updateScoreFilm(film.id, score)}
                        updateFilmHandler={(newFilm) => updateFilm(film.id, newFilm)}
                    />)
                }
            </tbody>
        </Table>
    )
}

function FilterSelector(props) {
    const onFilterChange = props.onFilterChange;

    const makeListItem = (selector) => {
        if (selector.name === props.currentFilter.name) {
            return <ListGroup.Item key={selector.name} className="color-grey" action active onClick={() => onFilterChange(selector)}>
                {selector.name}
            </ListGroup.Item>
        } else {
            return <ListGroup.Item key={selector.name} className="color-grey" action onClick={() => onFilterChange(selector)}>
                {selector.name}
            </ListGroup.Item>
        }
    };

    return (
        <ListGroup variant="flush" className="color-grey p-2">
            {Object.values(selectors).map(makeListItem)}
        </ListGroup>
    )
}


function Main(props) {
    const [filter, setFilter] = useState(selectors.ALL);
    const show = props.showOffcanvas;
    const setShow = props.setShowOffcanvas;

    const handleClose = () => setShow(false);

    return (
        <Container fluid className="full-height">
            <Row className="full-height">
                <Col xs={3} className="color-grey hide-on-small-screen">
                    <FilterSelector currentFilter={filter} onFilterChange={setFilter} />
                </Col>
                <Offcanvas show={show} onHide={handleClose}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Filters</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <FilterSelector currentFilter={filter} onFilterChange={setFilter} />
                    </Offcanvas.Body>
                </Offcanvas>
                <Col>
                    <h1>{filter.name}</h1>
                    <MyTable library={props.library} updateLibrary={props.updateLibrary} filter={filter} searchTerm={props.searchTerm} />
                </Col>
            </Row>
        </Container>
    );
}

function App() {
    const [searchTerm, setSearchTerm] = useState(() => null);
    const [library, updateLibrary] = useState(filmLibrary);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const addFilmCallback = (film) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from([...oldLibrary.films, film]);
        });
    };
    return (
        <Container fluid className="p-0 full-viewport">
            <MyHeader className="full-height" onSearch={setSearchTerm} setShowOffcanvas={setShowOffcanvas}/>
            <Main searchTerm={searchTerm} library={library} updateLibrary={updateLibrary} showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas}/>
            <MyFooter addFilmCallback={addFilmCallback}/>
        </Container>
    )
}

export default App

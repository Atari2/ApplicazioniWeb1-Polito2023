import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form, Table, ListGroup, Navbar, Nav, InputGroup, Modal, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';
import dayjs from 'dayjs';
import fillStar from './assets/star-fill.svg';
import emptyStar from './assets/star.svg';
import trash from './assets/trash.svg';
import person_circle from './assets/person-circle.svg';
import collectionplay from './assets/collection-play.svg';
import './App.css';

class Film {
    constructor(id, title, favorite = false, watchDate = null, score = null) {
        this.id = id;
        this.title = title;
        this.favorite = favorite;
        this.watchDate = watchDate === null ? null : dayjs(watchDate);
        this.score = score;
    }
    toString() {
        return `Film(id: ${this.id}, title: ${this.title}, favorite: ${this.favorite}, watch date: ${this.watchDate === null ? "<not watched>" : this.watchDate.format('MMMM DD, YYYY')}, score: ${this.score === null ? "<not assigned>" : this.score})`;
    }

}
class FilmLibrary {
    constructor() {
        this.films = [];
    }
    addNewFilm(film) {
        this.films.push(film);
    }
    print() {
        this.films.forEach(film => console.log(film.toString()));
    }
}

const filmLibrary = new FilmLibrary();
const selectors = {
    "A": { index: 0, func: (_) => true, fullname: "All" },
    "FV": { index: 1, func: (film) => film.favorite, fullname: "Favorites" },
    "BR": { index: 2, func: (film) => film.score !== null && film.score >= 4, fullname: "Best Rated" },
    "SLM": { index: 3, func: (film) => film.watchDate !== null && film.watchDate.isAfter(dayjs().subtract(1, 'month')), fullname: "Seen Last Month" },
    "U": { index: 4, func: (film) => film.watchDate === null, fullname: "Unseen" }
};
filmLibrary.addNewFilm(new Film(1, "Pulp Fiction", true, "March 10, 2023", 5));
filmLibrary.addNewFilm(new Film(2, "21 Grams", true, "March 17, 2023", 4));
filmLibrary.addNewFilm(new Film(3, "Star Wars", false));
filmLibrary.addNewFilm(new Film(4, "Matrix", false));
filmLibrary.addNewFilm(new Film(5, "Shrek", false, "March 21, 2023", 3));

function MyHeader(props) {
    const onSearch = props.onSearch;
    const setShowOffcanvas = props.setShowOffcanvas;
    return (
        <header>
            <Navbar className="navbar-dark bg-primary">
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
    const addFilmCallback = props.addFilmCallback;

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
            const new_date = form.elements["new-film-watch-date"].value === "" ? null : form.elements["new-film-watch-date"].value;
            const newFilm = new Film(0, form.elements["new-film-title"].value, form.elements["new-film-fav"].checked, new_date, form.elements["new-film-rating"].value);
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
                    <Form.Control className="mb-2" type="input" id="new-film-title" placeholder="Film title" required></Form.Control>
                    <InputGroup className="mb-3">
                        <Form.Control type="number" min="0" max="5" id="new-film-rating" placeholder="Rating (1-5)"></Form.Control>
                        <InputGroup.Checkbox label="Favorite" id="new-film-fav" aria-label="Favorite"/>
                    </InputGroup>
                    <Form.Control className="mb-2" id="new-film-watch-date" type="date"></Form.Control>
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

function MyFooter(props) {
    const addFilmCallback = props.addFilmCallback;
    const [show, setShow] = useState(false);

    
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(!show);

    const addFilmCallbackAdder = (film) => {
        addFilmCallback(film);
        handleClose();
    };

    return (
        <Container>
            <AddFilmForm addFilmCallback={addFilmCallbackAdder} show={show} onHide={handleClose}/>
            <Button variant="primary" className="btn-lg round-button fixed-bottom-right" onClick={ () => handleShow() }>&#xFF0B;</Button>
        </Container>
    );
}

function MyRow(props) {
    const [film, setFilm] = useState(props.film);
    const deleteFilm = props.deleteHandler;
    const updateFavouriteCallback = props.updateFavouriteHandler;
    const updateScoreCallback = props.updateScoreHandler;

    const updateScore = (score) => {
        setFilm((oldFilm) => {
            return {...oldFilm, score: score };
        });
        updateScoreCallback(score);
    };
    const updateFavourite = () => {
        setFilm((oldFilm) => {
            return {...oldFilm, favorite: !oldFilm.favorite };
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
                    {' ' + film.title}
                </div>
            </td>
            <td>
                <div>
                    <input type="checkbox" defaultChecked={film.favorite} id="Favorite" label="Favorite" onClick={() => updateFavourite()} />
                    <label htmlFor="Favorite">Favorite</label>
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
    const list = props.listOfFilms;
    const setList = props.setFilms;
    const searchTerm = props.searchTerm;
    const deleteRow = (id) => {
        setList((oldList) => {
            return oldList.filter((film) => film.id !== id);
        });
    }
    const updateFavouriteFilm = (id) => {
        setList((oldList) => {
            return oldList.map((film) => {
                if (film.id === id) {
                    return { ...film, favorite: !film.favorite };
                } else {
                    return film;
                }
            });
        })
    };

    const updateScoreFilm = (id, score) => {
        setList((oldList) => {
            return oldList.map((film) => {
                if (film.id === id) {
                    return { ...film, score: score };
                } else {
                    return film;
                }
            });
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
                {list.filter(filterBySearch).filter(props.filter.func).map((film) =>
                    <MyRow film={film} key={film.id} 
                        deleteHandler={() => deleteRow(film.id)} 
                        updateFavouriteHandler={() => updateFavouriteFilm(film.id)}
                        updateScoreHandler={(score) => updateScoreFilm(film.id, score)}
                    />)
                }
            </tbody>
        </Table>
    )
}

function FilterSelector(props) {
    const onFilterChange = props.onFilterChange;

    const makeListItem = (selector) => {
        if (selector.index === props.currentFilter.index) {
            return <ListGroup.Item key={selector.fullname} className="color-grey" action active onClick={() => onFilterChange(selector)}>
                {selector.fullname}
            </ListGroup.Item>
        } else {
            return <ListGroup.Item key={selector.fullname} className="color-grey" action onClick={() => onFilterChange(selector)}>
                {selector.fullname}
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
    const [filter, setFilter] = useState(() => selectors.A);
    const show = props.showOffcanvas;
    const setShow = props.setShowOffcanvas;

    const updateFilter = (filter) => {
        setFilter((_) => {
            return filter;
        })
    };

    const handleClose = () => setShow(false);

    return (
        <Container fluid className="full-height">
            <Row className="full-height">
                <Col xs={3} className="color-grey hide-on-small-screen">
                    <FilterSelector currentFilter={filter} onFilterChange={updateFilter} />
                </Col>
                <Offcanvas show={show} onHide={handleClose}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Filters</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <FilterSelector currentFilter={filter} onFilterChange={updateFilter} />
                    </Offcanvas.Body>
                </Offcanvas>
                <Col>
                    <h1>{filter.fullname}</h1>
                    <MyTable listOfFilms={props.films} setFilms={props.setFilms} filter={filter} searchTerm={props.searchTerm} />
                </Col>
            </Row>
        </Container>
    );
}

function App() {
    const [searchTerm, setSearchTerm] = useState(() => null);
    const [films, setFilms] = useState(() => filmLibrary.films);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const updateSearchTerm = (term) => {
        setSearchTerm((_) => {
            return term;
        });
    };
    const addFilmCallback = (film) => {
        setFilms((oldList) => {
            return [...oldList, {...film, id: oldList.length + 1}];
        });
    };
    return (
        <Container fluid className="p-0 full-viewport">
            <MyHeader onSearch={updateSearchTerm} setShowOffcanvas={setShowOffcanvas}/>
            <Main searchTerm={searchTerm} films={films} setFilms={setFilms} showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas}/>
            <MyFooter addFilmCallback={addFilmCallback}/>
        </Container>
    )
}

export default App

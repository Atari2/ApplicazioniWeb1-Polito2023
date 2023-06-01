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
import { LibraryContext, selectors, filmLibrary, globalError } from './LibraryContext';
import { Film, FilmLibrary } from './Classes';
import Api from './Api';

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

    const { user, setUser, setError } = useContext(LibraryContext);

    const navigate = useNavigate();

    const logoutButton = <Button className="color-white" style={{width: 'fit-content', whiteSpace: 'nowrap', fontWeight: 'bold'}} onClick={async () => {
        try {
            await Api.logout();
            setUser(null);
            navigate("/auth");
        } catch (e) {
            setError(e.message);
        }
    }}>
        Logout (Logged in as <div style={{color: 'orange', display: 'inline'}}>{user !== null ? user.name : "<unknown>"}</div>)
    </Button>;

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
                            {
                            user !== null ? 
                            logoutButton : 
                            <Link to='/auth'>
                                <img style={{ width: "2.2em", height: "2.2em" }} className="filter-white img-fluid" src={person_circle} />
                            </Link>
                            }
                        </Nav.Item>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    );
}

function LoadingModal(props) {
    return (
        <Modal show={true} size="sm" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Title id="contained-modal-title-vcenter" className="center-text">
                {props.message}
            </Modal.Title>
            <Modal.Body className="center-text">
                <Spinner animation="border" role="status" />
            </Modal.Body>
        </Modal>
    )
}

function AddFilmForm() {

    const { setError } = useContext(LibraryContext);

    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const [filmName, setFilmName] = useState("");
    const [filmFavorite, setFilmFavourite] = useState(false);
    const [filmWatchDate, setFilmDate] = useState(null);
    const [filmRating, setFilmRating] = useState("");
    const [adding, setAdding] = useState(false);

    const addFilmCallback = async (film) => {
        setAdding(true);
        await Api.addFilm(film);
        setAdding(false);
    }

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

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            const newFilm = new Film(0, filmName, filmFavorite, filmWatchDate === "" ? null : filmWatchDate, filmRating);
            try {
                await addFilmCallback(newFilm);
                form.reset();
                navigate("/");
            } catch (e) {
                setAdding(false);
                setError({ isError: true, message: e.message });
            }
        }
        setValidated(true);
    };
    return (
        <>
            <h1>Add new film</h1>
            {adding && <LoadingModal message={'Adding film...'} />}
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
    const { library, setError } = useContext(LibraryContext);
    const film = library.getFilmById(intFilmId);
    const [modifying, setModifying] = useState(false);

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
    const modifyFilmCallback = async (id, film) => {
        setModifying(true);
        await Api.modifyFilm(id, film);
        setModifying(false);
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

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            const newFilm = new Film(film.id, filmTitle, filmFavorite, filmWatchDate === "" ? null : filmWatchDate, filmScore);
            try {
                await modifyFilmCallback(Number.parseInt(filmId), newFilm);
                form.reset();
                navigate("/");
            } catch (e) {
                setModifying(false);
                setError({ isError: true, message: e.message });
            }
        }
        setValidated(true);
    };
    return (
        <>
            <h1>Modify film</h1>
            {modifying && <LoadingModal message={'Modifying film...'} />}
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
    const { user } = useContext(LibraryContext);
    if (isAddPage || isModifyPage || (user === null)) {
        return null;
    }
    return (
        <Link to='/add'>
            <Button variant="primary" className="btn-lg round-button fixed-bottom-right">&#xFF0B;</Button>
        </Link>
    );
}

function MyRow(props) {
    const film = props.film;
    const deleteFilm = props.deleteHandler;
    const updateFavouriteCallback = props.updateFavouriteHandler;
    const updateScoreCallback = props.updateScoreHandler;

    const updateScore = (score) => {
        if (score === film.score || props.disableButtons) {
            return;
        }
        updateScoreCallback(score);
    };
    const updateFavourite = () => {
        if (props.disableButtons) {
            return;
        }
        updateFavouriteCallback();
    }
    const deleteFilmBtn = () => {
        if (props.disableButtons) {
            return;
        }
        deleteFilm();
    }
    const onModifyClick = (e) => {
        if (props.disableButtons) {
            e.preventDefault();
        }
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
        <tr className={ (props.deleting ? "pending-deletion" : "") + " " + (props.modifying ? "pending-modification" : "") }>
            <td>
                <div style={film.favorite ? { color: "red" } : {}}>
                    <Button className="btn-sm" variant="danger" onClick={deleteFilmBtn} disabled={props.disableButtons}>
                        <img src={trash} className="filter-white align-center" style={{ paddingBottom: "0.2em" }} />
                    </Button>
                    {' '}
                    <Link to={`/modify/${film.id}`} onClick={onModifyClick}>
                        <Button className="btn-sm" variant="primary" disabled={props.disableButtons}>
                            <img src={pencil} className="filter-white align-center" style={{ paddingBottom: "0.2em" }} />
                        </Button>
                    </Link>
                    {' ' + film.title}
                </div>
            </td>
            <td>
                <div>
                    <Form.Check type="checkbox" label="Favorite" defaultChecked={film.favorite} onChange={updateFavourite} disabled={props.disableButtons}/>
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
    const handleClose = () => {
        setShow(false);
        props.clearError();
    };

    const getDisplayError = () => {
        console.log(props.error.message);
        if (typeof props.error.message === 'string') {
            return props.error.message;
        }
        return JSON.stringify(props.error.message);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>{getDisplayError()}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

function MyTable(props) {
    const { library, updateLibrary, setError, user, setUser } = useContext(LibraryContext);
    const searchTerm = props.searchTerm;
    const filter = getFilterByUrl();
    const { loading, setLoading } = props;
    const [deleting, setDeleting] = useState(NaN);
    const [modifying, setModifying] = useState(NaN);
    const [pendingModification, setPendingModification] = useState(false);

    async function populateState(filter) {
        if (user === null) {
            return;
        }
        const dehydrate = isNaN(deleting) && isNaN(modifying);
        if (dehydrate) {
            setLoading(true);
            try {
                updateLibrary(FilmLibrary.from([]));
                const q = await Api.getFilmsFiltered(filter.urlfriendlyname);
                updateLibrary(FilmLibrary.fromJSON(q, user.id));
            } catch (e) {
                setError({ message: e.message, isError: true });
            }
            setLoading(false);
        } else {
            try {
                const q = await Api.getFilmsFiltered(filter.urlfriendlyname);
                updateLibrary(FilmLibrary.fromJSON(q, user.id));
            } catch (e) {
                setError({ message: e.message, isError: true });
            }
            setDeleting(NaN);
            setModifying(NaN);
        }
    }

    useEffect(() => {
        if (pendingModification || loading) {
            // if we're not pending a modification and we're not loading, we can populate the state
            populateState(filter);
        }
        setPendingModification(false);
    }, [pendingModification]);

    useEffect(() => {
        populateState(filter);
    }, [filter.name]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await Api.getSessionInfo();
                setUser(user);
                setPendingModification(true);
            } catch (e) {
                console.log(e.message);
            }
        };
        if (user === null)
            checkAuth();
    }, []);

    const deleteRow = async (id) => {
        setDeleting(id);
        try {
            await Api.deleteFilm(id);
        } catch (e) {
            setError({ message: e.message, isError: true });
        }
        setPendingModification(true);
    }

    const updateFavouriteFilm = async (id, favorite) => {
        setModifying(id);
        try {
            await Api.setFilmFavorite(id, favorite);
        } catch (e) {
            setError({ message: e.message, isError: true });
        }
        setPendingModification(true);
    };

    const updateScoreFilm = async (id, score) => {
        setModifying(id);
        try {
            await Api.setFilmScore(id, score);
        } catch (e) {
            setError({ message: e.message, isError: true });
        }
        setPendingModification(true);
    };

    const filterBySearch = (film) => {
        if (searchTerm === null || searchTerm === "") {
            return true;
        }
        return film.title.toLowerCase().includes(searchTerm.toLowerCase());
    };

    if (user === null) {
        return <>
            <Container fluid className='center-text center-items'>
                <h1>Log in to see the films</h1>
                <Button>
                    <Link to="/auth" className="color-white">Login</Link>
                </Button>
            </Container>
        </>;
    }

    return (
        <>
            <h1>{filter.name}</h1>
            <Container className='center-text'>
                {loading && <Spinner animation="border" />}
            </Container>
            <Table>
                {/* <Table striped bordered hover> */}
                <tbody>
                    {library.films.filter(filterBySearch).map((film) =>
                        <MyRow film={film} key={film.id}
                            disableButtons={loading || deleting || modifying || pendingModification || (user === null)}
                            deleting={deleting === film.id}
                            modifying={modifying === film.id}
                            deleteHandler={() => deleteRow(film.id)}
                            updateFavouriteHandler={() => updateFavouriteFilm(film.id, !film.favorite)}
                            updateScoreHandler={(score) => updateScoreFilm(film.id, score)}
                        />)
                    }
                </tbody>
            </Table>
        </>
    )
}

function FilterSelector(props) {
    const { user } = useContext(LibraryContext);
    const loading = props.loading;
    const filter = getFilterByUrl();

    const navigateIfNotLoading = (url) => {
        if (!loading && user !== null) {
            navigate(url);
        }
    };

    const navigate = useNavigate();
    const makeListItem = (selector) => {
        let groupItem = null;
        let url = `/filter/${selector.urlfriendlyname}`;
        if (selector.name === filter.name) {
            groupItem = <ListGroup.Item className="color-grey" key={selector.name} action active onClick={() => navigateIfNotLoading(url)}>
                {selector.name}
            </ListGroup.Item>
        } else {
            groupItem = <ListGroup.Item className="color-grey" key={selector.name} action onClick={() => navigateIfNotLoading(url)}>
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

function AuthForm() {
    const { setError, user, setUser } = useContext(LibraryContext);
    const [email, setEmail] = useState("testuser@polito.it");
    const [password, setPassword] = useState("password");
    const [logging, setLogging] = useState(false);
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    const handleHide = () => {
        setValidated(false);
        navigate("/");
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {;
            try {
                setLogging(true);
                const user = await Api.login(email, password);
                setLogging(false);
                setUser(user);
                form.reset();
                navigate("/");
            } catch (e) {
                setLogging(false);
                setError({ isError: true, message: e.message });
            }
        }
        setValidated(true);
    };

    if (user !== null) {
        return (<h1>{setTimeout(() => navigate("/"), 1000) || "Already logged in..."}</h1>);
    }
    return (
        <>
            <h1>Login</h1>
            {logging && <LoadingModal message={'Logging in...'} />}
            <Form className="p-2 pb-0" noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Control className="mb-2" type="email" onChange={wrapSetter(setEmail)} placeholder="User email" defaultValue={email} required></Form.Control>
                <Form.Control className="mb-2" type="password" onChange={wrapSetter(setPassword)} placeholder="Password" defaultValue={password} required></Form.Control>
                <Form.Control.Feedback type="invalid">
                    Please enter a valid email and/or a password.
                </Form.Control.Feedback>
                <Container fluid className="d-flex justify-content-evenly pt-2">
                    <Button variant="secondary" onClick={handleHide}>Close</Button>
                    <Button type="submit" variant="primary">Login</Button>
                </Container>
            </Form>
        </>
    )
}


function Main(props) {
    const show = props.showOffcanvas;
    const setShow = props.setShowOffcanvas;
    const {user, setUser} = useContext(LibraryContext);

    const [loading, setLoading] = useState(true);

    const handleClose = () => setShow(false);

    const filterRoutes = Object.values(selectors).map((selector) => {
        return <Route path={`/filter/${selector.urlfriendlyname}/*`} key={selector.urlfriendlyname} element={<MyTable loading={loading} setLoading={setLoading} searchTerm={props.searchTerm} />} />
    });

    return (
        <Container fluid className="full-height">
            <Row className="full-height">
                <Col xs={3} className="color-grey hide-on-small-screen">
                    <FilterSelector loading={loading}/>
                </Col>
                <Offcanvas show={show} onHide={handleClose}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Filters</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <FilterSelector loading={loading}/>
                    </Offcanvas.Body>
                </Offcanvas>
                <Col>
                    <Routes>
                        <Route path="/auth" element={<AuthForm />} />
                        <Route path="/add" element={<AddFilmForm />} />
                        <Route path="/modify/:filmId" element={<ModifyFilmForm />} />
                        <Route path="/*" element={<MyTable loading={loading} setLoading={setLoading} searchTerm={props.searchTerm} />} />
                        <Route path="/filter/*" element={<MyTable loading={loading} setLoading={setLoading} searchTerm={props.searchTerm} />} />
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
    const [error, setError] = useState(() => globalError);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [user, setUser] = useState(null);

    const clearError = () => {
        setError({ isError: false, message: "" });
    }

    const contextObject = {
        library: library,
        updateLibrary: updateLibrary,
        error: error,
        setError: setError,
        user: user,
        setUser: setUser
    }

    return (
        <Container fluid className="p-0 full-viewport">
            <LibraryContext.Provider value={contextObject}>
                <HomePage searchTerm={searchTerm} setSearchTerm={setSearchTerm} showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
                {error.isError && <ErrorModal error={error} clearError={clearError} />}
            </LibraryContext.Provider>
        </Container>
    )
}

export default MainComponent;
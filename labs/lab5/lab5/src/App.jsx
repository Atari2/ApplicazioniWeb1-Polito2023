import 'bootstrap/dist/css/bootstrap.min.css';
import { Col, Container, Row, Button, Form, Table, ListGroup } from 'react-bootstrap';
import { useState } from 'react';
import dayjs from 'dayjs';
import fillStar from './assets/star-fill.svg';
import emptyStar from './assets/star.svg';
import trash from './assets/trash.svg';

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
    "A": (_) => true,
    "FV": (film) => film.favorite,
    "BR" : (film) => film.score !== null && film.score >= 4,
    "SLM": (film) => film.watchDate !== null && film.watchDate.isAfter(dayjs().subtract(1, 'month')),
    "U": (film) => film.watchDate === null
};
filmLibrary.addNewFilm(new Film(1, "Pulp Fiction", true, "March 10, 2023", 5));
filmLibrary.addNewFilm(new Film(2, "21 Grams", true, "March 17, 2023", 4));
filmLibrary.addNewFilm(new Film(3, "Star Wars", false));
filmLibrary.addNewFilm(new Film(4, "Matrix", false));
filmLibrary.addNewFilm(new Film(5, "Shrek", false, "March 21, 2023", 3));

function MyHeader(props) {
    return (
        <header>
            <h1>{props.appName || "HeapOverrun"}</h1>
        </header>
    );
}


function MyFooter(props) {
    return (<footer>
        <p>&copy; 2023, Applicazioni Web I</p>
        <div id="time"></div>
    </footer>);
}

function MyRow(props) {
    const [film, setFilm] = useState(props.film);
    const deleteFilm = props.deleteHandler;
    const setFavourite = () => {
        setFilm((oldFilm) => {
            return { ...oldFilm, favorite: !oldFilm.favorite };
        })
    }
    const createRating = () => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            const filled = film.score === null ? false : i <= film.score;
            let elem = <img key={`${film.id}_rating_${i}`} src={filled ? fillStar : emptyStar} onClick={() => setFilm((oldFilm) => { return { ...oldFilm, score: i }; })} />;
            stars.push(elem);
        }
        return stars;
    }
    return (
        <tr>
            <td>
                <div style={film.favorite ? { color: "red" } : {}}>
                    <Button onClick={deleteFilm}>
                        <img src={trash}/>
                    </Button>
                    {film.title}
                </div>
            </td>
            <td>
                <div>
                    <input type="checkbox" defaultChecked={film.favorite} id="Favorite" label="Favorite" onClick={() => setFavourite()} />
                    <label htmlFor="Favorite">Favorite</label>
                </div>
            </td>
            <td>
                {film.watchDate === null ? "" : film.watchDate.format('MMMM DD, YYYY')}
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
    const [list, setList] = useState(props.listOfFilms);
    const deleteRow = (id) => {
        setList((oldList) => {
            return oldList.filter((film) => film.id !== id);
        });
    }

    return (
        <Table>
            {/* <Table striped bordered hover> */}
            <tbody>
                {list.filter(props.filter).map((film) =>
                    <MyRow film={film} key={film.id} deleteHandler={() => deleteRow(film.id) }/>)
                }
            </tbody>
        </Table>
    )
}

function FilterSelector(props) {

    const onFilterChange = props.onFilterChange;

    return (
        <ListGroup>
            <ListGroup.Item onClick={() => onFilterChange(selectors.A)}>All</ListGroup.Item>
            <ListGroup.Item onClick={() => onFilterChange(selectors.FV)}>Favorites</ListGroup.Item>
            <ListGroup.Item onClick={() => onFilterChange(selectors.BR)}>Best Rated</ListGroup.Item>
            <ListGroup.Item onClick={() => onFilterChange(selectors.SLM)}>Seen Last Month</ListGroup.Item>
            <ListGroup.Item onClick={() => onFilterChange(selectors.U)}>Unseen</ListGroup.Item>
        </ListGroup>
    )
}


function Main(props) {
    const [filter, setFilter] = useState(() => selectors.A);
    const updateFilter = (filter) => {
        setFilter((_) => {
            return filter;
        })
    };

    return (
    <Container fluid>
        <Row>
            <Col xs={3}>
                <FilterSelector onFilterChange={updateFilter} />
            </Col>
            <Col xs={9}>
                <MyTable listOfFilms={filmLibrary.films} filter={filter}/>
            </Col>
        </Row>
    </Container>
    );
}

function App() {

    return (
        <Container fluid>
            <MyHeader />
            <Main />
            <MyFooter />
        </Container>
    )
}

export default App

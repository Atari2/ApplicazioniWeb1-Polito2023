import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { useState } from 'react';
import { MyHeader, Main, MyFooter } from './Components';
import { LibraryContext, filmLibrary } from './LibraryContext';
import { FilmLibrary } from './Classes';
import './App.css';


function App() {
    const [searchTerm, setSearchTerm] = useState(() => null);
    const [library, updateLibrary] = useState(() => filmLibrary);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const addFilmCallback = (film) => {
        updateLibrary((oldLibrary) => {
            return FilmLibrary.from([...oldLibrary.films, film]);
        });
    };
    return (
        <Container fluid className="p-0 full-viewport">
            <LibraryContext.Provider value={{library: library, updateLibrary: updateLibrary }}>
                <MyHeader className="full-height" onSearch={setSearchTerm} setShowOffcanvas={setShowOffcanvas}/>
                <Main searchTerm={searchTerm} showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas}/>
                <MyFooter addFilmCallback={addFilmCallback}/>
            </LibraryContext.Provider>
        </Container>
    )
}

export default App

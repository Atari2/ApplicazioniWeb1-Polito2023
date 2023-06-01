import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import MainComponent from './Components';
import './App.css';

function App() {

    return (
        <BrowserRouter>
            <MainComponent />
        </BrowserRouter>
    )
}

export default App

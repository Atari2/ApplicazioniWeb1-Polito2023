const URL = 'http://localhost:3000/api';


async function getAllFilms() {
    const response = await fetch(`${URL}/films`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

async function getFilmsFiltered(filter) {
    const response = await fetch(`${URL}/films/filter/${filter}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export { getAllFilms, getFilmsFiltered };
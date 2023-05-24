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
    console.log(`getFilmsFiltered(${filter})`);
    const response = await fetch(`${URL}/films/filter/${filter}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

async function addFilm(film) {
    console.log(film.toString());
    const response = await fetch(`${URL}/films`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(film)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, error: ${JSON.stringify(await response.json(), null, 2)}`);
    }
    const data = await response.json();
    return data;
}

async function modifyFilm(id, film) {
    const response = await fetch(`${URL}/films/${id}`,
    {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(film)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, error: ${await response.json()}`);
    }
    const data = await response.json();
    return data; 
}

async function deleteFilm(id) {
    const response = await fetch(`${URL}/films/${id}`,
    {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, error: ${await response.json()}`);
    }
}

async function setFilmScore(id, score) {
    // '/api/films/:id/rate'
    const response = await fetch(`${URL}/films/${id}/rate`,
    {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: score })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, error: ${await response.json()}`);
    }
    const data = await response.json();
    return data;
}

async function setFilmFavorite(id, favorite) {
    // '/api/films/:id/favorite'
    const response = await fetch(`${URL}/films/${id}/favorite`,
    {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is: favorite })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, error: ${await response.json()}`);
    }
    const data = await response.json();
    return data;
}

const Api = { getAllFilms, getFilmsFiltered, addFilm, modifyFilm, deleteFilm, setFilmScore, setFilmFavorite };
export default Api;
const URL = 'http://localhost:3000/api';

const errorResponseToString = async (response) => {
    const data = await response.json();
    if ('message' in data) {
        return data.message;
    } else if ('error' in data) {
        return data.error;
    }
    try {
        return JSON.stringify(data, null, 2);
    } catch {
        // json parsing failed, last ditch effort
        let el = document.createElement('html');
        el.innerHTML = data;
        return el.toString();
    }
}

const throwIfNotServerError = async (response) => {
    if (!response.ok) {
        const error = await errorResponseToString(response);
        console.log(error);
        if (response.status < 500) {
            throw new Error(error);
        } else {
            throw new Error(`Server error! status: ${response.status}, error: ${error}`);
        }
    }
};

async function getAllFilms() {
    const response = await fetch(`${URL}/films`, {
        credentials: 'include',
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

async function getFilmsFiltered(filter) {
    const response = await fetch(`${URL}/films/filter/${filter}`,
    {
        credentials: 'include'
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

async function addFilm(film) {
    console.log(film.toString());
    const response = await fetch(`${URL}/films`,
    {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(film)
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

async function modifyFilm(id, film) {
    const response = await fetch(`${URL}/films/${id}`,
    {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(film)
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data; 
}

async function deleteFilm(id) {
    const response = await fetch(`${URL}/films/${id}`,
    {
        method: 'DELETE',
        credentials: 'include'
    });
    await throwIfNotServerError(response);
}

async function setFilmScore(id, score) {
    // '/api/films/:id/rate'
    const response = await fetch(`${URL}/films/${id}/rate`,
    {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: score })
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

async function setFilmFavorite(id, favorite) {
    // '/api/films/:id/favorite'
    const response = await fetch(`${URL}/films/${id}/favorite`,
    {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is: favorite })
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

async function logout() {
    const response = await fetch(`${URL}/sessions/current`, {
        method: 'DELETE',
        credentials: 'include'
    });
    await throwIfNotServerError(response);
}

async function login(email, password) {
    const credentials = {
        email,
        password
    };
    const response = await fetch(`${URL}/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

async function getSessionInfo() {
    const response = await fetch(`${URL}/sessions/current`, {
        credentials: 'include'
    });
    await throwIfNotServerError(response);
    const data = await response.json();
    return data;
}

const Api = { getAllFilms, getFilmsFiltered, addFilm, modifyFilm, deleteFilm, setFilmScore, setFilmFavorite, login, logout, getSessionInfo };
export default Api;
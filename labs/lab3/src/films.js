"use strict";
const dayjs = require('dayjs');
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

// TODO: use a proper database
const filmLibrary = new FilmLibrary();
filmLibrary.addNewFilm(new Film(1, "Pulp Fiction", true, "March 10, 2023", 5));
filmLibrary.addNewFilm(new Film(2, "21 Grams", true, "March 17, 2023", 4));
filmLibrary.addNewFilm(new Film(3, "Star Wars", false));
filmLibrary.addNewFilm(new Film(4, "Matrix", false));
filmLibrary.addNewFilm(new Film(5, "Shrek", false, "March 21, 2023", 3));

function createFavouriteCheckbox(film) {
    let div = document.createElement("div");
    let cb = document.createElement("input");
    cb.setAttribute("id", "Favorite");
    cb.setAttribute("type", "checkbox");
    cb.setAttribute("label", "Favorite");
    cb.addEventListener("change", () => {
        console.log("Checkbox clicked");
        let namediv = document.getElementById(`film-cell-${film.id}`);
        if (cb.checked) {
            film.favorite = true;
            namediv.setAttribute("style", "color: red");
        } else {
            film.favorite = false;
            namediv.setAttribute("style", "");
        }
    });
    cb.checked = film.favorite;
    let label = document.createElement("label");
    label.setAttribute("for", "Favorite");
    label.appendChild(document.createTextNode("Favorite"));

    div.appendChild(cb);
    div.appendChild(label);
    return div;
}

function createStar(filled, film, index) {
    if (!filled) {
        let star = document.createElement("img");
        star.onclick = () => {
            film.score = index;
            createFilmsTable(f => true);
        };
        star.setAttribute("src", "images/star.svg");
        return star;
    } else {
        let star = document.createElement("img");
        star.onclick = () => {
            film.score = index;
            createFilmsTable(f => true);
        };
        star.setAttribute("src", "images/star-fill.svg");
        return star;
    }
}

function createRating(film) {
    let div = document.createElement("div");
    div.setAttribute("class", "rating");
    for (let i = 1; i <= 5; i++) {
        div.appendChild(createStar(film.score === null ? false : i <= film.score, film, i));
    }
    return div;
}

function resetNewFilmForm(modal) {
    let elem = document.getElementById("main-page-div");
    elem.style.filter = "none";
    modal.style.display = "none";
    let title_element = document.getElementById("film-title");
    let fav_element = document.getElementById("film-fav");
    let date_element = document.getElementById("film-date");
    let score_element = document.getElementById("film-rating");
    title_element.value = "";
    fav_element.checked = false;
    date_element.value = "";
    score_element.value = 0;
}

function createFilmsTable(filter_func) {
    let tbl = document.getElementById("filmtable");
    let tbody_og = document.getElementById("filmtablebody");
    if (tbody_og !== null) {
        tbl.removeChild(tbody_og);
    }
    let tbody = tbl.appendChild(document.createElement("tbody"));
    tbody.setAttribute("id", "filmtablebody");

    filmLibrary.films.filter(filter_func).forEach(film => {
        let tr = tbody.appendChild(document.createElement("tr"));
        let namediv = document.createElement("div");
        let name = document.createTextNode(film.title);
        namediv.setAttribute("id", `film-cell-${film.id}`);
        namediv.appendChild(name);
        if (film.favorite !== null && film.favorite) {
            namediv.setAttribute("style", "color: red");
        }
        tr.appendChild(document.createElement("td")).appendChild(namediv);
        let div = createFavouriteCheckbox(film);
        tr.appendChild(document.createElement("td")).appendChild(div);
        tr.appendChild(document.createElement("td")).appendChild(document.createTextNode(film.watchDate === null ? "" : film.watchDate.format('MMMM DD, YYYY')));
        tr.appendChild(document.createElement("td")).appendChild(createRating(film));
    });
}

function setBtnToActive(btn) {
    let old_active_button = document.getElementsByClassName("button-active")[0];
    if (old_active_button !== undefined) {
        old_active_button.setAttribute("class", "sidebar-button");
    }
    let old_class = btn.getAttribute("class");
    btn.setAttribute("class", `${old_class} button-active`);
}

function addNewFilm() {
    let title_element = document.getElementById("film-title");
    let fav_element = document.getElementById("film-fav");
    let date_element = document.getElementById("film-date");
    let score_element = document.getElementById("film-rating");
    let title = title_element.value;
    let fav = fav_element.checked;
    let date = date_element.value;
    let score = parseInt(score_element.value);
    if (score === 0) {
        score = null;
    }
    if (date === "") {
        date = null;
    }
    if (title === "") {
        alert("Please enter a title for the film");
        return;
    }
    let new_film = new Film(filmLibrary.films.length + 1, title, fav, date, score);
    filmLibrary.addNewFilm(new_film);
    createFilmsTable((_) => true);
    let modal = document.getElementById("add-film-form");
    resetNewFilmForm(modal);
}

addEventListener("DOMContentLoaded", () => {
    document.onkeydown = (evt) => {
        evt = evt || window.event;
        if (!evt.isTrusted) {
            return;
        }
        let isEscape = false;
        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
        }
        if (isEscape) {
            let modal = document.getElementById("add-film-form");
            resetNewFilmForm(modal);
        }
    };
    document.onmousedown = (evt) => {
        evt = evt || window.event;
        if (!evt.isTrusted) {
            return;
        }
        let modal = document.getElementById("add-film-form");
        let btn = document.getElementById("button-add-film");
        if (evt.target === btn) {
            return;
        }
        if (modal.style.display !== "none") {
            if (!modal.contains(evt.target)) {
                resetNewFilmForm(modal);
            }
        }
    };
    createFilmsTable((_) => true);
    let btn = document.getElementById("button-add-film");
    let all_btn = document.getElementById("sidebar-button-all");
    let fav_btn = document.getElementById("sidebar-button-fav");
    let rat_btn = document.getElementById("sidebar-button-rat");
    let seen_btn = document.getElementById("sidebar-button-seen");
    let unseen_btn = document.getElementById("sidebar-button-unseen");

    let all_btn_ham = document.getElementById("sidebar-button-all-ham");
    let fav_btn_ham = document.getElementById("sidebar-button-fav-ham");
    let rat_btn_ham = document.getElementById("sidebar-button-rat-ham");
    let seen_btn_ham = document.getElementById("sidebar-button-seen-ham");
    let unseen_btn_ham = document.getElementById("sidebar-button-unseen-ham");

    let search_bar = document.getElementById("film-searchbar");
    let ham_btn = document.getElementById("ham-menu-button");

    let curr_selection = document.getElementById("current-selection");
    let add_new_film_btn = document.getElementById("submit-new-film-button");
    add_new_film_btn.addEventListener("click", addNewFilm);
    setBtnToActive(all_btn);
    btn.addEventListener("click", () => {
        let modal = document.getElementById("add-film-form");
        let elem = document.getElementById("main-page-div");
        if (modal.style.display === "flex") {
            resetNewFilmForm(modal);
        } else {
            modal.style.display = "flex";
            elem.style.filter = "blur(3px) grayscale(70%) opacity(70%)";
        }
    });
    window.onresize = () => {
        let ham_menu = document.getElementById("hamnavbar");
        if (window.innerWidth > 800 && ham_menu.style.display !== "none") {
            ham_menu.style.display = "none";
        }
    };
    all_btn.addEventListener("click", () => {
        setBtnToActive(all_btn);
        createFilmsTable((_) => true);
        curr_selection.innerHTML = "All";
    });
    all_btn_ham.addEventListener("click", () => {
        setBtnToActive(all_btn_ham);
        createFilmsTable((_) => true);
        curr_selection.innerHTML = "All";
    });
    fav_btn.addEventListener("click", () => {
        setBtnToActive(fav_btn);
        createFilmsTable((film) => film.favorite);
        curr_selection.innerHTML = "Favorites";
    });
    fav_btn_ham.addEventListener("click", () => {
        setBtnToActive(fav_btn_ham);
        createFilmsTable((film) => film.favorite);
        curr_selection.innerHTML = "Favorites";
    });
    rat_btn.addEventListener("click", () => {
        setBtnToActive(rat_btn);
        createFilmsTable((film) => film.score !== null);
        curr_selection.innerHTML = "Rated";
    });
    rat_btn_ham.addEventListener("click", () => {
        setBtnToActive(rat_btn_ham);
        createFilmsTable((film) => film.score !== null);
        curr_selection.innerHTML = "Rated";
    });
    seen_btn.addEventListener("click", () => {
        setBtnToActive(seen_btn);
        createFilmsTable((film) => film.watchDate !== null && film.watchDate.isBefore(dayjs(), 'month'));
        curr_selection.innerHTML = "Seen Last Month";
    });
    seen_btn_ham.addEventListener("click", () => {
        setBtnToActive(seen_btn_ham);
        createFilmsTable((film) => film.watchDate !== null && film.watchDate.isBefore(dayjs(), 'month'));
        curr_selection.innerHTML = "Seen Last Month";
    });
    unseen_btn.addEventListener("click", () => {
        setBtnToActive(unseen_btn);
        createFilmsTable((film) => film.watchDate === null);
        curr_selection.innerHTML = "Unseen";
    });
    unseen_btn_ham.addEventListener("click", () => {
        setBtnToActive(unseen_btn_ham);
        createFilmsTable((film) => film.watchDate === null);
        curr_selection.innerHTML = "Unseen";
    });
    search_bar.addEventListener("input", () => {
        createFilmsTable((film) => film.title.toLowerCase().includes(search_bar.value.toLowerCase()));
    });
    ham_btn.addEventListener("click", () => {
        let sidebar = document.getElementById("hamnavbar");
        if (sidebar.style.display == "block") {
            sidebar.style.display = "none";
        } else {
            setBtnToActive(all_btn_ham);
            sidebar.style.display = "block";
        }
    });
});

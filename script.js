const API_KEY = 'f96963457fa449f6821c9577567cbc93';

const registerSection = document.querySelector('#registerSection');
const userName = document.querySelector('#name');
const email = document.querySelector('#email');
const pass1 = document.querySelector('#password1');
const pass2 = document.querySelector('#password2');
const registerForm = document.querySelector('#registerForm');
const registerInfo = document.querySelector('#registerInfo');

const searchInput = document.querySelector('#searchInput');
const searchBtn = document.querySelector('#searchBtn');
const newsBox = document.querySelector('#newsBox');
const savedBox = document.querySelector('#savedBox');
const appSection = document.querySelector('#appSection');
const newsSection = document.querySelector('#newsSection');
const savedSection = document.querySelector('#savedSection');

function showError(input, text) {
    const box = input.parentElement;
    const errMess = box.querySelector('.err_mess');

    errMess.textContent = text;
    input.classList.add('input-error');
}

function clearError(input) {
    const box = input.parentElement;
    const errMess = box.querySelector('.err_mess');

    errMess.textContent = '';
    input.classList.remove('input-error');
}

function checkInputLength(input, minLength) {
    if (input.value.length < minLength) {
        showError(input, `Pole musi zawierać minimum ${minLength} znaków.`);
        return false;
    } else {
        clearError(input);
        return true;
    }
}

function checkEmail() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;

    if (!re.test(email.value)) {
        showError(email, 'Adres email jest niepoprawny.');
        return false;
    } else {
        clearError(email);
        return true;
    }
}

function checkPasswordStrength() {
    const password = pass1.value;

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasLetter || !hasNumber || !hasSpecial) {
        showError(pass1, 'Hasło musi zawierać literę, cyfrę i znak specjalny.');
        return false;
    } else {
        clearError(pass1);
        return true;
    }
}

function checkPasswords() {
    if (pass1.value !== pass2.value) {
        showError(pass2, 'Hasła są różne.');
        return false;
    } else {
        clearError(pass2);
        return true;
    }
}

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = checkInputLength(userName, 3);
    const isPasswordLengthValid = checkInputLength(pass1, 8);
    const isPasswordStrong = checkPasswordStrength();
    const isPasswordsSame = checkPasswords();
    const isEmailValid = checkEmail();

    if (
        isNameValid &&
        isPasswordLengthValid &&
        isPasswordStrong &&
        isPasswordsSame &&
        isEmailValid
    ) {
       
        registerInfo.innerHTML = `
            <div class="alert alert-success">
                Rejestracja poprawna. Możesz korzystać z aplikacji.
            </div>
        `;
        registerSection.classList.add('d-none');

        registerSection.classList.add('register-hide');

            setTimeout(() => {

                registerSection.classList.add('d-none');

                appSection.classList.remove('d-none');
                newsSection.classList.remove('d-none');
                savedSection.classList.remove('d-none');

                appSection.classList.add('section-show');
                newsSection.classList.add('section-show');
                savedSection.classList.add('section-show');

            }, 500);

            appSection.insertAdjacentHTML('beforebegin', `
                <div class="alert alert-success rounded-4 shadow-sm">
                    Rejestracja poprawna. Możesz korzystać z aplikacji.
                </div>  
                `);
                

    } else {
       
        registerInfo.innerHTML = `
            <div class="alert alert-danger">
                Popraw błędy w formularzu.
            </div>
        `;
        
    }
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();

    if (query === '') {
        newsBox.innerHTML = `
            <div class="alert alert-warning">
                Wpisz temat wyszukiwania.
            </div>
        `;
        return;
    }

    getNews(query);
});

function getNews(query) {
    newsBox.innerHTML = `
        <div class="app-alert">
            Pobieranie artykułów...
        </div>
    `;

    fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=10&sortBy=publishedAt&apiKey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                newsBox.innerHTML = `
                    <div class="alert alert-danger rounded-4">
                        Błąd API: ${data.message}
                    </div>
                `;
                return;
            }

            showNews(data.articles);
        })
        .catch(() => {
            newsBox.innerHTML = `
                <div class="alert alert-danger rounded-4">
                    Nie udało się pobrać danych z NewsAPI.
                </div>
            `;
        });
}

function showNews(articles) {
    newsBox.innerHTML = '';

    if (!articles || articles.length === 0) {
        newsBox.innerHTML = `
            <div class="alert alert-warning">
                Brak wyników.
            </div>
        `;
        return;
    }

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article-card');

        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.description || 'Brak opisu artykułu.'}</p>
            <p class="article-date">Data publikacji: ${article.publishedAt}</p>
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                Czytaj artykuł
            </a>
            <button class="btn btn-sm btn-success save-btn">
                Zapisz inspirację
            </button>
        `;

        const saveBtn = articleDiv.querySelector('.save-btn');

        saveBtn.addEventListener('click', () => {
            saveArticle(article);
        });

        newsBox.appendChild(articleDiv);
    });
}

function saveArticle(article) {
    const savedArticle = {
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt
    };

    fetch('/api/saved', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedArticle)
    })
        .then(response => response.json())
        .then(() => {
            loadSavedArticles();
        })
        .catch(() => {
            alert('Nie udało się zapisać artykułu.');
        });
}

function loadSavedArticles() {
    fetch('/api/saved')
        .then(response => response.json())
        .then(data => {
            showSavedArticles(data);
        })
        .catch(() => {
            savedBox.innerHTML = `
                <div class="alert alert-danger">
                    Nie udało się pobrać zapisanych artykułów.
                </div>
            `;
        });
}

function showSavedArticles(articles) {
    savedBox.innerHTML = '';

    if (!articles || articles.length === 0) {
        savedBox.innerHTML = `
            <div class="alert alert-secondary">
                Brak zapisanych artykułów.
            </div>
        `;
        return;
    }

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article-card');

        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.description || 'Brak opisu.'}</p>
            <p class="article-date">Data publikacji: ${article.publishedAt}</p>
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                Otwórz
            </a>
        `;

        savedBox.appendChild(articleDiv);
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

loadSavedArticles();
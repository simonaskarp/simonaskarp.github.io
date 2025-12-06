document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.php-email-form');
    const formFields = contactForm.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    fieldValidation(formFields);
    if(contactForm) {
        formValidation(contactForm);
    }

    const gameSection = document.querySelector('#game .container');
    
    const gameImages = [
        'assets/img/game/abacus.png',
        'assets/img/game/basketball-ball.png',
        'assets/img/game/bowling-ball.png',
        'assets/img/game/bowling-pins.png',
        'assets/img/game/club.png',
        'assets/img/game/diamond.png',
        'assets/img/game/joystick.png',
        'assets/img/game/shuttlecock.png',
        'assets/img/game/soccer.png',
        'assets/img/game/spade.png',
        'assets/img/game/tennis-ball.png',
        'assets/img/game/volleyball.png'
    ];

    let gameState = {
        difficulty: 'easy',
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        isPlaying: false,
        timer: 0,
        timerInterval: null
    };

    function loadBestScores() {
        return {
            easy: parseInt(localStorage.getItem('bestScoreEasy')) || null,
            hard: parseInt(localStorage.getItem('bestScoreHard')) || null
        };
    }

    function saveBestScore(difficulty, score) {
        const key = difficulty === 'easy' ? 'bestScoreEasy' : 'bestScoreHard';
        const currentBest = parseInt(localStorage.getItem(key)) || Infinity;
        
        if (score < currentBest) {
            localStorage.setItem(key, score);
            return true;
        }
        return false;
    }

    function createGameHTML() {
        const bestScores = loadBestScores();
        
        gameSection.innerHTML = `
            <div class="game-controls">
                <div class="difficulty-selector">
                    <label><strong>Pasirinkite sudėtingumą:</strong></label>
                    <div class="difficulty-buttons">
                        <button class="difficulty-btn active" data-difficulty="easy">Lengvas (4×3)</button>
                        <button class="difficulty-btn" data-difficulty="hard">Sunkus (6×4)</button>
                    </div>
                </div>
                
                <div class="game-buttons">
                    <button id="startBtn" class="game-action-btn">Start</button>
                    <button id="resetBtn" class="game-action-btn">Atnaujinti</button>
                </div>
            </div>

            <div class="stats-container">
                <div class="stat-item">
                    <span class="stat-label">Ėjimai:</span>
                    <span id="movesCount" class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Rastos poros:</span>
                    <span id="pairsCount" class="stat-value">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Laikas:</span>
                    <span id="timerDisplay" class="stat-value">0s</span>
                </div>
                <div class="stat-item best-score">
                    <span class="stat-label">Geriausias rezultatas (${gameState.difficulty === 'easy' ? 'Lengvas' : 'Sunkus'}):</span>
                    <span id="bestScore" class="stat-value">${bestScores[gameState.difficulty] || '-'}</span>
                </div>
            </div>

            <div id="gameBoard" class="game-board"></div>

            <div id="winMessage" class="win-message" style="display: none;">
                <h3>Laimėjote!</h3>
                <p>Ėjimai: <span id="finalMoves"></span></p>
                <p>Laikas: <span id="finalTime"></span></p>
                <p id="newRecord" style="display: none; color: gold; font-weight: bold;">Naujas rekordas!</p>
            </div>
        `;
    }

    function createCard(image, index) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.image = image;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${image}" alt="card">
                </div>
            </div>
        `;
        
        return card;
    }

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function generateBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        
        const cardCount = gameState.difficulty === 'easy' ? 12 : 24;
        const pairsNeeded = cardCount / 2;
        
        const selectedImages = gameImages.slice(0, pairsNeeded);
        const cardPairs = [...selectedImages, ...selectedImages];
        const shuffledCards = shuffleArray(cardPairs);
        
        if (gameState.difficulty === 'easy') {
            board.style.gridTemplateColumns = 'repeat(4, 1fr)';
        } else {
            board.style.gridTemplateColumns = 'repeat(6, 1fr)';
        }
        
        shuffledCards.forEach((image, index) => {
            const card = createCard(image, index);
            board.appendChild(card);
        });
    }

    function startTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        gameState.timer = 0;
        gameState.timerInterval = setInterval(() => {
            gameState.timer++;
            document.getElementById('timerDisplay').textContent = `${gameState.timer}s`;
        }, 1000);
    }

    function stopTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    }

    function flipCard(card) {
        if (!gameState.isPlaying) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (gameState.flippedCards.length >= 2) return;
        
        card.classList.add('flipped');
        gameState.flippedCards.push(card);
        
        if (gameState.flippedCards.length === 2) {
            gameState.moves++;
            document.getElementById('movesCount').textContent = gameState.moves;
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = gameState.flippedCards;
        const image1 = card1.dataset.image;
        const image2 = card2.dataset.image;
        
        if (image1 === image2) {
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                gameState.matchedPairs++;
                document.getElementById('pairsCount').textContent = gameState.matchedPairs;
                gameState.flippedCards = [];
                
                checkWin();
            }, 500);
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                gameState.flippedCards = [];
            }, 1000);
        }
    }

    function checkWin() {
        const totalPairs = gameState.difficulty === 'easy' ? 6 : 12;
        
        if (gameState.matchedPairs === totalPairs) {
            stopTimer();
            gameState.isPlaying = false;
            
            const isNewRecord = saveBestScore(gameState.difficulty, gameState.moves);
            
            const bestScores = loadBestScores();
            document.getElementById('bestScore').textContent = bestScores[gameState.difficulty];
            
            const winMessage = document.getElementById('winMessage');
            document.getElementById('finalMoves').textContent = gameState.moves;
            document.getElementById('finalTime').textContent = `${gameState.timer}s`;
            
            const newRecordMsg = document.getElementById('newRecord');
            if (isNewRecord) {
                newRecordMsg.style.display = 'block';
            } else {
                newRecordMsg.style.display = 'none';
            }
            
            winMessage.style.display = 'block';
        }
    }

    function startGame() {
        gameState.isPlaying = true;
        gameState.flippedCards = [];
        gameState.matchedPairs = 0;
        gameState.moves = 0;
        
        document.getElementById('movesCount').textContent = '0';
        document.getElementById('pairsCount').textContent = '0';
        document.getElementById('winMessage').style.display = 'none';
        
        generateBoard();
        startTimer();
        
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach(card => {
            card.addEventListener('click', () => flipCard(card));
        });
    }

    function resetGame() {
        stopTimer();
        gameState.isPlaying = false;
        gameState.flippedCards = [];
        gameState.matchedPairs = 0;
        gameState.moves = 0;
        gameState.timer = 0;
        
        document.getElementById('movesCount').textContent = '0';
        document.getElementById('pairsCount').textContent = '0';
        document.getElementById('timerDisplay').textContent = '0s';
        document.getElementById('winMessage').style.display = 'none';
        
        generateBoard();
    }

    function changeDifficulty(difficulty) {
        gameState.difficulty = difficulty;
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        const bestScores = loadBestScores();
        const label = difficulty === 'easy' ? 'Lengvas' : 'Sunkus';
        document.querySelector('.best-score .stat-label').textContent = 
            `Geriausias rezultatas (${label}):`;
        document.getElementById('bestScore').textContent = bestScores[difficulty] || '-';
        
        resetGame();
    }

    createGameHTML();
    generateBoard();

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            changeDifficulty(e.target.dataset.difficulty);
        });
    });
});

function formValidation(form) {
    form.addEventListener('input', () => handleFormValidation(form));
    form.addEventListener('submit', (event) => handleFormSubmission(event, form));
}

function fieldValidation(formFields) {
    formFields.forEach(field => {
        field.addEventListener('input', () => handleFieldValidation(field));
        field.addEventListener('blur', () => handleFieldValidation(field));
    });
}

function handleFormSubmission(event, form) {
    event.preventDefault();

    const formData = new FormData(form);
    const formFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    const dataObject = {};

    for (let [fieldName, value] of formData.entries()) {
        if (fieldName.includes('slider')) {
            dataObject[fieldName] = parseFloat(value);
        } else if(fieldName === 'phone') {
            dataObject[fieldName] = '+370 ' + value;
        } else {
            dataObject[fieldName] = value;
        }
    }

    console.log('Formos duomenys:');
    console.log(dataObject);

    const outputDiv = document.getElementById('form-data-output');
    const outputPre = document.getElementById('form-data-pre');
    const rankDiv = document.getElementById('form-data-rank');
    const rankPre = document.getElementById('form-data-rank-pre');
    const successMessage = document.getElementById('success-message');

    const rankAverage = (dataObject['first-slider'] + dataObject['second-slider'] + dataObject['third-slider']) / 3;

    if(outputDiv && outputPre && rankDiv && rankPre && successMessage) {
        outputPre.textContent = 'Vardas: ' + dataObject['name'] + '\n' +
                            'Pavardė: ' + dataObject['last-name'] + '\n' +
                            'El. paštas: ' + dataObject['email'] + '\n' +
                            'Tel. numeris: ' + dataObject['phone'] + '\n';
        outputDiv.style.display = 'block';
        rankPre.textContent = dataObject['name'] + ' ' + dataObject['last-name'] + ': ' + rankAverage.toFixed(2);
        rankDiv.style.display = 'block';
        successMessage.style.display = 'block';
        form.reset();

        formFields.forEach(field => {
            if (field.id === 'phone') {
                field.parentNode.classList.remove('form-valid-border');
            } else {
                field.classList.remove('form-valid-border');
            }
        });
        handleFormValidation(form);
    }
}

function handleFormValidation(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const formFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    let formValid = true;
    if(form.querySelector('.form-error')) {
        formValid = false;
    }
    formFields.forEach(field => {
        if(!isNotEmpty(field.value)) {
            formValid = false;
        }
    });
    submitButton.disabled = !formValid;
    if(formValid) {
        submitButton.classList.remove('submit-button-disabled');
    } else {
        submitButton.classList.add('submit-button-disabled');
    }
}

function handleFieldValidation(field) {
    let fieldValid = true;
    let errorMessage = '';
    if(!isNotEmpty(field.value)) {
        fieldValid = false;
        errorMessage = 'Skiltis turi būti užpildyta';
    } else if(field.id === 'name' || field.id === 'last-name') {
        if(!isValidName(field.value)) {
            fieldValid = false;
            errorMessage = 'Galimos tik raidės';
        }
    } else if(field.id === 'email') {
        if(!isValidEmail(field.value)) {
            fieldValid = false;
            errorMessage = 'Netinkamas el. pašto formatas';
        }
    } else if(field.id === 'phone') {
        formatPhoneInput(field);
        if(!isValidPhone(field.value)) {
            fieldValid = false;
            errorMessage = 'Netinkamas telefono numerio formatas';
        }
    }

    if(!fieldValid) {
        if(field.id === 'phone') {
            showError(field.parentNode, errorMessage);
        } else {
            showError(field, errorMessage);
        }
    } else {
        if(field.id === 'phone') {
            clearError(field.parentNode);
        } else {
            clearError(field);
        }
    }
}

function isValidPhone(phone) {
    const phonePattern = /^\d{3}\s\d{5}$/;
    return phonePattern.test(phone);
}

function isNotEmpty(value) {
    return value.trim() !== '';
}

function isValidName(name) {
    return !(/\d/.test(name));
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showError(field, message) {
    let errorDiv = field.parentNode.querySelector('.form-error');
    if(errorDiv) {
        errorDiv.innerText = message;
        return;
    }
    errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerText = message;
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    field.classList.remove('form-valid-border');
    field.classList.add('form-error-border');
}

function clearError(field) {
    let errorDiv = field.parentNode.querySelector('.form-error');
    if(errorDiv) {
        errorDiv.remove();
        field.classList.remove('form-error-border');
    }
    field.classList.add('form-valid-border');
}

function formatPhoneInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');

    if(input.value.length > 3 && !input.value.includes(' ')) {
        input.value = input.value.slice(0, 3) + ' ' + input.value.slice(3);
    } else if(input.value.length === 4 && input.value[3] === ' ') {
        input.value = input.value.trim();
    }
}
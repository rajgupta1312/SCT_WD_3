class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.gameActive = true;
        this.scores = {
            X: 0,
            O: 0,
            ties: 0
        };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadScores();
        this.loadTheme();
    }
    
    initializeGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.clearBoard();
        this.updateStatus();
    }
    
    setupEventListeners() {
        // Cell clicks
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', this.handleCellClick.bind(this));
        });
        
        // Mode buttons
        document.getElementById('pvp-mode').addEventListener('click', () => {
            this.setGameMode('pvp');
        });
        
        document.getElementById('ai-mode').addEventListener('click', () => {
            this.setGameMode('ai');
        });
        
        // Control buttons
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.getElementById('clear-scores-btn').addEventListener('click', () => {
            this.clearScores();
        });
        
        // Theme toggle
        document.getElementById('theme-switch').addEventListener('change', (e) => {
            this.toggleTheme(e.target.checked);
        });
    }
    
    handleCellClick(e) {
        const cellIndex = parseInt(e.target.dataset.index);
        
        if (this.board[cellIndex] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(cellIndex, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'ai' && this.currentPlayer === 'O') {
            // AI makes its move after a short delay for better UX
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateCell(index, player);
        
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
        } else if (this.isBoardFull()) {
            this.endGame('tie');
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }
    
    makeAIMove() {
        if (!this.gameActive || this.currentPlayer !== 'O') return;
        
        const bestMove = this.minimax(this.board, 0, true);
        this.makeMove(bestMove.index, 'O');
    }
    
    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinner(board);
        
        if (winner === 'O') return { score: 10 - depth };
        if (winner === 'X') return { score: depth - 10 };
        if (this.isBoardFull(board)) return { score: 0 };
        
        const moves = [];
        
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                const move = {};
                move.index = i;
                
                // Make the move
                board[i] = isMaximizing ? 'O' : 'X';
                
                // Get the score
                const result = this.minimax(board, depth + 1, !isMaximizing);
                move.score = result.score;
                
                // Undo the move
                board[i] = '';
                
                moves.push(move);
            }
        }
        
        // Choose the best move
        let bestMove;
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let move of moves) {
                if (move.score > bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let move of moves) {
                if (move.score < bestScore) {
                    bestScore = move.score;
                    bestMove = move;
                }
            }
        }
        
        return bestMove;
    }
    
    checkWinner(board = this.board) {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }
    
    isBoardFull(board = this.board) {
        return board.every(cell => cell !== '');
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result === 'tie') {
            this.scores.ties++;
            this.updateStatus('It\'s a tie!', 'tie');
        } else {
            this.scores[result]++;
            this.highlightWinningCells();
            const playerName = this.gameMode === 'ai' && result === 'O' ? 'AI' : `Player ${result}`;
            this.updateStatus(`${playerName} wins!`, 'winner');
        }
        
        this.updateScoreboard();
        this.saveScores();
        this.disableBoard();
    }
    
    highlightWinningCells() {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                [a, b, c].forEach(index => {
                    const cell = document.querySelector(`[data-index="${index}"]`);
                    cell.classList.add('winning');
                });
                break;
            }
        }
    }
    
    updateCell(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }
    
    updateStatus(message, type = '') {
        const statusElement = document.getElementById('game-status');
        
        if (message) {
            statusElement.textContent = message;
        } else {
            const playerName = this.gameMode === 'ai' && this.currentPlayer === 'O' ? 'AI' : `Player ${this.currentPlayer}`;
            statusElement.textContent = `${playerName}'s turn`;
        }
        
        // Reset classes
        statusElement.className = 'game-status';
        if (type) {
            statusElement.classList.add(type);
        }
    }
    
    updateScoreboard() {
        document.getElementById('score-x').textContent = this.scores.X;
        document.getElementById('score-o').textContent = this.scores.O;
        document.getElementById('score-ties').textContent = this.scores.ties;
        
        // Add animation to updated score
        const scoreElements = document.querySelectorAll('.score-value');
        scoreElements.forEach(element => {
            element.classList.add('updated');
            setTimeout(() => {
                element.classList.remove('updated');
            }, 300);
        });
    }
    
    clearBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
    }
    
    disableBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.add('disabled');
        });
    }
    
    enableBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('disabled');
        });
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (mode === 'pvp') {
            document.getElementById('pvp-mode').classList.add('active');
        } else {
            document.getElementById('ai-mode').classList.add('active');
        }
        
        // Update scoreboard labels
        const scoreLabels = document.querySelectorAll('.score-label');
        if (mode === 'ai') {
            scoreLabels[0].textContent = 'Player';
            scoreLabels[2].textContent = 'AI';
        } else {
            scoreLabels[0].textContent = 'Player X';
            scoreLabels[2].textContent = 'Player O';
        }
        
        this.resetGame();
    }
    
    resetGame() {
        this.initializeGame();
        this.enableBoard();
    }
    
    newGame() {
        this.resetGame();
    }
    
    clearScores() {
        this.scores = { X: 0, O: 0, ties: 0 };
        this.updateScoreboard();
        this.saveScores();
    }
    
    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreboard();
        }
    }
    
    toggleTheme(isDark) {
        const body = document.body;
        if (isDark) {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const themeSwitch = document.getElementById('theme-switch');
        
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeSwitch.checked = true;
        } else {
            document.body.removeAttribute('data-theme');
            themeSwitch.checked = false;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
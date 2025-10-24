// Buffalo Slots Game Engine
// Professional slot machine with bonus features, free spins, and 2000 paylines support

class SlotMachine {
    constructor() {
        // Game configuration
        this.symbols = {
            BUFFALO: { emoji: '🦬', name: 'Buffalo', isWild: true },
            DIAMOND: { emoji: '💎', name: 'Diamond' },
            CROWN: { emoji: '👑', name: 'Crown' },
            BELL: { emoji: '🔔', name: 'Bell' },
            CLOVER: { emoji: '🍀', name: 'Clover' },
            STAR: { emoji: '⭐', name: 'Star' },
            SEVEN: { emoji: '7️⃣', name: 'Seven' },
            CHERRY: { emoji: '🍒', name: 'Cherry' },
            SCATTER: { emoji: '🎰', name: 'Scatter', isScatter: true }
        };

        // Symbol weights for reel generation (higher = more common)
        this.symbolWeights = {
            BUFFALO: 3,
            DIAMOND: 5,
            CROWN: 8,
            BELL: 10,
            CLOVER: 12,
            STAR: 15,
            SEVEN: 18,
            CHERRY: 20,
            SCATTER: 4
        };

        // Paytable (multipliers based on bet per line)
        this.paytable = {
            BUFFALO: { 5: 5000, 4: 500, 3: 100, 2: 10 },
            DIAMOND: { 5: 1000, 4: 200, 3: 50, 2: 5 },
            CROWN: { 5: 750, 4: 150, 3: 40 },
            BELL: { 5: 500, 4: 100, 3: 30 },
            CLOVER: { 5: 400, 4: 80, 3: 25 },
            STAR: { 5: 300, 4: 60, 3: 20 },
            SEVEN: { 5: 250, 4: 50, 3: 15 },
            CHERRY: { 5: 200, 4: 40, 3: 10 }
        };

        // Game state
        this.balance = 100;
        this.currentLines = 50;
        this.betPerLine = 0.01;
        this.totalWon = 0;
        this.lastWin = 0;
        this.isSpinning = false;
        this.freeSpinsRemaining = 0;
        this.freeSpinsMultiplier = 1;
        this.debugNextSpin = 'normal';

        // Available bet options
        this.betOptions = [0.01, 0.02, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00];
        this.currentBetIndex = 0;
        this.maxLines = 2000;
        this.lineOptions = [1, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 1500, 2000];

        // Reels configuration
        this.reelCount = 5;
        this.symbolsPerReel = 3;
        this.reels = [];

        // Daily bonus tracking
        this.lastBonusDate = null;

        this.init();
    }

    init() {
        this.loadGameState();
        this.checkDailyBonus();
        this.setupEventListeners();
        this.updateUI();
        this.generateReels();
    }

    // Generate weighted symbol reels
    generateReels() {
        const weightedSymbols = [];

        // Create weighted array
        Object.keys(this.symbols).forEach(symbolKey => {
            const weight = this.symbolWeights[symbolKey];
            for (let i = 0; i < weight; i++) {
                weightedSymbols.push(symbolKey);
            }
        });

        // Generate each reel
        this.reels = [];
        for (let i = 0; i < this.reelCount; i++) {
            const reel = [];
            for (let j = 0; j < this.symbolsPerReel; j++) {
                const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
                reel.push(weightedSymbols[randomIndex]);
            }
            this.reels.push(reel);
        }
    }

    // Generate paylines based on number of lines
    generatePaylines(lineCount) {
        const paylines = [];

        // Standard 5 paylines
        if (lineCount >= 1) paylines.push([1, 1, 1, 1, 1]); // Middle row
        if (lineCount >= 2) paylines.push([0, 0, 0, 0, 0]); // Top row
        if (lineCount >= 3) paylines.push([2, 2, 2, 2, 2]); // Bottom row
        if (lineCount >= 4) paylines.push([0, 1, 2, 1, 0]); // V shape
        if (lineCount >= 5) paylines.push([2, 1, 0, 1, 2]); // Inverted V

        // Additional complex paylines for higher line counts
        const patterns = [
            [1, 0, 1, 0, 1], [1, 2, 1, 2, 1], [0, 1, 0, 1, 0],
            [2, 1, 2, 1, 2], [0, 0, 1, 2, 2], [2, 2, 1, 0, 0],
            [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [0, 1, 1, 1, 0],
            [2, 1, 1, 1, 2], [0, 2, 0, 2, 0], [2, 0, 2, 0, 2]
        ];

        let currentLine = 5;
        for (const pattern of patterns) {
            if (currentLine >= lineCount) break;
            paylines.push(pattern);
            currentLine++;
        }

        // Generate additional random paylines up to requested count
        while (paylines.length < lineCount && paylines.length < this.maxLines) {
            const randomPattern = [];
            for (let i = 0; i < this.reelCount; i++) {
                randomPattern.push(Math.floor(Math.random() * this.symbolsPerReel));
            }
            paylines.push(randomPattern);
        }

        return paylines.slice(0, lineCount);
    }

    // Calculate wins for current spin
    calculateWins() {
        const paylines = this.generatePaylines(this.currentLines);
        let totalWin = 0;
        const winningLines = [];

        // Check scatter wins first
        const scatterCount = this.countScatters();
        if (scatterCount >= 3) {
            // Trigger free spins
            if (this.freeSpinsRemaining === 0) {
                this.triggerFreeSpins(scatterCount);
            } else {
                // Retrigger free spins
                this.freeSpinsRemaining += this.calculateFreeSpins(scatterCount);
                this.showMessage(`+${this.calculateFreeSpins(scatterCount)} FREE SPINS!`);
            }
        }

        // Check each payline
        paylines.forEach((payline, lineIndex) => {
            const symbols = payline.map((row, reelIndex) => this.reels[reelIndex][row]);
            const win = this.checkPaylineWin(symbols);

            if (win.amount > 0) {
                totalWin += win.amount * this.betPerLine * this.freeSpinsMultiplier;
                winningLines.push({
                    lineIndex,
                    payline,
                    symbols: win.matchedSymbols,
                    count: win.count,
                    multiplier: win.multiplier
                });
            }
        });

        return { totalWin, winningLines };
    }

    // Check if a payline is a winner
    checkPaylineWin(symbols) {
        let matchCount = 1;
        let matchSymbol = symbols[0];

        // Handle wild symbols
        if (this.symbols[matchSymbol].isWild) {
            // Wild as first symbol
            for (let i = 1; i < symbols.length; i++) {
                if (symbols[i] === matchSymbol || this.symbols[symbols[i]].isWild) {
                    matchCount++;
                } else {
                    matchSymbol = symbols[i];
                    break;
                }
            }
        }

        // Continue matching from left to right
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === matchSymbol || this.symbols[symbols[i]].isWild) {
                matchCount++;
            } else {
                break;
            }
        }

        // Check if we have a winning combination
        if (this.paytable[matchSymbol] && this.paytable[matchSymbol][matchCount]) {
            return {
                amount: this.paytable[matchSymbol][matchCount],
                count: matchCount,
                matchedSymbols: matchSymbol,
                multiplier: this.paytable[matchSymbol][matchCount]
            };
        }

        return { amount: 0, count: 0, matchedSymbols: null, multiplier: 0 };
    }

    // Count scatter symbols anywhere on reels
    countScatters() {
        let count = 0;
        this.reels.forEach(reel => {
            reel.forEach(symbol => {
                if (this.symbols[symbol].isScatter) {
                    count++;
                }
            });
        });
        return count;
    }

    // Calculate free spins based on scatter count
    calculateFreeSpins(scatterCount) {
        const freeSpinsTable = {
            3: 10,
            4: 15,
            5: 25,
            6: 50
        };
        return freeSpinsTable[scatterCount] || 10;
    }

    // Trigger free spins bonus
    triggerFreeSpins(scatterCount) {
        this.freeSpinsRemaining = this.calculateFreeSpins(scatterCount);
        this.freeSpinsMultiplier = 2;
        this.showFreeSpinsBanner(true);
        this.showMessage(`🎰 ${this.freeSpinsRemaining} FREE SPINS! 🎰\n2x MULTIPLIER!`);
    }

    // Spin the reels
    async spin() {
        if (this.isSpinning) return;

        const totalBet = this.currentLines * this.betPerLine;

        // Check if player can afford the bet (unless in free spins)
        if (this.freeSpinsRemaining === 0 && this.balance < totalBet) {
            alert('Insufficient balance! Please reduce your bet or claim your daily bonus.');
            return;
        }

        this.isSpinning = true;
        this.updateSpinButton(true);

        // Deduct bet (unless free spins)
        if (this.freeSpinsRemaining === 0) {
            this.balance -= totalBet;
        } else {
            this.freeSpinsRemaining--;
            this.updateFreeSpinsDisplay();
        }

        this.updateUI();

        // Apply debug mode if set
        if (this.debugNextSpin !== 'normal') {
            this.applyDebugSpin();
        } else {
            this.generateReels();
        }

        // Animate reels
        await this.animateReels();

        // Calculate and award wins
        const { totalWin, winningLines } = this.calculateWins();

        if (totalWin > 0) {
            this.balance += totalWin;
            this.lastWin = totalWin;
            this.totalWon += totalWin;

            // Highlight winning symbols
            this.highlightWinningLines(winningLines);
            this.showWinDisplay(totalWin);
        } else {
            this.lastWin = 0;
        }

        // Check if free spins ended
        if (this.freeSpinsRemaining === 0 && this.freeSpinsMultiplier > 1) {
            this.freeSpinsMultiplier = 1;
            this.showFreeSpinsBanner(false);
            this.showMessage('FREE SPINS COMPLETE!');
        }

        this.updateUI();
        this.saveGameState();
        this.isSpinning = false;
        this.updateSpinButton(false);

        // Auto-spin if in free spins mode
        if (this.freeSpinsRemaining > 0) {
            setTimeout(() => this.spin(), 2000);
        }
    }

    // Animate reel spinning
    async animateReels() {
        const reelElements = document.querySelectorAll('.reel');
        const spinDuration = 2000;
        const reelDelay = 200;

        // Start spinning animation
        reelElements.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.add('spinning');
                this.animateReelSymbols(reel, index);
            }, index * reelDelay);
        });

        // Wait for all reels to finish
        await new Promise(resolve => setTimeout(resolve, spinDuration + (reelDelay * reelElements.length)));

        // Stop spinning and show final symbols
        reelElements.forEach((reel, index) => {
            reel.classList.remove('spinning');
            this.displayReelSymbols(reel, index);
        });
    }

    // Animate individual reel
    animateReelSymbols(reelElement, reelIndex) {
        const interval = setInterval(() => {
            const symbolContainers = reelElement.querySelectorAll('.symbol-container');
            symbolContainers.forEach(container => {
                const symbol = container.querySelector('.symbol');
                const randomSymbol = this.getRandomSymbol();
                symbol.textContent = this.symbols[randomSymbol].emoji;
            });
        }, 100);

        // Store interval to clear later
        reelElement.dataset.intervalId = interval;
    }

    // Display final reel symbols
    displayReelSymbols(reelElement, reelIndex) {
        // Clear animation interval
        if (reelElement.dataset.intervalId) {
            clearInterval(parseInt(reelElement.dataset.intervalId));
        }

        const symbolContainers = reelElement.querySelectorAll('.symbol-container');
        symbolContainers.forEach((container, symbolIndex) => {
            const symbol = container.querySelector('.symbol');
            const symbolKey = this.reels[reelIndex][symbolIndex];
            symbol.textContent = this.symbols[symbolKey].emoji;
            container.classList.remove('winning');
        });
    }

    // Get random symbol based on weights
    getRandomSymbol() {
        const weightedSymbols = [];
        Object.keys(this.symbols).forEach(symbolKey => {
            const weight = this.symbolWeights[symbolKey];
            for (let i = 0; i < weight; i++) {
                weightedSymbols.push(symbolKey);
            }
        });
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        return weightedSymbols[randomIndex];
    }

    // Highlight winning paylines
    highlightWinningLines(winningLines) {
        setTimeout(() => {
            winningLines.forEach(line => {
                line.payline.forEach((row, reelIndex) => {
                    if (reelIndex < line.count) {
                        const reel = document.getElementById(`reel-${reelIndex}`);
                        const container = reel.querySelectorAll('.symbol-container')[row];
                        container.classList.add('winning');
                    }
                });
            });
        }, 500);
    }

    // Show win display animation
    showWinDisplay(amount) {
        const winDisplay = document.getElementById('win-display');
        const winAmount = document.getElementById('win-amount');

        winAmount.textContent = `WIN: $${amount.toFixed(2)}`;
        winDisplay.classList.add('show');

        setTimeout(() => {
            winDisplay.classList.remove('show');
        }, 2000);
    }

    // Show message to player
    showMessage(message) {
        alert(message);
    }

    // Show/hide free spins banner
    showFreeSpinsBanner(show) {
        const banner = document.getElementById('free-spins-banner');
        if (show) {
            banner.classList.add('active');
        } else {
            banner.classList.remove('active');
        }
    }

    // Update free spins display
    updateFreeSpinsDisplay() {
        const freeSpinsCount = document.getElementById('free-spins-count');
        freeSpinsCount.textContent = `${this.freeSpinsRemaining} Free Spins Remaining`;
    }

    // Check and award daily bonus
    checkDailyBonus() {
        const today = new Date().toDateString();

        if (this.lastBonusDate !== today) {
            this.balance += 100;
            this.lastBonusDate = today;
            this.saveGameState();
            this.showMessage('🎁 Daily Bonus: $100 added to your balance!');
        }
    }

    // Update all UI elements
    updateUI() {
        document.getElementById('balance').textContent = `$${this.balance.toFixed(2)}`;
        document.getElementById('lines-value').textContent = this.currentLines;
        document.getElementById('bet-value').textContent = `$${this.betPerLine.toFixed(2)}`;
        document.getElementById('total-bet').textContent = `$${(this.currentLines * this.betPerLine).toFixed(2)}`;
        document.getElementById('last-win').textContent = `$${this.lastWin.toFixed(2)}`;
        document.getElementById('total-won').textContent = `$${this.totalWon.toFixed(2)}`;

        const today = new Date().toDateString();
        const bonusStatus = document.getElementById('daily-bonus-status');
        if (this.lastBonusDate === today) {
            bonusStatus.textContent = 'Next bonus: Tomorrow';
        } else {
            bonusStatus.textContent = 'Daily Bonus Available!';
        }
    }

    // Update spin button state
    updateSpinButton(isSpinning) {
        const button = document.getElementById('spin-button');
        button.disabled = isSpinning;

        if (isSpinning) {
            button.classList.add('spinning');
            button.querySelector('.spin-text').textContent = 'SPINNING...';
        } else {
            button.classList.remove('spinning');
            if (this.freeSpinsRemaining > 0) {
                button.querySelector('.spin-text').textContent = 'FREE SPIN';
            } else {
                button.querySelector('.spin-text').textContent = 'SPIN';
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Spin button
        document.getElementById('spin-button').addEventListener('click', () => this.spin());

        // Lines controls
        document.getElementById('lines-minus').addEventListener('click', () => this.adjustLines(-1));
        document.getElementById('lines-plus').addEventListener('click', () => this.adjustLines(1));
        document.getElementById('lines-max').addEventListener('click', () => this.setMaxLines());

        // Bet controls
        document.getElementById('bet-minus').addEventListener('click', () => this.adjustBet(-1));
        document.getElementById('bet-plus').addEventListener('click', () => this.adjustBet(1));

        // Paytable
        document.getElementById('paytable-button').addEventListener('click', () => this.togglePaytable());
        document.getElementById('modal-close').addEventListener('click', () => this.togglePaytable());

        // Debug menu
        document.getElementById('debug-toggle').addEventListener('click', () => this.toggleDebugMenu());
        document.getElementById('debug-add-balance').addEventListener('click', () => this.debugAddBalance());
        document.getElementById('debug-trigger-bonus').addEventListener('click', () => this.debugTriggerBonus());
        document.getElementById('debug-force-win').addEventListener('click', () => this.debugForceBigWin());
        document.getElementById('debug-force-buffalos').addEventListener('click', () => this.debugForceBuffalos());
        document.getElementById('debug-reset').addEventListener('click', () => this.debugReset());
        document.getElementById('debug-next-spin').addEventListener('change', (e) => {
            this.debugNextSpin = e.target.value;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.spin();
            }
        });
    }

    // Adjust number of lines
    adjustLines(direction) {
        const currentIndex = this.lineOptions.indexOf(this.currentLines);
        const newIndex = Math.max(0, Math.min(this.lineOptions.length - 1, currentIndex + direction));
        this.currentLines = this.lineOptions[newIndex];
        this.updateUI();
    }

    // Set maximum lines
    setMaxLines() {
        this.currentLines = this.maxLines;
        this.updateUI();
    }

    // Adjust bet per line
    adjustBet(direction) {
        this.currentBetIndex = Math.max(0, Math.min(this.betOptions.length - 1, this.currentBetIndex + direction));
        this.betPerLine = this.betOptions[this.currentBetIndex];
        this.updateUI();
    }

    // Toggle paytable modal
    togglePaytable() {
        const modal = document.getElementById('paytable-modal');
        modal.classList.toggle('active');
    }

    // Toggle debug menu
    toggleDebugMenu() {
        const menu = document.getElementById('debug-menu');
        menu.classList.toggle('active');
    }

    // Debug: Add balance
    debugAddBalance() {
        this.balance += 1000;
        this.updateUI();
        this.saveGameState();
    }

    // Debug: Trigger bonus
    debugTriggerBonus() {
        this.debugNextSpin = 'bonus';
        alert('Next spin will trigger bonus round!');
    }

    // Debug: Force big win
    debugForceBigWin() {
        this.debugNextSpin = 'big-win';
        alert('Next spin will be a big win!');
    }

    // Debug: Force 5 buffalos
    debugForceBuffalos() {
        this.debugNextSpin = 'buffalo-line';
        alert('Next spin will show 5 buffalos!');
    }

    // Debug: Reset game
    debugReset() {
        if (confirm('Reset all game data?')) {
            localStorage.removeItem('slotMachineState');
            location.reload();
        }
    }

    // Apply debug spin configuration
    applyDebugSpin() {
        switch (this.debugNextSpin) {
            case 'bonus':
                // Force scatter symbols
                this.reels = [
                    ['SCATTER', 'DIAMOND', 'STAR'],
                    ['SCATTER', 'CROWN', 'BELL'],
                    ['SCATTER', 'CHERRY', 'CLOVER'],
                    ['STAR', 'BELL', 'DIAMOND'],
                    ['CROWN', 'CHERRY', 'STAR']
                ];
                break;

            case 'big-win':
                // Force high-value symbols
                this.reels = [
                    ['DIAMOND', 'BUFFALO', 'CROWN'],
                    ['DIAMOND', 'BUFFALO', 'CROWN'],
                    ['DIAMOND', 'BUFFALO', 'CROWN'],
                    ['DIAMOND', 'BUFFALO', 'CROWN'],
                    ['DIAMOND', 'BUFFALO', 'CROWN']
                ];
                break;

            case 'buffalo-line':
                // Force 5 buffalos on middle line
                this.reels = [
                    ['STAR', 'BUFFALO', 'CHERRY'],
                    ['BELL', 'BUFFALO', 'CLOVER'],
                    ['CROWN', 'BUFFALO', 'DIAMOND'],
                    ['CHERRY', 'BUFFALO', 'STAR'],
                    ['CLOVER', 'BUFFALO', 'BELL']
                ];
                break;

            case 'scatter-win':
                // Force many scatters
                this.reels = [
                    ['SCATTER', 'SCATTER', 'STAR'],
                    ['SCATTER', 'CROWN', 'SCATTER'],
                    ['BELL', 'SCATTER', 'CHERRY'],
                    ['SCATTER', 'CLOVER', 'SCATTER'],
                    ['STAR', 'SCATTER', 'DIAMOND']
                ];
                break;

            default:
                this.generateReels();
        }

        // Reset debug mode after one spin
        this.debugNextSpin = 'normal';
        document.getElementById('debug-next-spin').value = 'normal';
    }

    // Save game state to localStorage
    saveGameState() {
        const state = {
            balance: this.balance,
            currentLines: this.currentLines,
            currentBetIndex: this.currentBetIndex,
            betPerLine: this.betPerLine,
            totalWon: this.totalWon,
            lastBonusDate: this.lastBonusDate
        };
        localStorage.setItem('slotMachineState', JSON.stringify(state));
    }

    // Load game state from localStorage
    loadGameState() {
        const saved = localStorage.getItem('slotMachineState');
        if (saved) {
            const state = JSON.parse(saved);
            this.balance = state.balance || 100;
            this.currentLines = state.currentLines || 50;
            this.currentBetIndex = state.currentBetIndex || 0;
            this.betPerLine = state.betPerLine || 0.01;
            this.totalWon = state.totalWon || 0;
            this.lastBonusDate = state.lastBonusDate || null;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SlotMachine();

    // Make game accessible in console for debugging
    window.slotGame = game;
});

// Ocean Fortune Slots Game Engine
// Professional slot machine with expanding reels bonus, free spins, and 2000 paylines support

class SlotMachine {
    constructor() {
        // Game configuration
        this.symbols = {
            TROPICAL_FISH: { emoji: '🐠', name: 'Tropical Fish', isWild: true },
            DIAMOND: { emoji: '💎', name: 'Diamond' },
            OCTOPUS: { emoji: '🐙', name: 'Octopus' },
            SHELL: { emoji: '🐚', name: 'Shell' },
            STARFISH: { emoji: '⭐', name: 'Starfish' },
            CRAB: { emoji: '🦀', name: 'Crab' },
            FISH: { emoji: '🐟', name: 'Fish' },
            LOBSTER: { emoji: '🦞', name: 'Lobster' },
            SCATTER: { emoji: '🌊', name: 'Wave', isScatter: true },
            BONUS: { emoji: '🐡', name: 'Pufferfish', isBonus: true }
        };

        // Symbol weights for reel generation (higher = more common)
        this.symbolWeights = {
            TROPICAL_FISH: 3,
            DIAMOND: 5,
            OCTOPUS: 8,
            SHELL: 10,
            STARFISH: 12,
            CRAB: 15,
            FISH: 18,
            LOBSTER: 20,
            SCATTER: 4,
            BONUS: 4
        };

        // Paytable (multipliers based on bet per line)
        this.paytable = {
            TROPICAL_FISH: { 5: 5000, 4: 500, 3: 100, 2: 10 },
            DIAMOND: { 5: 1000, 4: 200, 3: 50, 2: 5 },
            OCTOPUS: { 5: 750, 4: 150, 3: 40 },
            SHELL: { 5: 500, 4: 100, 3: 30 },
            STARFISH: { 5: 400, 4: 80, 3: 25 },
            CRAB: { 5: 300, 4: 60, 3: 20 },
            FISH: { 5: 250, 4: 50, 3: 15 },
            LOBSTER: { 5: 200, 4: 40, 3: 10 }
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
        this.expandingReelsActive = false;
        this.expandingReelsSpinsRemaining = 0;
        this.debugNextSpin = 'normal';
        this.autoPlayActive = false;
        this.autoPlaySpinsRemaining = 0;
        this.turboMode = false;

        // Available bet options
        this.betOptions = [0.01, 0.02, 0.05, 0.10, 0.25, 0.50, 1.00, 2.00, 5.00];
        this.currentBetIndex = 0;
        this.maxLines = 2000;
        this.lineOptions = [1, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 1500, 2000];

        // Reels configuration
        this.reelCount = 5;
        this.symbolsPerReel = 3;
        this.baseSymbolsPerReel = 3; // Store base value
        this.reels = [];

        // Daily bonus tracking
        this.lastBonusDate = null;

        // Bet history
        this.betHistory = [];

        this.init();
    }

    init() {
        this.loadGameState();
        this.checkDailyBonus();
        this.setupEventListeners();
        this.updateUI();
        this.generateReels();
        this.createBubbles();
    }

    // Create animated bubbles background
    createBubbles() {
        const bubblesContainer = document.getElementById('bubbles-container');

        // Create bubbles continuously
        setInterval(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            // Random size
            const size = Math.random() * 60 + 20;
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';

            // Random horizontal position
            const left = Math.random() * 100;
            bubble.style.left = left + '%';

            // Random animation duration
            const duration = Math.random() * 10 + 10;
            bubble.style.animationDuration = duration + 's';

            // Random horizontal drift
            const drift = (Math.random() - 0.5) * 200;
            bubble.style.setProperty('--drift', drift + 'px');

            bubblesContainer.appendChild(bubble);

            // Remove bubble after animation
            setTimeout(() => {
                bubble.remove();
            }, duration * 1000);
        }, 1000);
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

        // Update reel display to match current symbolsPerReel
        this.updateReelContainers();
    }

    // Update reel containers for expanding reels
    updateReelContainers() {
        const reelsContainer = document.querySelector('.reels-container');
        reelsContainer.innerHTML = '';

        for (let i = 0; i < this.reelCount; i++) {
            const reelDiv = document.createElement('div');
            reelDiv.className = 'reel';
            reelDiv.id = `reel-${i}`;

            // Adjust height based on rows
            const baseHeight = 100; // Base height per symbol
            reelDiv.style.height = (baseHeight * this.symbolsPerReel) + 'px';

            for (let j = 0; j < this.symbolsPerReel; j++) {
                const symbolContainer = document.createElement('div');
                symbolContainer.className = 'symbol-container';
                symbolContainer.style.height = baseHeight + 'px';

                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                symbol.textContent = this.symbols[this.reels[i][j]].emoji;

                symbolContainer.appendChild(symbol);
                reelDiv.appendChild(symbolContainer);
            }

            reelsContainer.appendChild(reelDiv);
        }
    }

    // Generate paylines based on number of lines and rows
    generatePaylines(lineCount) {
        const paylines = [];
        const rows = this.symbolsPerReel;

        // Generate basic patterns based on rows
        if (rows === 3) {
            // Standard 3-row paylines
            if (lineCount >= 1) paylines.push([1, 1, 1, 1, 1]); // Middle row
            if (lineCount >= 2) paylines.push([0, 0, 0, 0, 0]); // Top row
            if (lineCount >= 3) paylines.push([2, 2, 2, 2, 2]); // Bottom row
            if (lineCount >= 4) paylines.push([0, 1, 2, 1, 0]); // V shape
            if (lineCount >= 5) paylines.push([2, 1, 0, 1, 2]); // Inverted V
        } else if (rows === 4) {
            // 4-row paylines
            if (lineCount >= 1) paylines.push([1, 1, 1, 1, 1]);
            if (lineCount >= 2) paylines.push([2, 2, 2, 2, 2]);
            if (lineCount >= 3) paylines.push([0, 0, 0, 0, 0]);
            if (lineCount >= 4) paylines.push([3, 3, 3, 3, 3]);
            if (lineCount >= 5) paylines.push([0, 1, 2, 3, 2]);
            if (lineCount >= 6) paylines.push([3, 2, 1, 0, 1]);
        } else if (rows === 5) {
            // 5-row paylines
            if (lineCount >= 1) paylines.push([2, 2, 2, 2, 2]);
            if (lineCount >= 2) paylines.push([1, 1, 1, 1, 1]);
            if (lineCount >= 3) paylines.push([3, 3, 3, 3, 3]);
            if (lineCount >= 4) paylines.push([0, 0, 0, 0, 0]);
            if (lineCount >= 5) paylines.push([4, 4, 4, 4, 4]);
            if (lineCount >= 6) paylines.push([0, 1, 2, 3, 4]);
            if (lineCount >= 7) paylines.push([4, 3, 2, 1, 0]);
        }

        // Additional complex paylines
        const additionalPatterns = [];
        for (let i = 0; i < 50; i++) {
            const pattern = [];
            for (let j = 0; j < this.reelCount; j++) {
                pattern.push(Math.floor(Math.random() * rows));
            }
            additionalPatterns.push(pattern);
        }

        let currentLine = paylines.length;
        for (const pattern of additionalPatterns) {
            if (currentLine >= lineCount) break;
            paylines.push(pattern);
            currentLine++;
        }

        // Generate additional random paylines up to requested count
        while (paylines.length < lineCount && paylines.length < this.maxLines) {
            const randomPattern = [];
            for (let i = 0; i < this.reelCount; i++) {
                randomPattern.push(Math.floor(Math.random() * rows));
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

        // Check scatter wins first (free spins)
        const scatterCount = this.countSymbol('SCATTER');
        if (scatterCount >= 3) {
            if (this.freeSpinsRemaining === 0 && !this.expandingReelsActive) {
                this.triggerFreeSpins(scatterCount);
            } else {
                // Retrigger free spins
                this.freeSpinsRemaining += this.calculateFreeSpins(scatterCount);
                this.showMessage(`+${this.calculateFreeSpins(scatterCount)} FREE SPINS!`);
            }
        }

        // Check bonus wins (expanding reels)
        const bonusCount = this.countSymbol('BONUS');
        if (bonusCount >= 3) {
            if (!this.expandingReelsActive && this.freeSpinsRemaining === 0) {
                this.triggerExpandingReels(bonusCount);
            } else {
                // Add more spins if already in bonus
                this.expandingReelsSpinsRemaining += this.calculateExpandingSpins(bonusCount);
                this.showMessage(`+${this.calculateExpandingSpins(bonusCount)} MEGA REEL SPINS!`);
            }
        }

        // Check each payline
        paylines.forEach((payline, lineIndex) => {
            const symbols = payline.map((row, reelIndex) => this.reels[reelIndex][row]);
            const win = this.checkPaylineWin(symbols);

            if (win.amount > 0) {
                const multiplier = this.freeSpinsMultiplier * (this.expandingReelsActive ? 3 : 1);
                totalWin += win.amount * this.betPerLine * multiplier;
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

        // Skip scatters and bonus symbols in payline wins
        if (this.symbols[matchSymbol].isScatter || this.symbols[matchSymbol].isBonus) {
            return { amount: 0, count: 0, matchedSymbols: null, multiplier: 0 };
        }

        // Handle wild symbols
        if (this.symbols[matchSymbol].isWild) {
            for (let i = 1; i < symbols.length; i++) {
                if (symbols[i] === matchSymbol || this.symbols[symbols[i]].isWild) {
                    matchCount++;
                } else if (!this.symbols[symbols[i]].isScatter && !this.symbols[symbols[i]].isBonus) {
                    matchSymbol = symbols[i];
                    break;
                } else {
                    break;
                }
            }
        }

        // Continue matching from left to right
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === matchSymbol || this.symbols[symbols[i]].isWild) {
                matchCount++;
            } else if (this.symbols[symbols[i]].isScatter || this.symbols[symbols[i]].isBonus) {
                // Don't break on scatters/bonus, but don't count them
                continue;
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

    // Count specific symbol anywhere on reels
    countSymbol(symbolKey) {
        let count = 0;
        this.reels.forEach(reel => {
            reel.forEach(symbol => {
                if (symbol === symbolKey) {
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
            6: 50,
            7: 75,
            8: 100
        };
        return freeSpinsTable[scatterCount] || 10;
    }

    // Calculate expanding reels spins
    calculateExpandingSpins(bonusCount) {
        const expandingSpinsTable = {
            3: 8,
            4: 12,
            5: 20,
            6: 30,
            7: 50,
            8: 75
        };
        return expandingSpinsTable[bonusCount] || 8;
    }

    // Trigger free spins bonus
    triggerFreeSpins(scatterCount) {
        this.freeSpinsRemaining = this.calculateFreeSpins(scatterCount);
        this.freeSpinsMultiplier = 2;
        this.showFreeSpinsBanner(true);
        this.showMessage(`🌊 ${this.freeSpinsRemaining} FREE SPINS! 🌊\n2x MULTIPLIER!`);
    }

    // Trigger expanding reels bonus
    triggerExpandingReels(bonusCount) {
        this.expandingReelsActive = true;
        this.expandingReelsSpinsRemaining = this.calculateExpandingSpins(bonusCount);

        // Expand to 5 rows instead of 3
        this.symbolsPerReel = 5;

        // Increase paylines dramatically
        const originalLines = this.currentLines;
        this.currentLines = Math.min(this.currentLines * 3, this.maxLines);

        this.generateReels();
        this.showExpandingReelsBanner(true);
        this.showMessage(`🐙 MEGA REELS BONUS! 🐙\n${this.expandingReelsSpinsRemaining} Spins!\n${this.symbolsPerReel} Rows!\n${this.currentLines} Paylines!\n3x Multiplier!`);
    }

    // End expanding reels bonus
    endExpandingReels() {
        this.expandingReelsActive = false;
        this.symbolsPerReel = this.baseSymbolsPerReel;
        this.currentLines = Math.floor(this.currentLines / 3);
        this.generateReels();
        this.showExpandingReelsBanner(false);
        this.showMessage('MEGA REELS COMPLETE!');
    }

    // Spin the reels
    async spin() {
        if (this.isSpinning) return;

        const totalBet = this.currentLines * this.betPerLine;

        // Check if player can afford the bet (unless in free spins or expanding reels)
        if (this.freeSpinsRemaining === 0 && !this.expandingReelsActive && this.balance < totalBet) {
            alert('Insufficient balance! Please reduce your bet or claim your daily bonus.');
            return;
        }

        this.isSpinning = true;
        this.updateSpinButton(true);

        // Deduct bet (unless free spins or expanding reels)
        if (this.freeSpinsRemaining === 0 && !this.expandingReelsActive) {
            this.balance -= totalBet;
            this.betHistory.push({
                bet: totalBet,
                timestamp: new Date().toISOString()
            });
        } else if (this.freeSpinsRemaining > 0) {
            this.freeSpinsRemaining--;
            this.updateFreeSpinsDisplay();
        } else if (this.expandingReelsActive) {
            this.expandingReelsSpinsRemaining--;
            this.updateExpandingReelsDisplay();
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

        // Check if expanding reels ended
        if (this.expandingReelsActive && this.expandingReelsSpinsRemaining === 0) {
            this.endExpandingReels();
        }

        this.updateUI();
        this.saveGameState();
        this.isSpinning = false;
        this.updateSpinButton(false);

        // Auto-spin if in free spins, expanding reels, or auto-play mode
        const delay = this.turboMode ? 500 : 2000;
        if (this.freeSpinsRemaining > 0 || this.expandingReelsActive) {
            setTimeout(() => this.spin(), delay);
        } else if (this.autoPlayActive && this.autoPlaySpinsRemaining > 0) {
            this.autoPlaySpinsRemaining--;
            setTimeout(() => this.spin(), delay);
        }
    }

    // Animate reel spinning
    async animateReels() {
        const reelElements = document.querySelectorAll('.reel');
        const spinDuration = this.turboMode ? 1000 : 2000;
        const reelDelay = this.turboMode ? 100 : 200;

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
                        const containers = reel.querySelectorAll('.symbol-container');
                        if (containers[row]) {
                            containers[row].classList.add('winning');
                        }
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
        }, this.turboMode ? 1000 : 2000);
    }

    // Show message to player
    showMessage(message) {
        if (!this.turboMode) {
            alert(message);
        }
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

    // Show/hide expanding reels banner
    showExpandingReelsBanner(show) {
        const banner = document.getElementById('expanding-reels-banner');
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

    // Update expanding reels display
    updateExpandingReelsDisplay() {
        const expandingReelsCount = document.getElementById('expanding-reels-count');
        expandingReelsCount.textContent = `${this.expandingReelsSpinsRemaining} Mega Reel Spins Left!`;
    }

    // Check and award daily bonus
    checkDailyBonus() {
        const today = new Date().toDateString();

        if (this.lastBonusDate !== today) {
            this.balance += 100;
            this.lastBonusDate = today;
            this.saveGameState();
            this.showMessage('🌊 Daily Bonus: $100 added to your balance!');
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
            } else if (this.expandingReelsActive) {
                button.querySelector('.spin-text').textContent = 'MEGA SPIN';
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

        // Max bet button
        document.getElementById('max-bet').addEventListener('click', () => this.setMaxBet());

        // Auto play toggle
        document.getElementById('autoplay-toggle').addEventListener('click', () => this.toggleAutoPlay());

        // Turbo toggle
        document.getElementById('turbo-toggle').addEventListener('click', () => this.toggleTurbo());

        // Paytable
        document.getElementById('paytable-button').addEventListener('click', () => this.togglePaytable());
        document.getElementById('modal-close').addEventListener('click', () => this.togglePaytable());

        // Debug menu
        document.getElementById('debug-toggle').addEventListener('click', () => this.toggleDebugMenu());
        document.getElementById('debug-add-balance').addEventListener('click', () => this.debugAddBalance());
        document.getElementById('debug-trigger-bonus').addEventListener('click', () => this.debugTriggerBonus());
        document.getElementById('debug-trigger-expanding').addEventListener('click', () => this.debugTriggerExpanding());
        document.getElementById('debug-force-win').addEventListener('click', () => this.debugForceBigWin());
        document.getElementById('debug-force-wilds').addEventListener('click', () => this.debugForceWilds());
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
        if (this.expandingReelsActive) return; // Can't adjust during bonus
        const currentIndex = this.lineOptions.indexOf(this.currentLines);
        const newIndex = Math.max(0, Math.min(this.lineOptions.length - 1, currentIndex + direction));
        this.currentLines = this.lineOptions[newIndex];
        this.updateUI();
    }

    // Set maximum lines
    setMaxLines() {
        if (this.expandingReelsActive) return;
        this.currentLines = this.maxLines;
        this.updateUI();
    }

    // Adjust bet per line
    adjustBet(direction) {
        this.currentBetIndex = Math.max(0, Math.min(this.betOptions.length - 1, this.currentBetIndex + direction));
        this.betPerLine = this.betOptions[this.currentBetIndex];
        this.updateUI();
    }

    // Set max bet
    setMaxBet() {
        this.currentBetIndex = this.betOptions.length - 1;
        this.betPerLine = this.betOptions[this.currentBetIndex];
        this.currentLines = this.maxLines;
        this.updateUI();
    }

    // Toggle auto play
    toggleAutoPlay() {
        this.autoPlayActive = !this.autoPlayActive;
        const button = document.getElementById('autoplay-toggle');

        if (this.autoPlayActive) {
            this.autoPlaySpinsRemaining = 10; // Default 10 spins
            button.textContent = 'STOP AUTO';
            button.style.backgroundColor = '#ff4444';
            if (!this.isSpinning) {
                this.spin();
            }
        } else {
            this.autoPlaySpinsRemaining = 0;
            button.textContent = 'AUTO PLAY';
            button.style.backgroundColor = '';
        }
    }

    // Toggle turbo mode
    toggleTurbo() {
        this.turboMode = !this.turboMode;
        const button = document.getElementById('turbo-toggle');
        button.textContent = this.turboMode ? 'TURBO: ON' : 'TURBO: OFF';
        button.style.backgroundColor = this.turboMode ? '#4CAF50' : '';
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

    // Debug: Trigger free spins bonus
    debugTriggerBonus() {
        this.debugNextSpin = 'bonus';
        alert('Next spin will trigger free spins bonus!');
    }

    // Debug: Trigger expanding reels
    debugTriggerExpanding() {
        this.debugNextSpin = 'expanding';
        alert('Next spin will trigger mega reels bonus!');
    }

    // Debug: Force big win
    debugForceBigWin() {
        this.debugNextSpin = 'big-win';
        alert('Next spin will be a big win!');
    }

    // Debug: Force 5 wilds
    debugForceWilds() {
        this.debugNextSpin = 'wild-line';
        alert('Next spin will show 5 wild symbols!');
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
                // Force scatter symbols (free spins)
                this.reels = [];
                for (let i = 0; i < this.reelCount; i++) {
                    const reel = [];
                    for (let j = 0; j < this.symbolsPerReel; j++) {
                        reel.push(j === 0 ? 'SCATTER' : this.getRandomSymbol());
                    }
                    this.reels.push(reel);
                }
                break;

            case 'expanding':
                // Force bonus symbols (expanding reels)
                this.reels = [];
                for (let i = 0; i < this.reelCount; i++) {
                    const reel = [];
                    for (let j = 0; j < this.symbolsPerReel; j++) {
                        reel.push(j === 1 ? 'BONUS' : this.getRandomSymbol());
                    }
                    this.reels.push(reel);
                }
                break;

            case 'big-win':
                // Force high-value symbols
                this.reels = [];
                for (let i = 0; i < this.reelCount; i++) {
                    const reel = [];
                    for (let j = 0; j < this.symbolsPerReel; j++) {
                        const symbols = ['DIAMOND', 'TROPICAL_FISH', 'OCTOPUS'];
                        reel.push(symbols[j % symbols.length]);
                    }
                    this.reels.push(reel);
                }
                break;

            case 'wild-line':
                // Force 5 wilds on middle line
                const middleRow = Math.floor(this.symbolsPerReel / 2);
                this.reels = [];
                for (let i = 0; i < this.reelCount; i++) {
                    const reel = [];
                    for (let j = 0; j < this.symbolsPerReel; j++) {
                        reel.push(j === middleRow ? 'TROPICAL_FISH' : this.getRandomSymbol());
                    }
                    this.reels.push(reel);
                }
                break;

            case 'scatter-win':
                // Force many scatters
                this.reels = [];
                for (let i = 0; i < this.reelCount; i++) {
                    const reel = [];
                    for (let j = 0; j < this.symbolsPerReel; j++) {
                        reel.push(Math.random() > 0.5 ? 'SCATTER' : this.getRandomSymbol());
                    }
                    this.reels.push(reel);
                }
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
            lastBonusDate: this.lastBonusDate,
            betHistory: this.betHistory.slice(-100) // Keep last 100 bets
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
            this.betHistory = state.betHistory || [];
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SlotMachine();

    // Make game accessible in console for debugging
    window.slotGame = game;
});

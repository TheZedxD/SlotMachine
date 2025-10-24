# 🦬 Buffalo Slots - Casino Slot Machine Game

A professional, feature-rich slot machine web application inspired by the popular Buffalo casino game. Built with vanilla JavaScript, HTML, and CSS for maximum compatibility and ease of use.

## 🎰 Features

### Core Gameplay
- **5-Reel Slot Machine** with 3 symbols per reel
- **Up to 2000 Paylines** - Start with 50 lines and scale up to maximum
- **Variable Betting** - Adjust bet per line from $0.01 to $5.00
- **Professional Animations** - Smooth reel spinning and winning effects
- **Wild Symbols** - Buffalo acts as wild, substituting for all symbols except scatter
- **Scatter Symbols** - Trigger bonus features anywhere on the reels

### Bonus Features
- **Free Spins Round** - 3+ scatter symbols trigger 10-50 free spins
- **2x Multiplier** - All wins during free spins are doubled
- **Retriggerable** - Get more free spins during the bonus round
- **Auto-Play** - Free spins play automatically

### Economy System
- **Starting Balance** - Begin with $100
- **Daily Bonus** - Receive $100 every day you play
- **Persistent Balance** - Your balance is saved using localStorage
- **Win Tracking** - Track your last win and total winnings

### Paytable (5 of a kind)
- 🦬 Buffalo (Wild): 5000x bet per line
- 💎 Diamond: 1000x
- 👑 Crown: 750x
- 🔔 Bell: 500x
- 🍀 Clover: 400x
- ⭐ Star: 300x
- 7️⃣ Seven: 250x
- 🍒 Cherry: 200x
- 🎰 Scatter: Triggers bonus round

### Debug Menu
A powerful debug menu for testing and development:
- **Add $1000** - Instantly add funds to your balance
- **Trigger Bonus** - Force next spin to trigger free spins
- **Force Big Win** - Next spin guarantees a big win
- **Force 5 Buffalos** - Next spin shows 5 buffalo symbols
- **Reset Game** - Clear all saved data and start fresh
- **Next Spin Control** - Choose what happens on the next spin

## 🚀 Getting Started

### Installation
1. Clone or download this repository
2. No build process required - it's pure HTML/CSS/JS!

### Running the Game
Simply open `index.html` in any modern web browser:
```bash
# Option 1: Direct file opening
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux

# Option 2: Using a local server (recommended)
python -m http.server 8000
# Then visit http://localhost:8000
```

### Controls
- **SPIN Button** - Click to spin the reels (or press Space/Enter)
- **Lines +/-** - Adjust number of active paylines
- **MAX Button** - Set to maximum paylines (2000)
- **Bet +/-** - Adjust bet amount per line
- **💎 Paytable** - View all winning combinations
- **🔧 Debug Toggle** - Open/close debug menu

## 🎮 How to Play

1. **Set Your Bet**
   - Choose number of lines (1-2000)
   - Select bet per line ($0.01-$5.00)
   - Total bet = Lines × Bet per line

2. **Spin the Reels**
   - Click SPIN or press Space/Enter
   - Watch the reels spin and stop
   - Winning combinations are highlighted

3. **Win Conditions**
   - Match 3+ symbols on active paylines
   - Buffalo (🦬) substitutes for any symbol except scatter
   - 3+ scatters trigger free spins bonus

4. **Bonus Round**
   - Triggered by 3+ scatter symbols
   - Receive 10-50 free spins with 2x multiplier
   - Can be retriggered during free spins
   - Plays automatically

5. **Daily Bonus**
   - Log in each day for $100 bonus
   - Balance and progress are saved automatically

## 🔧 Technical Details

### Architecture
- **game.js** - Core game engine and logic
  - SlotMachine class handles all game state
  - Symbol generation with weighted probabilities
  - Payline calculation up to 2000 lines
  - Win calculation and payout logic
  - Bonus feature management
  - localStorage integration

- **styles.css** - Professional styling
  - Gradient backgrounds and glowing effects
  - Smooth animations and transitions
  - Responsive design for mobile/desktop
  - Casino-themed color scheme

- **index.html** - Clean semantic structure
  - Accessible UI components
  - Modal dialogs
  - Real-time stat displays

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies
- No build tools required
- Mobile responsive

### Data Persistence
Game state is saved to localStorage:
- Current balance
- Bet settings
- Total winnings
- Last daily bonus date

## 🎲 Game Mathematics

### RTP (Return to Player)
The game uses weighted symbol distribution for realistic casino-like gameplay:
- Common symbols (Cherry, Seven, Star): Higher frequency, lower payouts
- Medium symbols (Clover, Bell, Crown): Balanced frequency and payouts
- Premium symbols (Diamond, Buffalo): Lower frequency, higher payouts
- Scatter symbols: Rare, trigger bonus features

### Paylines
The game supports up to 2000 paylines:
- Lines 1-5: Standard horizontal and diagonal patterns
- Lines 6-17: Complex zigzag patterns
- Lines 18-2000: Randomly generated unique patterns
- More lines = more chances to win per spin

### Volatility
Medium-high volatility design:
- Frequent small wins keep gameplay engaging
- Occasional big wins from premium symbols
- Bonus rounds provide excitement and large win potential
- Free spins with 2x multiplier significantly boost payouts

## 🛠️ Customization

### Adding New Symbols
Edit `game.js` to add symbols:
```javascript
this.symbols = {
    NEW_SYMBOL: { emoji: '🎁', name: 'Gift' }
};

this.symbolWeights = {
    NEW_SYMBOL: 10 // Adjust rarity
};

this.paytable = {
    NEW_SYMBOL: { 5: 500, 4: 100, 3: 25 }
};
```

### Adjusting Bet Options
Modify the `betOptions` array:
```javascript
this.betOptions = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00];
```

### Changing Starting Balance
Update the constructor:
```javascript
this.balance = 200; // Start with $200
```

### Modifying Free Spins
Adjust the free spins table:
```javascript
calculateFreeSpins(scatterCount) {
    const freeSpinsTable = {
        3: 15,  // 15 spins for 3 scatters
        4: 25,  // 25 spins for 4 scatters
        5: 50   // 50 spins for 5 scatters
    };
    return freeSpinsTable[scatterCount] || 15;
}
```

## 🔮 Future Enhancements

Potential features for future versions:
- Multiple themed slot machines (Egyptian, Space, Ocean, etc.)
- Progressive jackpot system
- Achievement system
- Leaderboards
- Sound effects and music
- More bonus game types
- Mini-games within free spins
- Multi-level progressive features

## 📝 Development Notes

### Debug Menu Usage
Access debug features by clicking the 🔧 button:
- Test different winning scenarios
- Verify bonus round logic
- Quick balance adjustments for testing
- Force specific outcomes for demonstration

### Console Access
The game object is available in the browser console:
```javascript
// Access game state
console.log(window.slotGame.balance);

// Manually trigger functions
window.slotGame.spin();
window.slotGame.triggerFreeSpins(3);
```

## 🎯 Standalone Application

This is a completely standalone application:
- No server required
- No internet connection needed after download
- No external dependencies
- Works offline
- Just download and play!

---

**Enjoy playing Buffalo Slots! 🦬🎰💰**

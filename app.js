 class RetroAudio {
            constructor() {
                this.ctx = null;
                this.muted = false;
            }

            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                }
            }

            playMove() {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.04);
                gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            }

            playRotate() {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(260, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.06);
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.06);
            }

            playHardDrop() {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                
                // Bass pulse
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            }

            playQuack(isSuper = false) {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sawtooth';
                const baseFreq = isSuper ? 460 : 320;
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.frequency.linearRampToValueAtTime(baseFreq * 0.65, now + 0.1);
                osc.frequency.linearRampToValueAtTime(baseFreq * 0.85, now + 0.22);

                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.22);
            }

            playGameOver() {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.linearRampToValueAtTime(120, now + 0.25);
                osc.frequency.linearRampToValueAtTime(60, now + 0.6);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.6);
            }
        }

        const audio = new RetroAudio();

        /* -------------------------------------------------------------------------
         * PIXEL DUCK MASCOT
         * ------------------------------------------------------------------------- */
        class DuckMascot {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
                this.state = 'IDLE'; // IDLE, QUACK, TETRIS, GAMEOVER
                this.bubble = document.getElementById('duck-bubble');
                this.bubbleTimeout = null;
            }

            setState(newState, text = null) {
                this.state = newState;
                if (text) {
                    this.bubble.innerText = text;
                    this.bubble.classList.remove('opacity-0');
                    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
                    this.bubbleTimeout = setTimeout(() => {
                        this.bubble.classList.add('opacity-0');
                    }, 2200);
                }
                this.draw();
            }

            draw() {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                const p = 4.5;
                const offsetX = 4;
                const offsetY = 4;

                const YEL = '#ffe600';
                const ORG = '#ff6600';
                const BLK = '#000000';
                const WHT = '#ffffff';

                const duckSprite = [
                    "................",
                    ".....YYYYY......",
                    "....YYYYYYY.....",
                    "....YYBYYYY.....",
                    "....YYYYYYYY....",
                    "...OOOYYYYYY....",
                    "..OOOOOYYYYY....",
                    "...OOOYYYYYY....",
                    "....YYYYYYYY....",
                    "...YYYYYYYYYY...",
                    "..YYYYYYYYYYYY..",
                    "..YYYYYYYYYYYY..",
                    "..YYYYYYYYYYYY..",
                    "...YYYYYYYYYY...",
                    "....OO....OO....",
                    "...OOO...OOO...."
                ];

                ctx.save();
                ctx.translate(offsetX, offsetY);

                if (this.state === 'IDLE' && Math.floor(Date.now() / 450) % 2 === 0) {
                    ctx.translate(0, 2);
                }

                for (let r = 0; r < 16; r++) {
                    for (let c = 0; c < 16; c++) {
                        const char = duckSprite[r][c];
                        if (char === '.') continue;

                        let color = YEL;
                        if (char === 'Y') color = YEL;
                        if (char === 'B') color = BLK;
                        if (char === 'O') color = ORG;

                        if (r === 3 && c === 6 && (this.state === 'GAMEOVER' || this.state === 'TETRIS')) {
                            continue; // handled below
                        }

                        ctx.fillStyle = color;
                        ctx.fillRect(c * p, r * p, p, p);
                    }
                }

                // Mascot Sunglasses or Dead Eyes
                if (this.state === 'TETRIS') {
                    ctx.fillStyle = BLK;
                    ctx.fillRect(3 * p, 3 * p, 6 * p, 2 * p);
                    ctx.fillStyle = WHT;
                    ctx.fillRect(4 * p, 3 * p, 1 * p, 1 * p);
                } else if (this.state === 'GAMEOVER') {
                    ctx.fillStyle = BLK;
                    ctx.fillRect(5 * p, 2 * p, 2 * p, 3 * p);
                } else if (this.state === 'QUACK') {
                    ctx.fillStyle = '#cc0000';
                    ctx.fillRect(2 * p, 6 * p, 3 * p, 2 * p);
                }

                ctx.restore();
            }
        }

        /* -------------------------------------------------------------------------
         * GAME CONSTANTS & PIECES
         * ------------------------------------------------------------------------- */
        const COLS = 10;
        const ROWS = 20;
        const BLOCK_SIZE = 30;
        const LOCK_SCORE = 10;
        const LINES_PER_LEVEL = 10;
        const INITIAL_DROP_INTERVAL = 1000;
        const DROP_INTERVAL_PER_LEVEL = 40;
        const MIN_DROP_INTERVAL = 250;
        const MAX_THEME_LEVEL = 13;

        const PIECES = {
            'I': { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00f0f0', border: '#80ffff' },
            'J': { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#0000f0', border: '#8080ff' },
            'L': { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#f0a000', border: '#ffd080' },
            'O': { shape: [[1,1],[1,1]], color: '#f0f000', border: '#ffff80' },
            'S': { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#00f000', border: '#80ff80' },
            'T': { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#a000f0', border: '#d080ff' },
            'Z': { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#f00000', border: '#ff8080' }
        };

        const PIECE_KEYS = Object.keys(PIECES);

        class TetrisGame {
            constructor() {
                this.canvas = document.getElementById('tetrisCanvas');
                this.ctx = this.canvas.getContext('2d');

                this.nextCanvas = document.getElementById('nextCanvas');
                this.nextCtx = this.nextCanvas.getContext('2d');

                this.holdCanvas = document.getElementById('holdCanvas');
                this.holdCtx = this.holdCanvas.getContext('2d');

                this.floatingContainer = document.getElementById('floating-text-container');

                this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

                this.score = 0;
                this.highScore = localStorage.getItem('quack_tetris_highscore') || 0;
                this.lines = 0;
                this.level = 1;
                this.combo = 0;

                this.currentPiece = null;
                this.nextPiece = null;
                this.holdPiece = null;
                this.canHold = true;

                this.gameOver = false;
                this.isPaused = false;
                this.isPlaying = false;

                this.dropCounter = 0;
                this.dropInterval = INITIAL_DROP_INTERVAL;
                this.lastTime = 0;

                this.duck = new DuckMascot('duckCanvas');
                this.particles = [];
                this.clearingLines = []; // Animation state for cleared lines

                this.updateThemeColor();
                this.updateUI();
            }

            updateThemeColor() {
                // Hue shifts from neon yellow to neon red over the first 13 levels.
                const maxHue = 52; // Yellow
                const minHue = 0;  // Red
                const progress = Math.min(1, (this.level - 1) / (MAX_THEME_LEVEL - 1));

                const currentHue = Math.floor(maxHue - (progress * (maxHue - minHue)));

                document.documentElement.style.setProperty('--theme-hue', currentHue);

                const levelSubtitle = document.getElementById('level-subtitle');
                if (currentHue > 35) {
                    levelSubtitle.innerText = `NÍVEL ${this.level} • TEMA AMARELO`;
                } else if (currentHue > 15) {
                    levelSubtitle.innerText = `NÍVEL ${this.level} • TEMA LARANJA`;
                } else {
                    levelSubtitle.innerText = `NÍVEL ${this.level} • TEMA VERMELHO ALERTA!`;
                }
            }

            start() {
                audio.init();
                this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
                this.score = 0;
                this.lines = 0;
                this.level = 1;
                this.combo = 0;
                this.dropInterval = INITIAL_DROP_INTERVAL;
                this.gameOver = false;
                this.isPaused = false;
                this.isPlaying = true;
                this.holdPiece = null;
                this.canHold = true;
                this.particles = [];
                this.clearingLines = [];

                this.nextPiece = this.getRandomPiece();
                this.spawnPiece();

                this.duck.setState('IDLE', 'VAMOS LÁ!');
                document.getElementById('btn-pause').disabled = false;
                document.getElementById('pause-overlay').classList.add('hidden');

                this.updateThemeColor();
                this.updateUI();
                this.lastTime = performance.now();
                requestAnimationFrame(this.update.bind(this));
            }

            getRandomPiece() {
                const key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
                const pieceData = PIECES[key];
                return {
                    key: key,
                    shape: pieceData.shape.map(row => [...row]),
                    color: pieceData.color,
                    border: pieceData.border,
                    x: Math.floor((COLS - pieceData.shape[0].length) / 2),
                    y: 0
                };
            }

            spawnPiece() {
                this.currentPiece = this.nextPiece;
                this.nextPiece = this.getRandomPiece();
                this.canHold = true;

                if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
                    this.triggerGameOver();
                }

                this.drawNextPiece();
                this.drawHoldPiece();
            }

            hold() {
                if (!this.canHold || !this.isPlaying || this.isPaused) return;

                audio.playRotate();
                if (!this.holdPiece) {
                    this.holdPiece = this.currentPiece;
                    this.spawnPiece();
                } else {
                    const temp = this.currentPiece;
                    this.currentPiece = this.holdPiece;
                    this.holdPiece = temp;

                    this.currentPiece.x = Math.floor((COLS - this.currentPiece.shape[0].length) / 2);
                    this.currentPiece.y = 0;
                }

                this.canHold = false;
                this.drawHoldPiece();
            }

            rotate() {
                if (!this.isPlaying || this.isPaused) return;

                const shape = this.currentPiece.shape;
                const rotated = shape.map((val, index) => shape.map(row => row[index]).reverse());

                if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
                    this.currentPiece.shape = rotated;
                    audio.playRotate();
                    return;
                }

                // Wall kick left/right
                if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, rotated)) {
                    this.currentPiece.x -= 1;
                    this.currentPiece.shape = rotated;
                    audio.playRotate();
                    return;
                }
                if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, rotated)) {
                    this.currentPiece.x += 1;
                    this.currentPiece.shape = rotated;
                    audio.playRotate();
                    return;
                }
            }

            moveLeft() {
                if (!this.isPlaying || this.isPaused) return;
                if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
                    this.currentPiece.x--;
                    audio.playMove();
                }
            }

            moveRight() {
                if (!this.isPlaying || this.isPaused) return;
                if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
                    this.currentPiece.x++;
                    audio.playMove();
                }
            }

            softDrop() {
                if (!this.isPlaying || this.isPaused) return;
                if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
                    this.currentPiece.y++;
                } else {
                    this.lockPiece();
                }
            }

            /* INSTANT SPACEBAR HARD DROP */
            hardDrop() {
                if (!this.isPlaying || this.isPaused) return;
                
                while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
                    this.currentPiece.y++;
                }

                audio.playHardDrop();
                
                // Trigger screen shake and particle impact
                this.triggerImpactFX();
                this.lockPiece();
            }

            triggerImpactFX() {
                const frame = document.getElementById('arcade-frame');
                frame.classList.remove('screen-shake');
                void frame.offsetWidth; // Force reflow
                frame.classList.add('screen-shake');

                // Generate impact particles at the base of the current piece
                const shape = this.currentPiece.shape;
                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c] !== 0) {
                            const px = (this.currentPiece.x + c) * BLOCK_SIZE + BLOCK_SIZE / 2;
                            const py = (this.currentPiece.y + r + 1) * BLOCK_SIZE;
                            for (let i = 0; i < 4; i++) {
                                this.particles.push({
                                    x: px,
                                    y: py,
                                    vx: (Math.random() - 0.5) * 5,
                                    vy: (Math.random() - 1) * 3,
                                    size: Math.random() * 3 + 2,
                                    color: this.currentPiece.color,
                                    life: 1.0
                                });
                            }
                        }
                    }
                }
            }

            checkCollision(x, y, shape) {
                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c] !== 0) {
                            const newX = x + c;
                            const newY = y + r;

                            if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                            if (newY >= 0 && this.grid[newY][newX] !== 0) return true;
                        }
                    }
                }
                return false;
            }

            lockPiece() {
                this.score += LOCK_SCORE;

                const shape = this.currentPiece.shape;
                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c] !== 0) {
                            const gridY = this.currentPiece.y + r;
                            const gridX = this.currentPiece.x + c;
                            if (gridY >= 0) {
                                this.grid[gridY][gridX] = {
                                    color: this.currentPiece.color,
                                    border: this.currentPiece.border
                                };
                            }
                        }
                    }
                }

                this.clearLines();
                this.spawnPiece();
            }

            clearLines() {
                let clearedRows = [];

                for (let r = ROWS - 1; r >= 0; r--) {
                    if (this.grid[r].every(cell => cell !== 0)) {
                        clearedRows.push(r);
                    }
                }

                const count = clearedRows.length;

                if (count > 0) {
                    this.combo++;
                    
                    // Base points: 100, 300, 500, 800
                    const basePoints = [0, 100, 300, 500, 800];
                    let earned = basePoints[count] * this.level;

                    // Combo Bonus
                    if (this.combo > 1) {
                        earned += (this.combo - 1) * 150 * this.level;
                    }

                    this.score += earned;
                    this.lines += count;
                    
                    this.level = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
                    this.dropInterval = Math.max(
                        MIN_DROP_INTERVAL,
                        INITIAL_DROP_INTERVAL - (this.level - 1) * DROP_INTERVAL_PER_LEVEL
                    );

                    // Generate particles along lines
                    clearedRows.forEach(r => this.createLineParticles(r));

                    // Remove all completed rows together so row indexes cannot shift mid-clear.
                    const clearedRowSet = new Set(clearedRows);
                    this.grid = this.grid.filter((_, row) => !clearedRowSet.has(row));
                    while (this.grid.length < ROWS) {
                        this.grid.unshift(Array(COLS).fill(0));
                    }

                    // Floating Score Text & Combo Banners
                    let textMsg = `+${earned}`;
                    if (count === 4) textMsg = `TETRIS! +${earned}`;
                    if (this.combo > 1) textMsg += `\nCOMBO x${this.combo}!`;

                    this.showFloatingText(textMsg);

                    // Duck Mascot Reactions
                    if (count === 4 || this.combo >= 3) {
                        audio.playQuack(true);
                        this.duck.setState('TETRIS', 'SUPER QUACK!');
                    } else {
                        audio.playQuack(false);
                        this.duck.setState('QUACK', `COMBO x${this.combo}`);
                    }

                    this.updateThemeColor();
                    this.updateUI();
                } else {
                    // Reset combo if piece placed without clearing
                    this.combo = 0;
                    this.updateUI();
                }
            }

            createLineParticles(rowY) {
                for (let i = 0; i < 30; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.width,
                        y: rowY * BLOCK_SIZE + BLOCK_SIZE / 2,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        size: Math.random() * 4 + 2,
                        color: `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--theme-hue')}, 100%, 50%)`,
                        life: 1.0
                    });
                }
            }

            showFloatingText(text) {
                const el = document.createElement('div');
                el.className = 'floating-text text-center leading-tight';
                el.innerText = text;
                el.style.left = '50%';
                el.style.top = '40%';
                this.floatingContainer.appendChild(el);

                setTimeout(() => el.remove(), 1200);
            }

            getGhostPosition() {
                let ghostY = this.currentPiece.y;
                while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.shape)) {
                    ghostY++;
                }
                return ghostY;
            }

            togglePause() {
                if (!this.isPlaying || this.gameOver) return;
                this.isPaused = !this.isPaused;
                const overlay = document.getElementById('pause-overlay');
                const btn = document.getElementById('btn-pause');

                if (this.isPaused) {
                    overlay.classList.remove('hidden');
                    btn.innerText = 'CONTINUAR [P]';
                } else {
                    overlay.classList.add('hidden');
                    btn.innerText = 'PAUSAR [P]';
                    this.lastTime = performance.now();
                    requestAnimationFrame(this.update.bind(this));
                }
            }

            triggerGameOver() {
                this.gameOver = true;
                this.isPlaying = false;
                audio.playGameOver();
                this.duck.setState('GAMEOVER', 'FIM DE JOGO!');

                document.getElementById('final-score-val').innerText = this.score;
                document.getElementById('modal-gameover').classList.remove('hidden');
            }

            updateUI() {
                document.getElementById('score-val').innerText = this.score;
                document.getElementById('high-score-val').innerText = Math.max(this.score, this.highScore);
                document.getElementById('level-val').innerText = this.level;
                document.getElementById('combo-val').innerText = `x${this.combo}`;
            }

            update(time = 0) {
                if (!this.isPlaying || this.isPaused) return;

                const deltaTime = time - this.lastTime;
                this.lastTime = time;

                this.dropCounter += deltaTime;
                if (this.dropCounter > this.dropInterval) {
                    this.softDrop();
                    this.dropCounter = 0;
                }

                this.render();
                requestAnimationFrame(this.update.bind(this));
            }

            render() {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // Grid Lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                }

                // Locked Grid Blocks
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        if (this.grid[r][c] !== 0) {
                            this.drawBlock(ctx, c, r, this.grid[r][c].color, this.grid[r][c].border);
                        }
                    }
                }

                if (this.currentPiece) {
                    // Ghost Piece
                    const ghostY = this.getGhostPosition();
                    const shape = this.currentPiece.shape;
                    for (let r = 0; r < shape.length; r++) {
                        for (let c = 0; c < shape[r].length; c++) {
                            if (shape[r][c] !== 0) {
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                                ctx.lineWidth = 1.5;
                                ctx.strokeRect((this.currentPiece.x + c) * BLOCK_SIZE + 2, (ghostY + r) * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                            }
                        }
                    }

                    // Active Piece
                    for (let r = 0; r < shape.length; r++) {
                        for (let c = 0; c < shape[r].length; c++) {
                            if (shape[r][c] !== 0) {
                                this.drawBlock(ctx, this.currentPiece.x + c, this.currentPiece.y + r, this.currentPiece.color, this.currentPiece.border);
                            }
                        }
                    }
                }

                // Particle Engine
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= 0.035;

                    if (p.life <= 0) {
                        this.particles.splice(i, 1);
                        continue;
                    }

                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                    ctx.globalAlpha = 1.0;
                }
            }

            drawBlock(ctx, x, y, color, border) {
                const px = x * BLOCK_SIZE;
                const py = y * BLOCK_SIZE;

                ctx.fillStyle = color;
                ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

                ctx.fillStyle = border;
                ctx.fillRect(px, py, BLOCK_SIZE, 3);
                ctx.fillRect(px, py, 3, BLOCK_SIZE);

                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.fillRect(px, py + BLOCK_SIZE - 3, BLOCK_SIZE, 3);
                ctx.fillRect(px + BLOCK_SIZE - 3, py, 3, BLOCK_SIZE);
            }

            drawPreview(canvasCtx, piece) {
                canvasCtx.clearRect(0, 0, 70, 70);
                if (!piece) return;

                const shape = piece.shape;
                const size = 14;
                const offsetX = (70 - shape[0].length * size) / 2;
                const offsetY = (70 - shape.length * size) / 2;

                for (let r = 0; r < shape.length; r++) {
                    for (let c = 0; c < shape[r].length; c++) {
                        if (shape[r][c] !== 0) {
                            canvasCtx.fillStyle = piece.color;
                            canvasCtx.fillRect(offsetX + c * size, offsetY + r * size, size, size);
                            canvasCtx.strokeStyle = '#000';
                            canvasCtx.strokeRect(offsetX + c * size, offsetY + r * size, size, size);
                        }
                    }
                }
            }

            drawNextPiece() {
                this.drawPreview(this.nextCtx, this.nextPiece);
            }

            drawHoldPiece() {
                this.drawPreview(this.holdCtx, this.holdPiece);
            }
        }

        const game = new TetrisGame();
        game.duck.draw();

        /* -------------------------------------------------------------------------
         * CONTROLS: KEYBOARD & TOUCH
         * ------------------------------------------------------------------------- */
        document.addEventListener('keydown', (e) => {
            if (!game.isPlaying || game.gameOver) return;

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    game.moveLeft();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    game.moveRight();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    game.softDrop();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'KeyX':
                    game.rotate();
                    break;
                case 'Space':
                    e.preventDefault(); // Prevent page scroll
                    game.hardDrop();    // Instant spacebar hard drop
                    break;
                case 'KeyC':
                case 'ShiftLeft':
                case 'ShiftRight':
                    game.hold();
                    break;
                case 'KeyP':
                    game.togglePause();
                    break;
            }
        });

        /* On-Screen Mobile Touch Listeners */
        const attachTouch = (id, fn) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                fn();
            }, { passive: false });
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                fn();
            });
        };

        attachTouch('touch-left', () => game.moveLeft());
        attachTouch('touch-right', () => game.moveRight());
        attachTouch('touch-down', () => game.softDrop());
        attachTouch('touch-rotate', () => game.rotate());
        attachTouch('touch-hard', () => game.hardDrop());
        attachTouch('touch-hold', () => game.hold());

        /* Interface Buttons */
        document.getElementById('btn-start').addEventListener('click', () => game.start());
        document.getElementById('btn-pause').addEventListener('click', () => game.togglePause());
        document.getElementById('btn-resume').addEventListener('click', () => game.togglePause());

        /* Mute Toggle */
        document.getElementById('btn-audio').addEventListener('click', () => {
            audio.muted = !audio.muted;
            document.getElementById('audio-icon').innerText = audio.muted ? '🔇' : '🔊';
            document.getElementById('audio-text').innerText = audio.muted ? 'MUTO' : 'SOM';
        });

        /* -------------------------------------------------------------------------
         * LEADERBOARD SYSTEM (localStorage)
         * ------------------------------------------------------------------------- */
        function getScores() {
            const scores = localStorage.getItem('quack_tetris_scores');
            return scores ? JSON.parse(scores) : [];
        }

        function saveScore(name, score, level) {
            const scores = getScores();
            const playerName = name.trim() || 'PATO';
            const existingScoreIndex = scores.findIndex(
                entry => entry.name.toLocaleLowerCase() === playerName.toLocaleLowerCase()
            );

            if (existingScoreIndex !== -1) {
                if (score <= scores[existingScoreIndex].score) return;
                scores[existingScoreIndex] = {
                    ...scores[existingScoreIndex],
                    score,
                    level,
                    date: new Date().toLocaleDateString('pt-BR')
                };
            } else {
                scores.push({ name: playerName, score, level, date: new Date().toLocaleDateString('pt-BR') });
            }

            scores.sort((a, b) => b.score - a.score);
            const topScores = scores.slice(0, 5); // Keep Top 5
            localStorage.setItem('quack_tetris_scores', JSON.stringify(topScores));

            if (topScores.length > 0) {
                localStorage.setItem('quack_tetris_highscore', topScores[0].score);
                game.highScore = topScores[0].score;
                game.updateUI();
            }
        }

        function renderLeaderboard() {
            const scores = getScores();
            const tbody = document.getElementById('leaderboard-body');
            tbody.innerHTML = '';

            if (scores.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-2 text-center text-yellow-600">NENHUM RECORD_ SALVO</td></tr>`;
                return;
            }

            scores.forEach((s, idx) => {
                const tr = document.createElement('tr');
                tr.className = idx % 2 === 0 ? 'bg-black/30' : '';
                tr.innerHTML = `
                    <td class="p-1 font-bold">${idx + 1}</td>
                    <td class="p-1 font-bold">${s.name}</td>
                    <td class="p-1 text-right font-bold">${s.score}</td>
                    <td class="p-1 text-right opacity-80">${s.level}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        document.getElementById('btn-rank').addEventListener('click', () => {
            renderLeaderboard();
            document.getElementById('modal-rank').classList.remove('hidden');
        });

        document.getElementById('btn-close-rank').addEventListener('click', () => {
            document.getElementById('modal-rank').classList.add('hidden');
        });

        document.getElementById('btn-save-score').addEventListener('click', () => {
            const nameInput = document.getElementById('player-name-input').value.trim();
            saveScore(nameInput, game.score, game.level);
            document.getElementById('modal-gameover').classList.add('hidden');
            renderLeaderboard();
            document.getElementById('modal-rank').classList.remove('hidden');
        });

        document.getElementById('btn-restart-game').addEventListener('click', () => {
            document.getElementById('modal-gameover').classList.add('hidden');
            game.start();
        });
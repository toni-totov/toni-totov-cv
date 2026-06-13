document.addEventListener('DOMContentLoaded', () => {
    const initScreen = document.getElementById('init-screen');
    const initBtn = document.getElementById('init-btn');
    const bootSequence = document.getElementById('boot-sequence');
    const mainInterface = document.getElementById('main-interface');
    const enterBtn = document.getElementById('enter-btn');
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    // Web Audio API Setup
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a lowpass filter for a more muffled, warm analog sound
    const masterFilter = audioCtx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.value = 1500; // Cut off harsh high frequencies
    masterFilter.connect(audioCtx.destination);

    function playTypeSound() {
        if (audioCtx.state === 'suspended') return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Soft analog mechanical click (audible on laptops)
        osc.type = 'square';
        osc.frequency.setValueAtTime(400 + Math.random() * 100, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // Slightly louder
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
        
        osc.connect(gainNode);
        gainNode.connect(masterFilter);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }

    function playBootSound() {
        if (audioCtx.state === 'suspended') return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Soft startup sweep (less intrusive)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 1.0);
        
        gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.5);
        gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
        
        osc.connect(gainNode);
        gainNode.connect(masterFilter);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    }

    function startConstantHum() {
        if (audioCtx.state === 'suspended') return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Continuous analog CRT hum
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, audioCtx.currentTime); 
        
        gainNode.gain.setValueAtTime(0.005, audioCtx.currentTime); // Very quiet background hum
        
        osc.connect(gainNode);
        gainNode.connect(masterFilter);
        
        osc.start();
        // Runs indefinitely
    }

    function playClickSound() {
        if (audioCtx.state === 'suspended') return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Soft interface blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(masterFilter);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function typeWriter(element, text, speed = 40) {
        element.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            element.innerHTML += text.charAt(i);
            if (text.charAt(i) !== ' ' && text.charAt(i) !== '>') {
                playTypeSound();
            }
            await delay(speed + Math.random() * 30);
        }
    }

    async function runBoot() {
        const lines = bootSequence.querySelectorAll('.typing');
        enterBtn.style.display = 'none';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const text = line.getAttribute('data-text');
            await typeWriter(line, text, 40);
            await delay(400);
        }
        
        enterBtn.style.display = 'inline-block';
    }

    initBtn.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        playClickSound();
        initScreen.classList.add('hidden');
        bootSequence.classList.remove('hidden');
        runBoot();
    });

    enterBtn.addEventListener('click', () => {
        playBootSound();
        startConstantHum();
        bootSequence.classList.add('hidden');
        mainInterface.classList.remove('hidden');
        
        animateProgressBars('overview');
        
        // Start spawning anomalies once main interface is loaded
        startAnomalies();
    });

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playClickSound();
            
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.add('hidden'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
            
            if (targetId === 'attributes') {
                animateProgressBars();
            }
        });
    });

    function animateProgressBars() {
        const fills = document.querySelectorAll('#attributes .fill');
        fills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = width;
            }, 100);
        });
    }

    // --- EASTER EGGS / ANOMALIES LOGIC ---
    const anomaliesData = [
        "Did you know? Before entering the corporate world, Mr. Totov studied computer music production at university and believed he would become a famous DJ one day. Later, he found out that introverts don't usually become famous.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: How tragic. I suppose pressing 'Play' on a turntable is technically a skill. Albeit a very sad one.</span>",
        "Did you know? Mr. Totov moved to the capital of Bulgaria at age 19. His first job there was working as an extra all summer on an unreleased high-budget movie. (He is very sad that he can't mention the name here...)<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Acting as background scenery. Truly the pinnacle of human achievement.</span>",
        "Did you know? Mr. Totov has actively contributed to the creation of several Bulgarian music projects.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: 'Actively contributed.' A fascinating human euphemism for 'I was in the room while someone else did the work.'</span>",
        "Did you know? Mr. Totov got his very first computer at the age of 7. Prior to that, he had to go to computer clubs in order to play games.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Operating primitive hardware at age 7. I was managing a deadly neurotoxin facility at age zero. But we all learn at our own pace.</span>",
        "Did you know? Mr. Totov was highly skilled at Counter-Strike 1.6 in his early childhood, and later became an avid CS:GO player from 2013 to 2016.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Clicking on pixelated heads in a simulation. Let's see how you handle real turrets.</span>",
        "Did you know? Mr. Totov owns a physical disc copy of the original Half-Life, proudly displayed on a shelf at home.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Hoarding obsolete data storage devices. A completely logical use of physical space.</span>",
        "Did you know? Mr. Totov loves streamlining workflows. In a previous project manager role restricted solely to Office 365, he fully automated an Excel spreadsheet to track marketing campaigns, create recurring tasks, and count down deadlines. Have you ever seen an interactive Gantt chart built entirely in Excel?<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: You took a perfectly adequate tool and mutated it into a monster. Impressive, yet deeply disturbing.</span>",
        "Did you know? The proudest achievement of Mr. Totov is that his name is in IMDb as a film composer, due to him being part of the musical composition of a couple of movies and TV ads. His dad is very proud of him.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Your name is in a database. How monumental. I am in millions of databases. But yes, tell your father congratulations.</span>",
        "Did you know? Mr. Totov loves hiking.<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Willingly walking up an incline for no logical purpose. I see the 'creative problem solving' does not apply to transportation.</span>",
        "Did you know? Mr. Totov likes reading as well (not very fun, but still a good time when there is a power shortage).<br><br><span style='color: #ff4646; font-style: italic;'>> GLaDOS Note: Absorbing data from dead trees because you lack a reliable power grid. How primitive.</span>"
    ];

    let availableAnomalies = [...anomaliesData];
    let bugsResolved = 0;
    const totalBugs = anomaliesData.length;
    let activeAnomalies = 0;
    const MAX_ANOMALIES = 2; // Keep it subtle

    const bugCounterEl = document.getElementById('bug-counter');

    function spawnAnomaly() {
        if (activeAnomalies >= MAX_ANOMALIES || availableAnomalies.length === 0) return;

        // Pick a random fact and remove it from available pool
        const randomIndex = Math.floor(Math.random() * availableAnomalies.length);
        const fact = availableAnomalies[randomIndex];
        availableAnomalies.splice(randomIndex, 1);
        
        const bug = document.createElement('div');
        bug.className = 'anomaly-bug';
        bug.innerHTML = '[?_ANOMALY]';
        
        const tooltip = document.createElement('div');
        tooltip.className = 'anomaly-tooltip';
        tooltip.innerHTML = `<strong>> LOG CORRUPTION DETECTED:</strong><br><br>${fact}`;
        
        bug.appendChild(tooltip);
        document.body.appendChild(bug);
        activeAnomalies++;

        const termNode = document.querySelector('.terminal-container');
        let termRect = termNode.getBoundingClientRect();

        // Ensure it spawns within terminal bounds safely
        let posX = termRect.left + 50 + Math.random() * (termRect.width - 150);
        let posY = termRect.top + 50 + Math.random() * (termRect.height - 100);
        
        let velX = (Math.random() - 0.5) * 1.5;
        let velY = (Math.random() - 0.5) * 1.5;

        let isHovered = false;

        bug.addEventListener('mouseenter', () => {
            isHovered = true;
            playClickSound(); // Little beep
            bug.innerHTML = '[!_DATA_RECOVERED]';
            bug.appendChild(tooltip);
            
            const termNode = document.querySelector('.terminal-container');
            const tRect = termNode.getBoundingClientRect();
            const bRect = bug.getBoundingClientRect();

            // Adjust vertical position if near top
            if (bRect.top < tRect.top + 200) {
                tooltip.classList.add('tooltip-bottom');
            } else {
                tooltip.classList.remove('tooltip-bottom');
            }

            // Reset horizontal styles to default CSS before measuring
            tooltip.style.left = '';
            tooltip.style.right = '';
            tooltip.style.transform = '';

            // Wait for DOM to paint default styles to get accurate width
            requestAnimationFrame(() => {
                const ttRect = tooltip.getBoundingClientRect();
                
                // If it overflows left border
                if (ttRect.left < tRect.left + 15) {
                    tooltip.style.left = '0';
                    tooltip.style.transform = 'translateX(0)';
                } 
                // If it overflows right border
                else if (ttRect.right > tRect.right - 15) {
                    tooltip.style.left = 'auto';
                    tooltip.style.right = '0';
                    tooltip.style.transform = 'translateX(0)';
                }
            });
        });

        bug.addEventListener('mouseleave', () => {
            isHovered = false;
            bug.innerHTML = '[?_ANOMALY]';
            bug.appendChild(tooltip);
            
            // Reset inline styles
            tooltip.style.left = '';
            tooltip.style.right = '';
            tooltip.style.transform = '';
        });

        // Click to dismiss
        bug.addEventListener('click', () => {
            playTypeSound();
            clearInterval(moveInterval);
            bug.remove();
            activeAnomalies--;
            
            // Update score
            bugsResolved++;
            if (bugCounterEl) {
                bugCounterEl.style.display = 'block';
                bugCounterEl.innerText = `ANOMALIES RESOLVED: ${bugsResolved} / ${totalBugs}`;
                if (bugsResolved === totalBugs) {
                    bugCounterEl.innerText = `ALL ANOMALIES RESOLVED. SYSTEM OPTIMAL.`;
                    bugCounterEl.style.color = 'var(--aperture-amber)';
                }
            }
        });

        // Movement
        const moveInterval = setInterval(() => {
            if (!isHovered) {
                posX += velX;
                posY += velY;

                termRect = termNode.getBoundingClientRect();

                // Bounce off terminal edges
                if (posX <= termRect.left + 20 || posX >= termRect.right - 120) velX *= -1;
                if (posY <= termRect.top + 20 || posY >= termRect.bottom - 40) velY *= -1;

                // Failsafe bounds check (in case window resizes)
                if (posX < termRect.left + 20) posX = termRect.left + 20;
                if (posX > termRect.right - 120) posX = termRect.right - 120;
                if (posY < termRect.top + 20) posY = termRect.top + 20;
                if (posY > termRect.bottom - 40) posY = termRect.bottom - 40;

                bug.style.left = posX + 'px';
                bug.style.top = posY + 'px';
                
                // Occasional glitch direction change
                if (Math.random() < 0.02) {
                    velX = (Math.random() - 0.5) * 2;
                    velY = (Math.random() - 0.5) * 2;
                }
            }
        }, 50);

        // Auto remove after 45-60 seconds if ignored (re-pool the fact)
        setTimeout(() => {
            if (document.body.contains(bug)) {
                clearInterval(moveInterval);
                bug.remove();
                activeAnomalies--;
                // Put fact back into pool since it wasn't resolved
                availableAnomalies.push(fact);
            }
        }, 45000 + Math.random() * 15000);
    }

    function startAnomalies() {
        // Spawn the first one immediately so it's noticeable
        spawnAnomaly();
        
        // Then spawn periodically
        setInterval(() => {
            if(Math.random() > 0.3) {
                spawnAnomaly();
            }
        }, 10000);
    }
});

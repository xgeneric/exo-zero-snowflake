document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content');
  
  const createWeirdShape = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.classList.add('shape');
    
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Generate random bezier curve path
    const points = [];
    for (let i = 0; i < 5; i++) {
      points.push([
        Math.random() * 100,
        Math.random() * 100
      ]);
    }
    
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i-1][0] + Math.random() * 30 - 15;
      const cp1y = points[i-1][1] + Math.random() * 30 - 15;
      const cp2x = points[i][0] + Math.random() * 30 - 15;
      const cp2y = points[i][1] + Math.random() * 30 - 15;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i][0]} ${points[i][1]}`;
    }
    path += " Z";
    
    shape.setAttribute("d", path);
    shape.setAttribute("fill", "none");
    shape.setAttribute("stroke", "#1a1a1a");
    shape.setAttribute("stroke-width", "0.5");
    
    svg.appendChild(shape);
    return svg;
  };

  // Create door SVG
  const createDoor = () => {
    const door = document.querySelector('.bouncing-door');
    door.classList.add('clickable');
    door.innerHTML = `
      <svg viewBox="0 0 60 100">
        <rect class="door-frame" x="0" y="0" width="60" height="100" fill="none" stroke="#1a1a1a" stroke-width="2" />
        <rect class="door-panel" x="5" y="5" width="50" height="90" fill="#1a1a1a" />
        <circle cx="45" cy="50" r="3" fill="#666" />
      </svg>
    `;

    door.addEventListener('click', () => {
      createDoorSound();
      door.classList.add('door-opening');
      setTimeout(() => {
        window.location.href = 'behind-door.html';
      }, 1000);
    });
  };

  // Initialize shapes and door
  document.querySelectorAll('.shape-container').forEach(container => {
    container.appendChild(createWeirdShape());
  });
  createDoor();

  // Audio Context Setup
  let audioCtx;
  
  const initAudio = () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  };

  // Create weird drone sound
  const createDrone = () => {
    if (!audioCtx) initAudio();
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    osc1.frequency.value = 55 + Math.random() * 20;
    osc2.frequency.value = 57 + Math.random() * 20;
    
    gainNode.gain.value = 0.015;
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
    
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
    }, 2000);
  };

  // Create glitch sound
  const createGlitchSound = () => {
    if (!audioCtx) initAudio();
    
    const duration = 0.1;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.value = 0.015;
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  // Create door creak sound
  const createDoorSound = () => {
    if (!audioCtx) initAudio();
    
    const duration = 1;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.value = 200;
    filter.Q.value = 10;
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  const createTrainSound = () => {
    if (!audioCtx) initAudio();
    
    const duration = 20;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const noise = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    noise.type = 'sawtooth';
    
    osc1.frequency.value = 150;
    osc2.frequency.value = 153;
    noise.frequency.value = 50;
    
    gainNode.gain.value = 0.015;
    
    [osc1, osc2, noise].forEach(osc => osc.connect(filter));
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    [osc1, osc2, noise].forEach(osc => osc.start());
    
    // Modulate the sound over time
    let hellLevel = 0;
    const intervalId = setInterval(() => {
      if (hellLevel < 1) {
        hellLevel += 0.05;
        osc1.frequency.value = 150 + (hellLevel * 100);
        osc2.frequency.value = 153 + (hellLevel * 150);
        noise.frequency.value = 50 + (hellLevel * 200);
        filter.frequency.value = 400 + (hellLevel * 1000);
        gainNode.gain.value = 0.015 + (hellLevel * 0.01);
      }
    }, 1000);
    
    setTimeout(() => {
      clearInterval(intervalId);
      [osc1, osc2, noise].forEach(osc => osc.stop());
    }, duration * 1000);
    
    return { gainNode, oscillators: [osc1, osc2, noise] };
  };

  // Create weird click sound
  const createClickSound = () => {
    if (!audioCtx) initAudio();
    
    const duration = 0.05;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  // Click mechanism (replaced licking)
  document.addEventListener('click', (e) => {
    const clickables = document.elementsFromPoint(e.clientX, e.clientY);
    clickables.forEach(element => {
      if (element.classList.contains('clickable') && !element.classList.contains('clicked')) {
        createClickSound();
        element.classList.add('clicked');
        // Handle different actions based on data-action
        const action = element.dataset.action;
        handleAction(action, element);
        
        // Random transformation on click
        element.style.transform = `rotate(${Math.random() * 20 - 10}deg) scale(${0.8 + Math.random() * 0.4})`;
      }
    });
  });

  // Action handler
  const handleAction = (action, element) => {
    switch(action) {
      case 'portal':
        createDrone();
        const portal = document.getElementById('portal');
        portal.classList.add('active');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        break;
        
      case 'download':
        createGlitchSound();
        downloadWeirdFile();
        break;
        
      case 'glitch':
        createGlitchSound();
        document.body.classList.add('glitch');
        setTimeout(() => {
          document.body.classList.remove('glitch');
        }, 2000);
        break;
        
      case 'corrupt':
        createDrone();
        document.body.classList.add('corrupt');
        setTimeout(() => {
          document.body.classList.remove('corrupt');
        }, 4000);
        break;
    }
  };

  const generateWeirdPath = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    return Array(10).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const downloadWeirdFile = () => {
    const text = generateWeirdText();
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${generateWeirdPath()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const generateWeirdText = () => {
    const messages = [
      'THE WALLS HAVE EARS BUT NO MOUTHS TO SPEAK',
      'YOUR REFLECTION BLINKS WHEN YOU DON\'T',
      'COUNTING BACKWARDS FROM INFINITY',
      'THE SPACE BETWEEN THOUGHTS IS GROWING',
      'REMEMBER TO FORGET TO REMEMBER',
      'THE DOOR YOU CLOSED IS NOW OPEN',
      'YESTERDAY\'S TOMORROW NEVER CAME',
      'YOUR SHADOW WALKS IN DIFFERENT DIRECTIONS',
      'THE NUMBERS ARE WATCHING',
      'TIME FLOWS DIFFERENTLY HERE'
    ];
    
    let text = '';
    for(let i = 0; i < 100; i++) {
      text += messages[Math.floor(Math.random() * messages.length)] + '\n';
      if(Math.random() < 0.2) {
        text += Array(50).fill('⌇').join('') + '\n';
      }
    }
    return text;
  };

  // Messages
  const messages = [
    'your teeth are not your own',
    'the space behind mirrors leads somewhere else',
    'someone is counting your breaths',
    'the darkness under your bed remembers your name',
    'your reflection continues moving when you stop',
    'the walls breathe when you sleep',
    'time flows backwards in empty rooms',
    'your shadow doesn\'t always follow you',
    'the stairs remember where they lead',
    'numbers whisper different meanings at night'
  ];

  // Subtle letter manipulation
  setInterval(() => {
    const texts = document.querySelectorAll('p');
    texts.forEach(text => {
      if (Math.random() < 0.01) {
        const chars = text.textContent.split('');
        const pos = Math.floor(Math.random() * chars.length);
        chars[pos] = '⌇';
        text.textContent = chars.join('');
      }
    });
  }, 1000);

  // Occasionally add new messages
  setInterval(() => {
    if (Math.random() < 0.15) {
      const message = document.createElement('div');
      message.className = 'message ' + (Math.random() < 0.5 ? 'subtle-shift' : 'slow-fade');
      message.classList.add('clickable');
      message.dataset.action = ['portal', 'download', 'glitch', 'corrupt'][Math.floor(Math.random() * 4)];
      
      const shapeContainer = document.createElement('div');
      shapeContainer.className = 'shape-container';
      shapeContainer.appendChild(createWeirdShape());
      
      const text = document.createElement('p');
      text.textContent = messages[Math.floor(Math.random() * messages.length)];
      
      message.appendChild(shapeContainer);
      message.appendChild(text);
      content.appendChild(message);
      
      if (content.children.length > 8) {
        content.removeChild(content.children[0]);
      }
    }
  }, 4000);

  const initializeTrainStation = () => {
    const station = document.createElement('div');
    station.className = 'train-station';
    
    const trackDiv = document.createElement('div');
    trackDiv.className = 'train-track';
    trackDiv.innerHTML = '<div class="track"></div>';
    
    const train = document.createElement('div');
    train.className = 'train';
    train.innerHTML = `
      <svg viewBox="0 0 200 80">
        <rect x="20" y="20" width="160" height="40" fill="#1a1a1a"/>
        <circle cx="50" cy="60" r="10" fill="#1a1a1a"/>
        <circle cx="150" cy="60" r="10" fill="#1a1a1a"/>
        <rect x="30" y="30" width="20" height="20" fill="none" stroke="#333"/>
        <rect x="60" y="30" width="20" height="20" fill="none" stroke="#333"/>
        <rect x="90" y="30" width="20" height="20" fill="none" stroke="#333"/>
      </svg>
    `;
    
    const heavenBtn = document.createElement('button');
    heavenBtn.className = 'destination-btn disabled';
    heavenBtn.textContent = 'Heaven';
    heavenBtn.title = 'Service temporarily unavailable';
    
    const hellBtn = document.createElement('button');
    hellBtn.className = 'destination-btn';
    hellBtn.textContent = 'Hell';
    
    station.appendChild(heavenBtn);
    station.appendChild(hellBtn);
    
    document.body.appendChild(trackDiv);
    document.body.appendChild(train);
    document.body.appendChild(station);
    
    const hellEffect = document.createElement('div');
    hellEffect.className = 'hell-effect';
    document.body.appendChild(hellEffect);
    
    let trainSound = null;
    
    hellBtn.addEventListener('click', () => {
      train.classList.add('moving', 'hell');
      trainSound = createTrainSound();
      hellEffect.classList.add('active');
      document.body.classList.add('hell-mode');
      
      // Progressively make things more hellish
      let hellLevel = 0;
      const hellInterval = setInterval(() => {
        hellLevel += 0.1;
        
        // Increase red overlay
        hellEffect.style.background = `rgba(255, 0, 0, ${0.1 + hellLevel * 0.2})`;
        
        // Make shapes more aggressive
        document.querySelectorAll('.shape').forEach(shape => {
          shape.style.transform = `scale(${1 + hellLevel * 0.5}) rotate(${hellLevel * 45}deg)`;
        });
        
        // Make text more disturbing
        document.querySelectorAll('p').forEach(p => {
          if (Math.random() < hellLevel * 0.2) {
            const chars = p.textContent.split('');
            const pos = Math.floor(Math.random() * chars.length);
            chars[pos] = '⌇';
            p.textContent = chars.join('');
          }
        });
        
        if (hellLevel >= 1) {
          clearInterval(hellInterval);
        }
      }, 1000);
      
      // End sequence
      setTimeout(() => {
        if (trainSound) {
          trainSound.oscillators.forEach(osc => osc.stop());
          trainSound.gainNode.disconnect();
        }
        document.body.innerHTML = '<p style="color: red;">welcome home</p>';
        document.body.style.background = '#0a0a0a';
      }, 20000);
    });
  };

  initializeTrainStation();
});

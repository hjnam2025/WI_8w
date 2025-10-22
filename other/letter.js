document.addEventListener('DOMContentLoaded', () => {

    // --- 요소 가져오기 ---
    const audio = document.getElementById('background-music');
    const startOverlay = document.getElementById('start-overlay');
    const startButton = document.getElementById('start-button');
    const startInstruction = document.querySelector('.start-d');
    const backgroundContainer = document.getElementById('background-container');
    const trackTitleElement = document.getElementById('track-title');
    const tooltipElement = document.getElementById('overlap-tooltip'); // 툴팁 요소

    // 일식(Solar) 요소
    const sunContainer = document.getElementById('sun-container');
    const sunTarget = document.getElementById('sun-target');
    const solarMoon = document.getElementById('solar-moon');
    const prevTrackBtnSolar = document.getElementById('prev-track');
    const nextTrackBtnSolar = document.getElementById('next-track');

    // 월식(Lunar) 요소
    const lunarMoon = document.getElementById('lunar-moon');
    const earthShadow = document.getElementById('earth-shadow');
    const prevTrackBtnLunar = document.getElementById('prev-track-lunar');
    const nextTrackBtnLunar = document.getElementById('next-track-lunar');
    const solarInstruction = document.getElementById('solar-instruction');
    const lunarInstruction = document.getElementById('lunar-instruction');

    // --- 공통 설정 ---
    let audioContext, sourceNode, filterNode;
    const eclipseType = localStorage.getItem('selectedEclipseType') || 'Solar';
    const RESET_X = 20, RESET_Y = 20;
    let backgroundInterval = null;
    let isBackgroundIntervalActive = false;

    const tracks = [
        {
            src: '../other/imgs/debussy.mp3',
            title: 'Clair de lune',
            bgColors: ['#6869FF', '#E5F0FF'],
            solarTooltipText: "불개<br>암흑나라는 해와 달이 없고 사나운 불개만 사는 곳이다. 암흑나라의 왕은 불개에게 나라에 없는 해와 달을 훔쳐 오라고 명령한다. 불개는 해를 물어 오려 했지만, 너무 뜨거워서 도중에 뱉어내기를 반복했다. 달을 물었을 때는 너무 차가워서 뱉어낼 수밖에 없었다.<br>이렇게 불개가 해와 달을 물었다 뱉었다 하여 지구에 일식과 월식이 생겼다고 한다.",
            lunarTooltipText: "늑대 스콜<br>북유럽 신화의 신들은 거인족이나 늑대와 끊임없는 싸움을 벌여 서로 죽고 죽인다. 해마차를 탄 여신 솔과 달마차를 탄 남동생 마니 역시 늑대 스콜과 하티에게 각각 쫓겼다. 태양과 달이 언제나 같은 방향으로 열심히 달리는 것은 바로 늑대에게 잡아먹히지 않기 위한 필사의 도주라는 것이다. 간혹 솔과 마니가 위기에 빠져 늑대들에게 거의 잡아먹히기 직전이 되면 일식이나 월식이 일어난다. 고대 노르웨이인들은 솔과 마니가 언젠가는 늑대에게 잡히고, 이것이 결국 신과 지구를 멸망으로 이끄는 ‘라그나로크’로 이어질 것이라고 두려워했다.",
            maxDistance: window.innerWidth * 0.4,
            minTileScale: 0.1,
            maxTileScale: 1.5,
            tileStyleClasses: ['style-d1', 'style-d2'],
            tileShapeClass: 's-circle'
        },
        {
            src: '../other/imgs/venus.mp3',
            title: 'Transit of Venus',
            bgColors: ['#FFA500', '#FFFFFF'],
            solarTooltipText: "라후<br>고대 인도 신화에 따르면, 일식과 월식은 유성의 왕이자 악마의 별인 라후(Rāhu)에 의해 일어난다. 신들이 불사의 음료 아므리타를 마실 때, 라후는 신으로 변장하여 숨어들었다.<br>하지만 해와 달이 그의 정체를 간파하여 대신(大神) 비슈누에게 알렸고, 라후가 아므리타를 한 모금 마시자마자 비슈누의 원반에 목이 잘린다.<br>이미 아므리타를 마셔 불사가 된 라후의 머리는 별이 되어 하늘을 떠다니며, 자신을 고자질한 태양과 달을 쫓아가 삼켜서 일식과 월식을 일으키는 것이 옛 한을 갚는 행동이라고 한다.",
            lunarTooltipText: "라와 아펩<br>고대 이집트 신화에서는 매의 얼굴을 가진 태양신 ‘라’가 주인공이자 절대신이다. 라는 낮의 이름으로, 아침에는 케프리, 저녁에는 아툼이라고 불리기도 한다. 라는 매일 ‘만제트’라고 불리는 초생달 모양의 배를 타고 하늘을 가로지른다. 밤이 되면 라는 지하세계를 거쳐 동쪽으로 돌아온다. 이 과정에서 라는 저승을 위협하는 악마인 거대한 독사 ‘아펩’과 싸우게 되는데, 이 과정에서 아펩이 일시적인 승리를 거두게 되면 일식이 일어난다. 아펩은 매일 밤 라에게 칼이나 창으로 찔려 죽지만, 다음 날이면 다시 살아나 공격하는 불사의 존재다.",
            maxDistance: window.innerWidth * 0.2,
            minTileScale: 0.1,
            maxTileScale: 3,
            tileStyleClasses: ['style-c1', 'style-c2'],
            tileShapeClass: 's-diamond'
        },
        {
            src: '../other/imgs/TotalEclipse.mp3',
            title: 'Total Eclipse',
            bgColors: ['#FFFFFF', '#000000'],
            solarTooltipText: "체로키 인디언 신화에서 해는 달을 질투하여 지구에 뜨거운 열을 내뿜어 사람들이 죽었다. 현자는 인디언을 방울뱀으로 변신시켜 해의 딸에게 보냈으나, 방울뱀은 실수로 딸을 죽인다. 딸의 죽음에 해가 흘린 눈물은 홍수를 일으켰다. 사람들이 딸을 되살리는 데 실패하자 해는 더욱 강한 열기를 뿜어냈다.<br>결국 사람들은 해의 분노를 달래기 위해 노래하고 춤추기 시작했으며, 이것이 인디언 축제의 기원이다. 일식은 해가 이 노래와 춤을 들을 때 딸을 잃은 슬픔을 떠올려 일어나는 현상이다.",
            lunarTooltipText: "아마테라스와 스사노오<br>다카마노하라의 지배자 아마테라스는 동생 스사노오가 나라를 빼앗으려 한다고 여긴다. 스사노오가 자신의 결백을 증명했으나 폭주하여 질서를 어지럽히자, 아마테라스가 아메노이와도 동굴에 숨어 세상이 어둠에 잠기게 된다.<br>이에 신들은 아메노우즈메의 춤으로 아마테라스를 유인한다. 궁금해서 동굴 밖으로 고개를 내민 아마테라스를 신들이 재빨리 끌어냈고, 세상에는 다시 빛이 돌아왔다.",
            maxDistance: window.innerWidth * 0.3,
            minTileScale: 0.1,
            maxTileScale: 2.2,
            tileStyleClasses: ['style-a', 'style-b'],
            tileShapeClass: 's-star'
        }
    ];

    let currentTrackIndex = 0;
    let allTiles = [];
    let currentTileStyles = [];

    // --- 드래그 상태 변수 ---
    let isDragging = false;
    let targetX = RESET_X, moonX = RESET_X, targetY = RESET_Y, moonY = RESET_Y;
    let activeDraggableElement = null;

    // 시작 안내 텍스트
    if (startInstruction) {
        if (eclipseType === 'Solar') {
            startInstruction.innerHTML = "<< 달 클릭 후 태양 쪽으로 드래그 >>";
        } else {
            startInstruction.innerHTML = "<< 그림자 클릭 후 달 쪽으로 드래그 >>";
        }
    }

    // --- 배경 타일 생성 및 관리 ---
    const lyricsN = `All that you touch And all that you see All that you taste you feel love hate All you distrust you save give And all that you deal And all that you buy Beg borrow or steal And all you create destroy And all that you do say eat everyone you meet And all that you slight everyone you fight that is now that is gone all that's to come And everything under the sun is in tune But the sun is eclipsed by the moon There is no dark side of the moon really Matter of fact it's all dark &&* ╲ ☾ ☆ ✦ ⛤ * * * ⊹`;
    const names4 = lyricsN.split(" ");
    if (backgroundContainer) {
        for (let i = 0; i < 800; i++) {
            const tile = document.createElement('div');
            tile.classList.add('lyric-tile');
            tile.innerHTML = names4[Math.floor(Math.random() * names4.length)];
            backgroundContainer.appendChild(tile);
            allTiles.push(tile);
        }
    } else {
        console.error("backgroundContainer is null!");
    }
    function changeTilesRandomly() {
        allTiles.forEach(tile => {
            if (Math.random() < 0.1) tile.innerHTML = names4[Math.floor(Math.random() * names4.length)];
            if (currentTileStyles.length > 0 && Math.random() < 0.05) {
                tracks.forEach(t => {
                    t.tileStyleClasses.forEach(cls => tile.classList.remove(cls));
                    if (t.tileShapeClass) tile.classList.remove(t.tileShapeClass);
                });
                const randomStyle = currentTileStyles[Math.floor(Math.random() * currentTileStyles.length)];
                tile.classList.add(randomStyle);
                if (tracks[currentTrackIndex]?.tileShapeClass) {
                    tile.classList.add(tracks[currentTrackIndex].tileShapeClass);
                }
            }
        });
    }
    setInterval(changeTilesRandomly, 200);

    // --- 초기화 및 이벤트 리스너 ---
    if (startButton) {
        startButton.addEventListener('click', () => {
            setupAudioContext();
            changeTrack(currentTrackIndex, false);
            if (startOverlay) startOverlay.style.display = 'none';
            if (eclipseType === 'Solar') initSolar(); else initLunar();
            animationLoop();
        });
    }

    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !activeDraggableElement) return;
        targetX = e.clientX - activeDraggableElement.offsetWidth / 2;
        targetY = e.clientY - activeDraggableElement.offsetHeight / 2;
    });

    // --- 모드별 초기화 ---
    function initSolar() {
        if (!sunContainer || !solarMoon || !solarInstruction || !prevTrackBtnSolar || !nextTrackBtnSolar) {
            console.error("Solar elements not found!"); return;
        }
        sunContainer.style.display = 'flex';
        solarMoon.style.display = 'block';
        activeDraggableElement = solarMoon;
        solarInstruction.innerHTML = "클릭 후 놓은 상태로 마우스를 움직이면 <br> 달이 따라옵니다 (고정하려면 재클릭)";
        solarInstruction.style.display = 'block';
        solarMoon.addEventListener('mousedown', () => {
            if (audio?.paused) audio.play().catch(e => console.error(e));
            isDragging = true;
        });
        prevTrackBtnSolar.addEventListener('click', handlePrevTrack);
        nextTrackBtnSolar.addEventListener('click', handleNextTrack);
    }
    function initLunar() {
        if (!lunarMoon || !earthShadow || !lunarInstruction || !prevTrackBtnLunar || !nextTrackBtnLunar) {
            console.error("Lunar elements not found!"); return;
        }
        lunarMoon.style.display = 'block';
        earthShadow.style.display = 'block';
        prevTrackBtnLunar.style.display = 'block';
        nextTrackBtnLunar.style.display = 'block';
        activeDraggableElement = earthShadow;
        lunarInstruction.textContent = "클릭한 상태로 그림자를 드래그하세요";
        lunarInstruction.style.display = 'block';
        earthShadow.addEventListener('mousedown', () => {
            if (audio?.paused) audio.play().catch(e => console.error(e));
            isDragging = true;
        });
        prevTrackBtnLunar.addEventListener('click', handlePrevTrack);
        nextTrackBtnLunar.addEventListener('click', handleNextTrack);
    }

    // --- 공통 함수 ---
    function handlePrevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        changeTrack(currentTrackIndex, false);
        if (audio) audio.pause();
        targetX = RESET_X; targetY = RESET_Y;
        // 드래그 중이 아닐 때 툴팁 바로 숨기기
        if(tooltipElement) tooltipElement.style.opacity = 0;
        if(tooltipElement) tooltipElement.style.display = 'none';
    }
    function handleNextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        changeTrack(currentTrackIndex, false);
        if (audio) audio.pause();
        targetX = RESET_X; targetY = RESET_Y;
        // 드래그 중이 아닐 때 툴팁 바로 숨기기
        if(tooltipElement) tooltipElement.style.opacity = 0;
        if(tooltipElement) tooltipElement.style.display = 'none';
    }
    function setupAudioContext() {
        if (audioContext || !audio) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            sourceNode = audioContext.createMediaElementSource(audio);
            filterNode = audioContext.createBiquadFilter();
            filterNode.type = 'lowpass';
            sourceNode.connect(filterNode);
            filterNode.connect(audioContext.destination);
        } catch (e) { console.error("Web Audio API 초기화 실패:", e); }
    }
    function changeTrack(index, playAudio) {
        if (!audio || !tracks[index]) return;
        audio.src = tracks[index].src;
        if (playAudio) audio.play().catch(e => console.error("음악 재생 실패:", e));

        currentTileStyles = tracks[index].tileStyleClasses;
        allTiles.forEach(tile => {
            tracks.forEach(t => {
                t.tileStyleClasses.forEach(cls => tile.classList.remove(cls));
                if (t.tileShapeClass) tile.classList.remove(t.tileShapeClass);
            });
            if (tracks[index].tileShapeClass) tile.classList.add(tracks[index].tileShapeClass);
            if (currentTileStyles.length > 0) {
                const initialStyle = currentTileStyles[Math.floor(Math.random() * currentTileStyles.length)];
                tile.classList.add(initialStyle);
            }
        });

        if (trackTitleElement) {
            trackTitleElement.style.opacity = 0;
            setTimeout(() => {
                if (tracks[index]) { // 트랙 변경 중 index 유효성 체크
                    trackTitleElement.textContent = tracks[index].title;
                    trackTitleElement.style.opacity = 1;
                }
            }, 300);
        }

        startBackgroundInterval(index);
    }
    function startBackgroundInterval(trackIndex) {
        if (backgroundInterval) clearInterval(backgroundInterval);

        const currentColors = tracks[trackIndex]?.bgColors;
        if (!currentColors || currentColors.length === 0) return;

        document.body.style.backgroundColor = currentColors[0];

        backgroundInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * currentColors.length);
            document.body.style.backgroundColor = currentColors[randomIndex];
        }, 2000);
        isBackgroundIntervalActive = true;
    }

    // --- 효과 업데이트 ---
    function updateEffects() {
        if (!audioContext || !activeDraggableElement || !tooltipElement) return;

        const currentTrackSettings = tracks[currentTrackIndex];
        if (!currentTrackSettings) return;

        let distance, targetRect;
        let showTooltip = false;
        let currentTooltipText = "";

        // 목표 요소(태양 또는 월식 달) 설정
        if (eclipseType === 'Solar') {
            if (!sunTarget) return;
            targetRect = sunTarget.getBoundingClientRect();
            currentTooltipText = currentTrackSettings.solarTooltipText || "";
        } else {
            if (!lunarMoon) return;
            targetRect = lunarMoon.getBoundingClientRect();
            currentTooltipText = currentTrackSettings.lunarTooltipText || "";
        }
        
        // 드래그 중인 요소(일식 달 또는 지구 그림자)의 중심 좌표
        const draggableCenterX = moonX + activeDraggableElement.offsetWidth / 2;
        const draggableCenterY = moonY + activeDraggableElement.offsetHeight / 2;
        // 목표 요소의 중심 좌표
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // 두 중심 사이의 거리 계산
        distance = Math.sqrt(Math.pow(targetCenterX - draggableCenterX, 2) + Math.pow(targetCenterY - draggableCenterY, 2));
        
        // 거리에 따른 효과 비율 계산 (0~1, 가까울수록 1)
        const rawRatio = 1 - (distance / currentTrackSettings.maxDistance);
        const effectRatio = Math.max(0, Math.min(1, rawRatio));

        // 오디오 효과 (드래그 중일 때만)
        if (isDragging && filterNode) {
            const minVolume = 0.1;
            audio.volume = minVolume + (1.0 - minVolume) * effectRatio;
            const minFreq = 400, maxFreq = 20000;
            const newFreq = minFreq + (maxFreq - minFreq) * Math.pow(effectRatio, 2);
            filterNode.frequency.linearRampToValueAtTime(newFreq, audioContext.currentTime + 0.1);
        }

        // 타일 크기 (드래그 중일 때만)
        if (isDragging) {
            const maxTileScale = currentTrackSettings.maxTileScale;
            const minTileScale = currentTrackSettings.minTileScale;
            const tileScale = minTileScale + (maxTileScale - minTileScale) * (1 - effectRatio);
            allTiles.forEach(tile => { tile.style.transform = `scale(${tileScale})`; });
        }

        // 모드별 시각 효과 및 툴팁 조건
        if (eclipseType === 'Solar') {
            const centerOverlapThreshold = 50; // 이 거리 안에 들어와야 툴팁 활성화
            if (isDragging) {
                if(solarMoon) solarMoon.style.filter = `brightness(${1 - effectRatio * 0.8})`;
                if (distance < centerOverlapThreshold) { showTooltip = true; } // 툴팁 조건
            }
            // 배경색 고정 로직
            const blackBackgroundThreshold = 0.85;
            if (isDragging && effectRatio > blackBackgroundThreshold) {
                if (isBackgroundIntervalActive) {
                    clearInterval(backgroundInterval);
                    isBackgroundIntervalActive = false;
                    document.body.style.backgroundColor = '#000000';
                }
            } else {
                if (!isBackgroundIntervalActive) { startBackgroundInterval(currentTrackIndex); }
            }
        } else { // 월식
            // ▼▼▼ 월식 겹침 판정 기준값 (조절 가능) ▼▼▼
            const lunarOverlapThreshold = 50; // 그림자와 달 중심 거리가 이 값보다 작으면 겹친 것으로 간주
            // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

            if (isDragging) {
                if (distance < lunarOverlapThreshold) {
                    if(lunarMoon) lunarMoon.classList.add('eclipsed');
                    if(earthShadow) earthShadow.classList.add('shadow-transparent');
                    showTooltip = true; // 툴팁 조건
                } else {
                    if(lunarMoon) lunarMoon.classList.remove('eclipsed');
                    if(earthShadow) earthShadow.classList.remove('shadow-transparent');
                }
            } else {
                 if(lunarMoon) lunarMoon.classList.remove('eclipsed');
                 if(earthShadow) earthShadow.classList.remove('shadow-transparent');
            }
             if (!isBackgroundIntervalActive) { startBackgroundInterval(currentTrackIndex); }
        }

        // 툴팁 최종 처리
        if (showTooltip && isDragging) {
            tooltipElement.innerHTML = currentTooltipText;
            tooltipElement.style.left = `${draggableCenterX}px`;
            tooltipElement.style.top = `${draggableCenterY}px`;
            tooltipElement.style.transform = 'translate(-50%, -50%)';
            tooltipElement.style.opacity = 1;
            tooltipElement.style.display = 'flex';
        } else {
            tooltipElement.style.opacity = 0;
             // opacity 트랜지션 후 숨김
             setTimeout(() => {
                 // opacity가 여전히 0이면 (=그 사이에 다시 showTooltip이 true가 되지 않았다면) 숨김
                 if (tooltipElement.style.opacity === '0') {
                      tooltipElement.style.display = 'none';
                 }
             }, 300); // CSS transition 시간과 맞춤
        }
    }

    // --- 애니메이션 루프 ---
    function animationLoop() {
        const easeFactor = 0.3;
        moonX += (targetX - moonX) * easeFactor;
        moonY += (targetY - moonY) * easeFactor;
        
        if (activeDraggableElement) {
            activeDraggableElement.style.transform = `translate(${moonX}px, ${moonY}px)`;
        }
        
        updateEffects(); // 매 프레임 효과 업데이트 (드래그 안 해도 배경색/툴팁 숨김 등 관리)
        requestAnimationFrame(animationLoop);
    }
});

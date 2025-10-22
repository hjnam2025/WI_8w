document.addEventListener('DOMContentLoaded', () => { document.body.classList.add('initial-state');});

const eclipseSelect = document.getElementById('eclipse-select');
const typeSelect = document.getElementById('type-select');
const dateDisplay = document.getElementById('date-display');
const eclipseDescriptionDisplay = document.getElementById('eclipse-description-display');
const typeDescriptionDisplay = document.getElementById('type-description-display');
const eclipseGif = document.getElementById('eclipse-gif');
const Timer = document.getElementById('Timer');
const writeLetterItems = document.getElementsByClassName('write-letter-item');
const titleElement = document.querySelector('.montfont');
let typeSelectedOnce = false;


const typesData = {
    'Solar': {
        description: '달이 태양과 지구 사이에 놓여 지구에서 볼 때 달이 태양의 전부 또는 일부를 가리는 현상',
        types: [
            {
                name: '가장 가까운 시일',
                date: '2026년 2월 17일',
                description: '금환일식,<br> 달이 태양의 한가운데만 가려 달 주위가 금고리 모양으로 나타나는 일식',
                gif: './other/imgs/annular-so.gif'
            },
            {
                name: '금환일식',
                date: '2026년 2월 17일',
                description: '달이 태양의 한가운데만 가려 달 주위가 금고리 모양으로 나타나는 일식',
                gif: './other/imgs/annular-so.gif'
            },
            {
                name: '부분일식',
                date: '2029년 1월 14일',
                description: '태양의 일부만 가려지는 일식',
                gif: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWZoanBjbTRxODlldHo4eXExY2thNzJscnE1bDdsZ3VkZzE1ODl0cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cn2weaeEW7znTDqCrZ/giphy.gif'
            },
            {
                name: '개기일식',
                date: '2026년 8월 12일',
                description: '태양 전체가 가려지는 일식',
                gif: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDN3d2szNGM4OGUycG8zNWVsdTBtMGZ6ZDB5eGl2ZmxrOWNsZzR5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KyqsNHkqHT5CLBA3un/giphy.gif'
            },
            {
                name: '혼성일식',
                date: '마지막 관측 <br>: 2023년 4월 20일',
                description: '태양의 테두리만 보이는 금환일식과 태양이 완전히 가려지는 개기일식이 동시에 나타나는 현상',
                gif: './other/imgs/hybrid.jpg'
            }
        ]
    },
    'Lunar': {
        description: '태양, 지구 그리고 달이 태양-지구-달의 위치로 배열되어 지구의 그림자에 달이 가려져 어둡게 보이는 현상',
        types: [
            {
                name: '가장 가까운 시일',
                date: '2026년 3월 3일',
                description: '개기월식, <br>달 전체가 지구 그림자에 가려지는 월식 ',
                gif: './other/imgs/total-lu.gif'
            },
            {
                name: '개기월식',
                date: '2026년 3월 3일',
                description: '달 전체가 지구 그림자에 가려지는 월식',
                gif: './other/imgs/total-lu.gif'
            },
            {
                name: '부분월식',
                date: '2026년 8월 28일',
                description: '달의 일부만 가려지는 월식',
                gif: './other/imgs/part-lu.gif'
            },
            {
                name: '반영월식',
                date: '2027년 2월 21일',
                description: '달이 지구의 반영(반그림자)에 가려져 흐릿해지는 월식',
                gif: 'https://upload.wikimedia.org/wikipedia/commons/7/74/L%27%C3%A9clipse_du_31_d%C3%A9cembre_2009_%28animation%29.gif'
            }
        ]
    }
};

// 선택:타이머

eclipseSelect.onchange = function() {
  
    document.body.classList.remove('initial-state'); 
    titleElement.style.display = 'none';
    const selectedEclipseValue = this.value;
    const eclipseData = typesData[selectedEclipseValue];
    localStorage.setItem('selectedEclipseType', selectedEclipseValue); // 'Solar' 또는 'Lunar' 저장//
    typeSelect.innerHTML = '<option value="">종류 선택</option>';
    
    // 나머지 UI 초기화
    dateDisplay.style.display = 'none';
    dateDisplay.innerHTML = '';
    typeDescriptionDisplay.innerHTML = '';
    eclipseGif.src = '';
    Timer.innerHTML = '';
    document.body.style.backgroundImage = 'none';
    if(timerInterval) clearInterval(timerInterval);
    localStorage.removeItem('eclipseBackgroundGif');
    localStorage.removeItem('eclipseName');
    localStorage.removeItem('eclipseDate');
    for (let item of writeLetterItems) { // 버튼 숨기기
        item.style.display = 'none';
    }


    if (eclipseData) {
        eclipseDescriptionDisplay.innerHTML = `${eclipseData.description}`;
        const typeList = eclipseData.types || [];
        typeList.forEach(type => {
            const newOption = document.createElement('option');
            newOption.value = type.name;
            newOption.textContent = type.name;
            typeSelect.appendChild(newOption);
        });

        typeSelect.style.display = 'inline-block'; // 2. '종류' select 보이기
        if (!typeSelectedOnce) { // 3. '종류'를 처음 선택하는 거라면
            typeSelect.classList.add('blinking'); // 깜빡임 시작
        }

    } else {
        // '식' 선택 취소 시 '종류' 숨기기
        eclipseDescriptionDisplay.innerHTML = '';
        typeSelect.style.display = 'none'; // 4. '종류' select 숨기기
        typeSelect.classList.remove('blinking'); // 깜빡임도 끄기
    }
};

/////

typeSelect.onchange = function() {
    const selectedTypeName = this.value;
    const selectedEclipse = eclipseSelect.value;
    const currentTypesList = typesData[selectedEclipse]?.types;
    const selectedTypeInfo = currentTypesList?.find(item => item.name === selectedTypeName);

    typeSelect.classList.remove('blinking'); // 5. '종류'를 선택하면 무조건 깜빡임 멈춤

    if (selectedTypeInfo && selectedTypeName !== '') {
        typeSelectedOnce = true; // 6. '종류'가 유효하게 선택됐다고 기록

        dateDisplay.style.display = 'block'
        dateDisplay.innerHTML = `${selectedTypeInfo.date}`;
        // ... (기존 localStorage, startTimer 등 코드 동일) ...
        typeDescriptionDisplay.innerHTML = `${selectedTypeInfo.description}`;
        eclipseGif.src = selectedTypeInfo.gif;
        startTimer(selectedTypeInfo.date);
 
        document.body.style.backgroundImage = `url(${selectedTypeInfo.gif})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
 
        
        let finalEclipseName = selectedTypeInfo.name; 
 
        if (selectedTypeName === '가장 가까운 시일') {
            finalEclipseName = selectedTypeInfo.description.split('<br>')[0].replace(',', '');
        }
 
        
        localStorage.setItem('eclipseName', finalEclipseName);
        localStorage.setItem('eclipseDate', selectedTypeInfo.date);
        
        const relativeGifPath = selectedTypeInfo.gif.replace('./other/', '../other/');
        localStorage.setItem('eclipseBackgroundGif', relativeGifPath);
        
        startTimer(selectedTypeInfo.date);

        for (let item of writeLetterItems) {
            item.style.display = 'inline-block'; // 7. 'display'를 '' 대신 'inline-block'으로 명시
        }
        
    } else {
        // 선택 해제 시 초기화 (기존 코드와 동일)
        dateDisplay.style.display = 'none'
        dateDisplay.innerHTML = '';
        typeDescriptionDisplay.innerHTML = '';
        eclipseGif.src = '';
        document.body.style.backgroundImage = 'none';
        Timer.innerHTML = '';
        if(timerInterval) clearInterval(timerInterval);
        localStorage.removeItem('eclipseBackgroundGif');
        localStorage.removeItem('eclipseName');
        localStorage.removeItem('eclipseDate');
        // 8. localStorage.removeItem('eclipseDate'); 중복 제거 (필수는 아님)
        for (let item of writeLetterItems) {
            item.style.display = 'none';
        }
    }
};


let timerInterval = null; 

function startTimer(targetDate) {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    let parsableDate = targetDate
        .replace('년', '-')
        .replace('월', '-')
        .replace('일', '')
        .replace(/\s/g, '');

    const future = Date.parse(parsableDate);
    if (isNaN(future)) {
        Timer.innerHTML = ''; //
        return;
    }

    // 3. 1초마다 시간 계산해서 화면 업데이트
    timerInterval = setInterval(() => {
        const now = new Date();
        const diff = future - now;

        if (diff <= 0) {
            Timer.innerHTML = "2025년~ 2030년 이내에는 없습니다.";
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        Timer.innerHTML =
            '<div>' + days + '<span>Days</span></div>' +
            '<div>' + hours + '<span>Hours</span></div>' +
            '<div>' + mins + '<span>Mins</span></div>' +
            '<div>' + secs + '<span>Secs</span></div>';
    }, 1000);
}

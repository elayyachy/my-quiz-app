let quizData = {};
let score = 0;

fetch('questions.json')
    .then(response => response.json())
    .then(data => { quizData = data; initSemesters(); });

function initSemesters() {
    const semSelect = document.getElementById('sem-select');
    Object.keys(quizData).forEach(sem => {
        let opt = document.createElement('option');
        opt.value = sem; opt.textContent = sem;
        semSelect.appendChild(opt);
    });
}

document.getElementById('sem-select').addEventListener('change', function() {
    const sem = this.value;
    const pathContainer = document.getElementById('path-container');
    const pathSelect = document.getElementById('path-select');
    const modSelect = document.getElementById('mod-select');
    pathSelect.innerHTML = '<option value="">اختر المسار...</option>';
    modSelect.innerHTML = '<option value="">اختر الموديل...</option>';
    if (!sem) return;

    const firstKey = Object.keys(quizData[sem])[0];
    if (firstKey.includes("مسار")) {
        pathContainer.style.display = 'block';
        Object.keys(quizData[sem]).forEach(path => {
            let opt = document.createElement('option');
            opt.value = path; opt.textContent = path;
            pathSelect.appendChild(opt);
        });
    } else {
        pathContainer.style.display = 'none';
        fillModules(quizData[sem]);
    }
});

document.getElementById('path-select').addEventListener('change', function() {
    const sem = document.getElementById('sem-select').value;
    const path = this.value;
    if (path) fillModules(quizData[sem][path]);
});

function fillModules(data) {
    const modSelect = document.getElementById('mod-select');
    modSelect.innerHTML = '<option value="">اختر الموديل...</option>';
    Object.keys(data).forEach(mod => {
        let opt = document.createElement('option');
        opt.value = mod; opt.textContent = mod;
        modSelect.appendChild(opt);
    });
}

document.getElementById('start-btn').addEventListener('click', () => {
    const sem = document.getElementById('sem-select').value;
    const path = document.getElementById('path-select').value;
    const mod = document.getElementById('mod-select').value;
    let questions = document.getElementById('path-container').style.display === 'none' ? quizData[sem][mod] : quizData[sem][path][mod];
    
    if (!questions) return alert("الرجاء إكمال الاختيارات");
    questions.sort(() => Math.random() - 0.5);
    
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    score = 0;
    showQuestion(questions, 0);
});

function showQuestion(questions, index) {
    if (index < questions.length) {
        const q = questions[index];
        document.getElementById('question').textContent = q.question;
        document.getElementById('score-display').textContent = `النقاط: ${score}`;
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        
        let timeLeft = 10;
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.textContent = `الوقت: ${timeLeft}`;

        const timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `الوقت: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                showQuestion(questions, index + 1);
            }
        }, 1000);

        let optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correct }));
        optionsWithIndex.sort(() => Math.random() - 0.5);

        optionsWithIndex.forEach((opt) => {
            let btn = document.createElement('button');
            btn.textContent = opt.text;
            btn.className = 'option-btn';
            btn.onclick = () => {
                clearInterval(timer);
                const allBtns = optionsDiv.getElementsByTagName('button');
                for (let b of allBtns) b.disabled = true;
                btn.style.backgroundColor = opt.isCorrect ? '#27ae60' : '#c0392b';
                if(opt.isCorrect) score++;
                document.getElementById('score-display').textContent = `النقاط: ${score}`;
                setTimeout(() => showQuestion(questions, index + 1), 1000);
            };
            optionsDiv.appendChild(btn);
        });
    } else {
        alert(`انتهت المسابقة! نتيجتك النهائية هي: ${score}/${questions.length}`);
        location.reload();
    }
}
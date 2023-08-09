'use strict';
import { clickCount, scrollWidth } from "./function_storage.js";

const body = document.body;
const win = document.documentElement; // Он же <html>
const clickingObject = document.getElementById('ClickingObject');
const scrW = scrollWidth();
const pause = document.getElementById('Pause');
const scrollReset = document.getElementById('ScrollReset');
const scrollType = document.getElementById('ScrollType');
const centeringElem = document.getElementById('CenteringElem');
const medInfo = document.getElementById('MedInfo');
const readAgreement = document.getElementById('ReadAgreement');
const medAgreement = document.getElementById('MedAgreement');
const closeAgreement = document.getElementById('CloseAgreement');
const locations = ['TopLeft', 'BottomRight', 'TopRight', 'BottomLeft', 'Center'];
let clickObjRect = clickingObject.getBoundingClientRect();
let scrollCoords = {
    objX: clickObjRect.x,
    objY: clickObjRect.y,
    objW: clickObjRect.width,
    objH: clickObjRect.height,

    winW: win.clientWidth,
    winH: win.clientHeight,

    TopLeft() {
        return [
            window.pageXOffset + this.objX,
            window.pageYOffset + this.objY
        ];
    },
    BottomRight() {
        return [
            window.pageXOffset + this.objX - this.winW + this.objW,
            window.pageYOffset + this.objY - this.winH + this.objH
        ];
    },
    TopRight() {
        return [
            window.pageXOffset + this.objX - this.winW + this.objW,
            window.pageYOffset + this.objY
        ];
    },
    BottomLeft() {
        return [
            window.pageXOffset + this.objX,
            window.pageYOffset + this.objY - this.winH + this.objH
        ];
    },
    Center() {
        return [
            window.pageXOffset + this.objX - this.winW / 2 + this.objW / 2,
            window.pageYOffset + this.objY - this.winH / 2 + this.objH / 2
        ];
    },

    x() {
        return this[locations[idx]]()[0];
    },
    y() {
        return this[locations[idx]]()[1];
    }
};
let iClick = 0,
    mesTimer = null,
    scrollTimer = null,
    idx = null,
    count = null,
    t,
    startTime;

clickingObject.insertAdjacentHTML('beforeend', '<p class="ClickInfo">(Не запущено)</p>');

mesTimer = setInterval(() => createAngleMessages(clickingObject, 'Щёлкни!',
    'Нажми!', 'Ткни!', 'Запусти!'), 2200);

console.log('Scroll width: ' + scrW + 'px');

readAgreement.onclick = function() {
    if (medAgreement.hasAttribute('shown')) {
        medAgreement.removeAttribute('shown');
        medAgreement.style.display = 'none';
        readAgreement.style.color = '#0400ff';

    } else {
        medAgreement.setAttribute('shown', '');
        medAgreement.style.display = 'block';
        readAgreement.style.color = '#00ffff';
    }
}

closeAgreement.onclick = function() {
    medAgreement.removeAttribute('shown');
    medAgreement.style.display = 'none';
    readAgreement.style.color = '#0400ff';
}

clickingObject.addEventListener('click', startAutoScroll);

scrollReset.addEventListener('click', () => window.scrollTo(0, 0));

scrollType.addEventListener('click', () => {
    if (scrollType.dataset.type == 'fast') {
        scrollType.dataset.type = 'smooth';
        document.querySelector('#ScrollType span').innerHTML = 'плавный';
        win.classList.add('SmoothScroll');
    } else {
        scrollType.dataset.type = 'fast';
        document.querySelector('#ScrollType span').innerHTML = 'мгновенный';
        win.classList.remove('SmoothScroll');
    }
});

centeringElem.addEventListener('click', () => {
    clickObjRect = clickingObject.getBoundingClientRect();

    window.scrollTo(
        window.pageXOffset + clickObjRect.x - win.clientWidth / 2 + clickObjRect.width / 2,
        window.pageYOffset + clickObjRect.y - win.clientHeight / 2 + clickObjRect.height / 2
    );
});

pause.addEventListener('click', () => {
    if (pause.dataset.onclick == 'true') {
        clearTimeout(scrollTimer);

        clickingObject.children[0].innerHTML = '<b>Продолжить</b>';
        clickingObject.style.backgroundColor = '#fbff00';
        clickingObject.style.cursor = 'pointer';
        clickingObject.removeAttribute('data-disabled');
        clickingObject.addEventListener('click', startAutoScroll);
    }
});

async function autoScrolling(bodyW, bodyH, time) {
    pause.dataset.onclick = 'true';

    clickingObject.children[0].innerHTML = '<b>Автоскроллится с ускорением!</b>';
    clickingObject.style.backgroundColor = '#b7ebe6';
    clickingObject.style.cursor = 'not-allowed';
    clickingObject.setAttribute('data-disabled', '');

    idx ??= 4;
    count ??= 0;

    // Первый запуск - увеличение размеров страницы и начальное центрирование
    if (count == 0) {
        startTime = Date.now();

        clearInterval(mesTimer);

        medInfo.remove();
    
        let messages = document.querySelectorAll('.Message');
        for (let message of messages) {
            message.remove();
        }

        body.style.width = bodyW + 'px';
        body.style.height = bodyH + 'px';

        if (window.innerWidth - win.clientWidth) {
            let diffW = window.innerWidth - win.clientWidth; // Толщина скролла в браузере

            pause.style.left = `calc(50vw - ${pause.offsetWidth}px/2 - ${diffW}px/2)`;
            centeringElem.style.left = `calc(50vw - ${centeringElem.offsetWidth}px/2 - ${diffW}px/2)`;
        }

        clickObjRect = clickingObject.getBoundingClientRect();
        scrollCoords.objX = clickObjRect.x;
        scrollCoords.objY = clickObjRect.y;
        scrollCoords.winW = win.clientWidth;
        scrollCoords.winH = win.clientHeight;

        window.scrollTo(scrollCoords.x(), scrollCoords.y());

        console.log('\nCentering');
        console.log('Location: ' + locations[idx]);

        t = time;
        idx = 0;
    }

    // Основной цикл автоскроллинга
    while (t >= 0) {
        await new Promise( resolve => scrollTimer = setTimeout(() => {
            clickObjRect = clickingObject.getBoundingClientRect();
            scrollCoords.objX = clickObjRect.x;
            scrollCoords.objY = clickObjRect.y;
            scrollCoords.winW = win.clientWidth;
            scrollCoords.winH = win.clientHeight;

            window.scrollTo(scrollCoords.x(), scrollCoords.y());

            console.log('Cycle №' + (count + 1));
            console.log('Location: ' + locations[idx]);
            console.log('Time passed: ' + t.toFixed(3) + 'ms');

            let tLast = t;

            count++;
            t = t - (1000 - count * 5) / (50 + count);
            idx++;
            if (idx > 4) idx = 0;

            console.log('Time delta: ' + (tLast - t).toFixed(3) + 'ms');

            resolve();
        }, t));
    }

    // Финальное центрирование
    if (!(--idx < 0)) { // Если предыдущая локация не являлась "Center"...
        idx = 4;          // ...то выбрать локацию "Center" и проскроллить элемент
        
        clickObjRect = clickingObject.getBoundingClientRect();
        scrollCoords.objX = clickObjRect.x;
        scrollCoords.objY = clickObjRect.y;
        scrollCoords.winW = win.clientWidth;
        scrollCoords.winH = win.clientHeight;
        
        window.scrollTo(scrollCoords.x(), scrollCoords.y());
    }

    console.log('\nTime passed: ' + (Date.now() - startTime) + 'ms');

    pause.dataset.onclick = 'false';

    clickingObject.style.transition = '1500ms linear';
    clickingObject.className = 'Finish';
    clickingObject.children[0].innerHTML = '<b>Демонстрация завершена.<br><br>' +
        'Клик для нового показа!</b>';
    clickingObject.style.backgroundColor = '#ff48b3';
    clickingObject.style.cursor = 'default';

    setTimeout(() => {
        clickingObject.style.transition = '';
        clickingObject.className = '';
        clickingObject.style.backgroundColor = '#fbff00';
        clickingObject.style.cursor = 'pointer';
        clickingObject.removeAttribute('data-disabled');
        clickingObject.addEventListener('click', startAutoScroll);
        
        mesTimer = setInterval(() => createAngleMessages(clickingObject, 'Щёлкни!',
            'Нажми!', 'Ткни!', 'Запусти!'), 2200);

        idx = 4;
        count = 0;
    }, 1500); // Равняется длительности transition в clickingObject
}

function createAngleMessages(elem, mesTL, mesTR, mesBL, mesBR) {
    let elemRect = elem.getBoundingClientRect();

    let messageTopLeft = document.createElement('div');
    messageTopLeft.className = 'Message';
    messageTopLeft.style.cssText = "position: absolute; color: red; background: rgba(255, 251, 0, 0.05)";
    messageTopLeft.innerHTML = mesTL;
    messageTopLeft.style.left = (window.pageXOffset + elemRect.left - 63) + "px";
    messageTopLeft.style.top = (window.pageYOffset + elemRect.top - 18) + "px";

    let messageTopRight = document.createElement('div');
    messageTopRight.className = 'Message';
    messageTopRight.style.cssText = "position: absolute; color: blue; background: rgba(255, 251, 0, 0.05)";
    messageTopRight.innerHTML = mesTR;
    messageTopRight.style.left = (window.pageXOffset + elemRect.right + 5) + "px";
    messageTopRight.style.top = (window.pageYOffset + elemRect.top - 18) + "px";

    let messageBottomLeft = document.createElement('div');
    messageBottomLeft.className = 'Message';
    messageBottomLeft.style.cssText = "position: absolute; color: green; background: rgba(255, 251, 0, 0.05)";
    messageBottomLeft.innerHTML = mesBL;
    messageBottomLeft.style.left = (window.pageXOffset + elemRect.left - 42) + "px";
    messageBottomLeft.style.top = (window.pageYOffset + elemRect.bottom) + "px";

    let messageBottomRight = document.createElement('div');
    messageBottomRight.className = 'Message';
    messageBottomRight.style.cssText = "position: absolute; color: orange; background: rgba(255, 251, 0, 0.05)";
    messageBottomRight.innerHTML = mesBR;
    messageBottomRight.style.left = (window.pageXOffset + elemRect.right + 5) + "px";
    messageBottomRight.style.top = (window.pageYOffset + elemRect.bottom) + "px";
    
    document.body.append(messageTopLeft, messageTopRight, messageBottomLeft, messageBottomRight);

    setTimeout(() => {
        messageTopLeft.remove();
        messageTopRight.remove();
        messageBottomLeft.remove();
        messageBottomRight.remove();
    }, 1500);
}

function startAutoScroll() {
    clickCount(++iClick);

    autoScrolling(3700, 1800, 1000);

    clickingObject.removeEventListener('click', startAutoScroll);
}

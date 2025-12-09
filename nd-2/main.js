let isCelsius = true;
let expandedCard = null;

const data = {
    temp: 0,
    humidity: 0,
    pressure: 0,
    windSpeed: 0,
    windDir: 0,
    rainfall: 0,
    uvIndex: 0,
    tempHistory: [],
    humidityHistory: [],
    pressureHistory: [],
    windHistory: [],
    rainfallHistory: [],
    uvHistory: [],
    timeLabels: []
};

function toggleUnits() {
    isCelsius = !isCelsius;
    updateUI();
    if (expandedCard) {
        updateCharts();
    }
}

function refreshData() {
    generateSensorData();
    updateTime();
    updateUI();
    if (expandedCard) {
        updateCharts();
    }
}

function toggleCard(card, chartId) {
    const wasExpanded = card.classList.contains('expanded');
    
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('expanded');
    });
    
    if (!wasExpanded) {
        card.classList.add('expanded');
        expandedCard = chartId;
        setTimeout(() => {
            updateCharts();
        }, 100);
    } else {
        expandedCard = null;
    }
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function formatTemp(celsius) {
    if (isCelsius) {
        return celsius.toFixed(1) + '°C';
    } else {
        return celsiusToFahrenheit(celsius).toFixed(1) + '°F';
    }
}

function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('currentTime').textContent = now.toLocaleDateString('lt-LT', options);
}

function generateSensorData() {
    data.temp = 15 + Math.random() * 10;
    data.humidity = 50 + Math.random() * 30;
    data.pressure = 1000 + Math.random() * 30;
    data.windSpeed = Math.random() * 15;
    data.windDir = Math.floor(Math.random() * 360);
    data.rainfall = Math.random() * 5;
    data.uvIndex = Math.floor(Math.random() * 11);

    if (data.tempHistory.length >= 24) {
        data.tempHistory.shift();
        data.humidityHistory.shift();
        data.pressureHistory.shift();
        data.windHistory.shift();
        data.rainfallHistory.shift();
        data.uvHistory.shift();
        data.timeLabels.shift();
    }
    data.tempHistory.push(data.temp);
    data.humidityHistory.push(data.humidity);
    data.pressureHistory.push(data.pressure);
    data.windHistory.push(data.windSpeed);
    data.rainfallHistory.push(data.rainfall);
    data.uvHistory.push(data.uvIndex);
    
    const now = new Date();
    data.timeLabels.push(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
}

function getWindDirection(degrees) {
    const directions = ['Š', 'ŠR', 'R', 'PR', 'P', 'PV', 'V', 'ŠV'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function getUVCategory(index) {
    if (index <= 2) return 'Žemas';
    if (index <= 5) return 'Vidutinis';
    if (index <= 7) return 'Aukštas';
    if (index <= 10) return 'Labai aukštas';
    return 'Ekstremalus';
}

function getHumidityStatus(humidity) {
    if (humidity < 30) return 'Sausa';
    if (humidity < 60) return 'Normali';
    return 'Drėgna';
}

function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return ((b * alpha) / (a - alpha));
}

function updateUI() {
    const tempValue = isCelsius ? data.temp : celsiusToFahrenheit(data.temp);
    const tempUnit = isCelsius ? '°C' : '°F';
    
    document.getElementById('temp').textContent = tempValue.toFixed(1);
    document.getElementById('tempUnit').textContent = tempUnit;
    document.getElementById('tempMin').textContent = formatTemp(data.temp - 3);
    document.getElementById('tempMax').textContent = formatTemp(data.temp + 2);
    
    document.getElementById('humidity').textContent = data.humidity.toFixed(0);
    const dewPoint = calculateDewPoint(data.temp, data.humidity);
    document.getElementById('dewPoint').textContent = formatTemp(dewPoint);
    document.getElementById('humidityStatus').textContent = getHumidityStatus(data.humidity);
    
    document.getElementById('pressure').textContent = data.pressure.toFixed(0);
    document.getElementById('pressureTrend').textContent = '↗ Kyla';
    document.getElementById('pressureSea').textContent = data.pressure.toFixed(0) + ' hPa';
    
    document.getElementById('windSpeed').textContent = data.windSpeed.toFixed(1);
    document.getElementById('windDir').textContent = getWindDirection(data.windDir);
    document.getElementById('windGust').textContent = (data.windSpeed * 1.5).toFixed(1) + ' m/s';
    
    document.getElementById('rainfall').textContent = data.rainfall.toFixed(1);
    document.getElementById('rainfallDaily').textContent = (data.rainfall * 3).toFixed(1) + ' mm';
    document.getElementById('rainfallIntensity').textContent = data.rainfall > 2 ? 'Vidutinis' : 'Silpnas';
    
    document.getElementById('uvIndex').textContent = data.uvIndex;
    document.getElementById('uvCategory').textContent = getUVCategory(data.uvIndex);
    document.getElementById('illuminance').textContent = Math.floor(Math.random() * 50000) + ' lx';
}

function drawChart(canvasId, dataArray, color, label, unit = '') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = canvas.width = container.offsetWidth;
    const height = canvas.height = container.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    if (dataArray.length < 2) return;
    
    let displayData = dataArray;
    if (canvasId === 'tempChart' && !isCelsius) {
        displayData = dataArray.map(temp => celsiusToFahrenheit(temp));
    }
    
    const paddingLeft = 85;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 40;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    
    const max = Math.max(...displayData) * 1.1;
    const min = Math.min(...displayData) * 0.9;
    const range = max - min;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = paddingTop + (graphHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        
        const value = (max - (range / 5) * i).toFixed(1);
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value + unit, paddingLeft - 10, y + 5);
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    displayData.forEach((value, index) => {
        const x = paddingLeft + (graphWidth / (displayData.length - 1)) * index;
        const y = paddingTop + graphHeight - ((value - min) / range) * graphHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    ctx.fillStyle = color;
    displayData.forEach((value, index) => {
        const x = paddingLeft + (graphWidth / (displayData.length - 1)) * index;
        const y = paddingTop + graphHeight - ((value - min) / range) * graphHeight;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#666';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    const labelStep = Math.max(1, Math.ceil(displayData.length / 8));
    for (let i = 0; i < displayData.length; i += labelStep) {
        const x = paddingLeft + (graphWidth / (displayData.length - 1)) * i;
        if (data.timeLabels[i]) {
            ctx.fillText(data.timeLabels[i], x, height - paddingBottom + 25);
        }
    }
}

function updateCharts() {
    if (!expandedCard) return;
    
    switch(expandedCard) {
        case 'tempChart':
            const tempUnit = isCelsius ? '°C' : '°F';
            drawChart('tempChart', data.tempHistory, '#667eea', 'Temperatūra', tempUnit);
            break;
        case 'humidityChart':
            drawChart('humidityChart', data.humidityHistory, '#48bb78', 'Drėgmė', '%');
            break;
        case 'pressureChart':
            drawChart('pressureChart', data.pressureHistory, '#f6ad55', 'Slėgis', 'hPa');
            break;
        case 'windChart':
            drawChart('windChart', data.windHistory, '#4299e1', 'Vėjas', 'm/s');
            break;
        case 'rainfallChart':
            drawChart('rainfallChart', data.rainfallHistory, '#38b2ac', 'Krituliai', 'mm');
            break;
        case 'uvChart':
            drawChart('uvChart', data.uvHistory, '#ed8936', 'UV', '');
            break;
    }
}

for (let i = 0; i < 24; i++) {
    generateSensorData();
}

updateTime();
updateUI();

window.addEventListener('resize', () => {
    if (expandedCard) {
        updateCharts();
    }
});
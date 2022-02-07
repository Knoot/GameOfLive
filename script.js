const Params = new URLSearchParams(document.location.search)

import Cell from "./Modules/Cell.js"

const settings = {
    randomStart: parseSetting(strToBool(Params.get('randomStart')), false),
    startChance: parseSetting(Params.get('startChance'), .2),
    speed: parseSetting(Params.get('speed'), 42),
    displayGrid: parseSetting(strToBool(Params.get('displayGrid')), true),
    gridColor: parseSetting(Params.get('gridColor'), '#eee'),
}
const cellSettings = {
    size: parseSetting(Params.get('cellSize'), 8),
    stamina: parseSetting(Params.get('cellStamina'), 10),
    resurrectionAfter: parseSetting(Params.get('cellResurrectionAfter'), 50),
    colored: parseSetting(strToBool(Params.get('cellColored')), false),
}

const canvas = document.getElementById('grid')
const context = canvas.getContext('2d')

const table = [];

function rnd(max = 1) {
    return Math.random() * max
}

function drawGrid() {
    if (!settings.displayGrid) { return }
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (var x = 0; x < Math.floor(canvas.width / cellSettings.size); x++) {
        const mod = cellSettings.size * x - x + .5
        context.moveTo(x + mod, 0);
        context.lineTo(x + mod, canvas.height);
    }

    for (var y = 0; y < Math.floor(canvas.height / cellSettings.size); y++) {
        const mod = cellSettings.size * y - y + .5
        context.moveTo(0, y + mod);
        context.lineTo(canvas.width, y + mod);
    }

    context.strokeStyle = settings.gridColor;
    context.stroke();
}

function init() {
    onResize()

    for (let y = 0; y < Math.floor(canvas.height / cellSettings.size); y++) {
        table[y] = []
        for (let x = 0; x < Math.floor(canvas.width / cellSettings.size); x++) {
            table[y][x] = new Cell(context, y, x, cellSettings)
        }
    }

    for (let y = 0; y < table.length; y++) {
        for (let x = 0; x < table[y].length; x++) {
            const cell = table[y][x]
            const prevRow = table[y - 1]
            const nextRow =  table[y + 1]

            cell.setNeighbours([
                prevRow ? prevRow[x - 1] : undefined,
                prevRow ? prevRow[x] : undefined,
                prevRow ? prevRow[x + 1] : undefined,
                table[y][x + 1],
                nextRow ? nextRow[x + 1] : undefined,
                nextRow ? nextRow[x] : undefined,
                nextRow ? nextRow[x - 1] : undefined,
                table[y][x - 1],
            ].filter((e) => e != null))

            if (settings.randomStart && rnd().toFixed(2) < settings.startChance) {
                cell.spawn()
            }
        }
    }
}

function iter() {
    let snapshot = []

    table.forEach((row, y) => {
        snapshot[y] = []
        row.forEach((cell, x) =>
            snapshot[y][x] = cell.checkNeighbours()
        )
    })
    snapshot.forEach((row, y) =>
        row.forEach((cell, x) =>
            table[y][x][snapshot[y][x] ? 'spawn' : 'kill']()
        )
    )
}

function onResize() {
    canvas.height = Math.floor((document.documentElement.clientHeight - cellSettings.size) / cellSettings.size) * cellSettings.size
    canvas.width = Math.floor((document.documentElement.clientWidth - cellSettings.size) / cellSettings.size) * cellSettings.size
    drawGrid()
};

init()
setInterval(iter, settings.speed)

document.addEventListener("DOMContentLoaded", function () {
    if (settings.displayGrid) {
        canvas.style.border = `1px solid ${settings.gridColor}`;
    }
})

// window.onresize = onResize

function strToBool(str) {
    if(str === 'true' || str === '1') {
        return true
    }

    if (str === 'false' || str === '0') {
        return false
    }

    return null
}

// для IE
function parseSetting(setting, def) {
    return setting !== null ? setting : def
}

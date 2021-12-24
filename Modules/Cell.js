export default class Cell {
    constructor(context, y, x, settings) {
        this.context = context
        this.size = settings.size - 1
        this.y = y * settings.size + 1
        this.x = x * settings.size + 1
        this.stamina = settings.stamina || 5
        this.resurrectionAfter = -settings.resurrectionAfter - x

        this.alive = false
        this.defaultStamina = this.stamina
        this.neighbours = []

        if (settings.colored) {
            this.setRGB(this.getRandomRGB(), this.getRandomRGB(), this.getRandomRGB())
        } else {
            this.setRGB(0, 0, 0)
        }
    }

    getRandomRGB() {
        return Math.round(Math.random() * 255)
    }

    getAlive() {
        return this.alive
    }

    setRGB(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }

    spawn(stamina) {
        if (!this.alive) {
            this.alive = true
            this.stamina = stamina || this.defaultStamina

        } else {
            if (--this.stamina <= 0) {
                return this.kill()
            }
        }
        this.update()
    }

    kill() {
        if (this.alive) {
            this.alive = false
            this.update()
        }
        if (--this.stamina <= this.resurrectionAfter) {
            if (this.checkNeighbours()) {
                this.stamina = 0
            } else {
                this.spawn(1)
            }
        }
    }

    update() {
        this.context.clearRect(this.x, this.y, this.size, this.size)
        if (this.alive) {
            this.context.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.stamina > 1 ? this.stamina / this.defaultStamina : 0})`
            this.context.fillRect(this.x, this.y, this.size, this.size)
        }
    }

    checkNeighbours() {
        let living = 0
        this.neighbours.forEach(e => living += e.getAlive());
        if (!this.alive && living == 3 || this.alive && (living == 2 || living == 3)) {
            return true
        }
        return false
    }

    setNeighbours(arr) {
        this.neighbours = arr
    }
}

class Game {
    constructor() {
        this.maze = new Maze(10, 10);
        this.currentLocation = this.maze.start;
    }

    tileClicked(x, y) {
        console.log("this is a test", x, y);
    }
}
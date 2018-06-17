class Game {
    constructor() {
        this.maze = new Maze(mazeWidthX, mazeWidthY);
        this.currentLocation = this.maze.start;
    }

    moveTo(x, y) {
        if(!this.isMoveValid(x, y)){
            throw new Error("Invalid move!");
            return;
        }

        this.currentLocation = {x, y};
    }

    isMoveValid(x, y) {
        if(this.currentLocation.y == y) {
            if( this.currentLocation.x - x == -1) {
                return !this.maze.getCell(this.currentLocation.x, this.currentLocation.y).walls.right;
            } else if (this.currentLocation.x - x == 1) {
                return !this.maze.getCell(this.currentLocation.x, this.currentLocation.y).walls.left;
            } else return false;
        } 

        if(this.currentLocation.x == x) {
            if(this.currentLocation.y - y == -1) {
                return !this.maze.getCell(this.currentLocation.x, this.currentLocation.y).walls.bottom;
            } else if (this.currentLocation.y - y == 1) {
                return !this.maze.getCell(this.currentLocation.x, this.currentLocation.y).walls.top;
            } else return false;
        }

        return false;
    }

    isGameFinished() {
        return this.maze.end.x == this.currentLocation.x && this.maze.end.y == this.currentLocation.y;
    }
}

class Grid {
    constructor(x, y, initVal) {
        this.x = x;
        this.y = y;
        this.array = [];
        for (let i = 0; i<x; i++) {
            this.array[i]= [];
            if(initVal != undefined) {
                for(let j = 0; j < y; j++) {
                    this.array[i][j] = initVal;
                }
            }
        }
    }

    at(x, y) {
        if(this.array[x]) {
            return this.array[x][y];
        } else return undefined;
    }
    
    set(x, y, val) {
        if(x < 0 || y < 0 || x >= this.x || y >= this.y) {
            throw new Error("Grid index out of bounds");
        }
        this.array[x][y] = val;
    }
}

class Maze {
   // x, y — dimensions of maze
   constructor(x, y) {
        this.x = x;
        this.y = y;

        this.start = { 
            x: Math.floor(Math.random()*this.x), 
            y: Math.floor(Math.random()*this.y)
        };

        this.end = {x:0, y:0};

        // two dimensional array of locations of horizontal openings (true means wall is there)
        this.horizontalWalls = new Grid(x, y+1, true);
        
        // two dimensional array of locations of vertical openings (true means wall is there)
        this.verticalWalls = new Grid(x+1, y, true); 

        this.generate();
    }
    
    generate() {
        // n — number of openings to be generated
        let n=this.x*this.y-1;
        if (n<0) {alert("illegal maze dimensions");return;}

        // The current location under construction. 
        let here = this.start;

        let lengthOfPathToEnd = 0;
        let currentLength = 0;

        // history (stack) of locations that might need to be revisited
        let path = [this.start];

        // two dimensional array of locations that have not been visited, padded to avoid
        // need for boundary tests (true means location needs to be visited)
        let unvisited = new Grid(this.x+2, this.y+2, true);
        unvisited.set(here.x, here.y, false);
        for(let i = 0; i < unvisited.x; i++) {
            unvisited.set(i, 0, false);
            unvisited.set(i, unvisited.y-1, false);
        }
        for(let i = 0; i < unvisited.y; i++) {
            unvisited.set(0, i, false);
            unvisited.set(unvisited.x-1, i, false);
        }
        
        while (n > 0) {
            // locations adjacent to here
            let potential = [
                {x:here.x+1, y:here.y}, 
                {x:here.x, y:here.y+1},
                {x:here.x-1, y:here.y}, 
                {x:here.x, y:here.y-1}
            ];    
            
            // unvisited locations adjacent to here
            // Note: to convert path base maze coordinates to unvisited coordinates, add one. 
            let neighbors = [];
            for (let j = 0; j < 4; j++)
                if (unvisited.at(potential[j].x+1, potential[j].y+1))
                    neighbors.push(potential[j]);

            if (neighbors.length > 0) {
                n = n-1;
                let next = neighbors[Math.floor(Math.random()*neighbors.length)];
                unvisited.set(next.x+1, next.y+1, false);
                if (next.x == here.x)
                    this.horizontalWalls.set(next.x, (next.y+here.y+1)/2, false);
                else 
                    this.verticalWalls.set((next.x+here.x+1)/2, next.y, false);
                path.push(next);
                here = next;
                currentLength++;
            } else {
                here = path.pop();
                currentLength--;
            }

            if(currentLength > lengthOfPathToEnd) {
                this.end = here;
                lengthOfPathToEnd = currentLength;
            }
        }
    }
        

    getCell(x, y) {
        return { 
            walls: {
                top: this.horizontalWalls.at(x, y),
                bottom: this.horizontalWalls.at(x, y+1),
                left: this.verticalWalls.at(x, y),
                right: this.verticalWalls. at(x+1, y)
            }
        }
    }

    toString(m) {
        let horizGap = "   ";
        let horizWall = "---";
        let vertWall = "|";
        let vertGap = " ";
        let corner = "+"

        let fullText = []
        for(let line = 0; line < this.y*2+1; line++) {
            let text = [];
            for(let pos = 0;pos < this.x*2+1; pos++) {
                if(line%2 == 0) {
                    // we're on a horizontal wall
                    if(pos % 2 == 0){
                        // we're on a vertical wall, i.e. corner.
                        text.push(corner);
                    } else if(this.getCell(Math.floor(pos/2), Math.floor(line/2)).walls.top){
                        // we're on a horizontal wall
                        text.push(horizWall);
                    } else {
                        // we're on a horizontal gap
                        text.push(horizGap);
                    }
                } else {
                    // were in a lane
                    if(pos % 2 == 1){
                        // we're in a gap.
                        text.push(horizGap);
                    } else if(this.getCell(Math.floor(pos/2), Math.floor(line/2)).walls.left){
                        // we're on a horizontal wall
                        text.push(vertWall);
                    } else {
                        // we're on a horizontal gap
                        text.push(vertGap);
                    }
                }
            }
            fullText.push(text.join('')+'\r\n');

        }
        return fullText.join('');

        // m — maze to be drawn
        // text — lines of text representing maze
        // line — characters of current line
        let textWidth = this.x*4+1;
        let textHeight = this.y*2+1;
        let text= [];
        for (let j = 0; j < textHeight; j++) {
            let line= [];
            if (j % 2 == 0)
                for (let k = 0; k < textWidth; k++)
                    if (k % 4 == 0) 
                        line[k]= '+';
                    else
                        if (j > 0 && !this.verticalWalls.at(Math.floor(k/4), j/2))
                            line[k]= ' ';
                        else
                            line[k]= '-';
            else
                for (let k=0; k<textWidth; k++)
                    if (k % 4 == 0)
                        if (k > 0 && !this.horizontalWalls.at(Math.floor(k/4), j/2))
                            line[k]= ' ';
                        else
                            line[k]= '|';
                    else
                        line[k]= ' ';
            if (j == 0) line[1] = line[2] = line[3]= ' ';
            if (j == this.y*2-1) line[4*this.x]= ' ';
            text.push(line.join('')+'\r\n');
        }
        return text.join('');
    }
}

 

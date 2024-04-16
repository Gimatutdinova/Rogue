var width = 40;
var height = 24;
var max_health = 10;
var fieldClass = document.querySelector('.field');

function Players(x, y, role) {
    this.x = x;
    this.y = y;
    this.health = max_health;
    this.power = 1;
    this.role = role;
}

function Game() {
    this.field = new Array(height);
    for (var i = 0; i < 24; i++) this.field[i] = new Array(width);
    this.freeCell = new Object;
    this.enemies = new Array(10);
    this.qtyEnemies = 10;
    this.end = '';

    this.init = function () {
        fillField(0, height, 0, width, 'tileW');
        getRoomsAndLines(randomInteger(3, 5), 'vertical');
        getRoomsAndLines(randomInteger(3, 5), 'horison');
        getRoomsAndLines(randomInteger(5, 10), 'room');
        setElements('tileE', 10);
        setElements('tileP', 1);
        setElements('tileHP', 10);
        setElements('tileSW', 2);
        window.addEventListener("keydown", pressCheck);
        printField();
    }
    this.reprint = function () {
        deleteField();
        printField();
    }
    this.endGame = function (text) {
        deleteField();
        fieldClass.insertAdjacentHTML("beforeend", "<p class='end'>The end!</br>You have ".concat(text, "</br>Press Enter to restart</p"));
        window.removeEventListener("keydown", pressCheck);
        window.addEventListener("keydown", pressEnter);
    }
}

var game = new Game();
game.init();

function pressCheck(event) {
    var press = 1;
    switch (event.key) {
        case 'w':
        case 'W':
        case 'ц':
        case 'Ц':
            movePlayers(game.player, 'x', -1);
            break;
        case 'a':
        case 'A':
        case 'ф':
        case 'Ф':
            movePlayers(game.player, 'y', -1);
            break;
        case 's':
        case 'S':
        case 'ы':
        case 'Ы':
            movePlayers(game.player, 'x', 1);
            break;
        case 'd':
        case 'D':
        case 'в':
        case 'В':
            movePlayers(game.player, 'y', 1);
            break;
        case ' ':
            game.end = attack();
            break;
        default:
            press = 0;
            break;
    }
    if (press && !game.end) game.end = moveEnemies(event.key);
    game.end ? game.endGame(game.end) : game.reprint();
}

function pressEnter(event) {
    switch (event.key) {
        case 'Enter':
            location.reload();
            break;
    }
}

// заполнение поля
function fillField(top_y, bottom_y, left_x, right_x, sym) {
    for (var i = top_y; i < bottom_y; i++) {
        for (var j = left_x; j < right_x; j++) {
            game.field[i][j] = sym;
            if (sym === 'tile') {
                if (!game.freeCell.hasOwnProperty(i)) {
                    game.freeCell[i] = [j];
                } else
                    addUniqElToArr(game.freeCell[i], j);
            }
        }
    }
}

// получение комнат и проходов
function getRoomsAndLines(num, element) {
    var height_el = 0,
        width_el = 0,
        top_y = 0,
        left_x = 0;
    for (var i = 0; i < num; i++) {
        if (element === 'room') {
            var freeCell = 0;
            while (!freeCell) {
                height_el = randomInteger(3, 8);
                width_el = randomInteger(3, 8);
                top_y = randomInteger(0, height - height_el);
                left_x = randomInteger(0, width - width_el);
                freeCell = nearFreeCell(top_y, top_y + height_el, left_x, left_x + width_el);
            }
        } else {
            height_el = element === 'vertical' ? height : 1;
            width_el = element === 'horison' ? width : 1;
            if (element === 'vertical')
                left_x = randomInteger(0, width - width_el);
            else
                top_y = randomInteger(0, height - height_el);
        }
        fillField(top_y, top_y + height_el, left_x, left_x + width_el, 'tile')
    }
}

// добавление элементов (героя, противников, здоровья, мечей)
function setElements(element, count) {
    for (var i = 0; i < count; i++) {
        var x = randomInteger(0, height - 1);
        var y = randomInteger(0, game.freeCell[x].length - 1);
        game.field[x][game.freeCell[x][y]] = element;
        if (element === 'tileP') game.player = new Players(x, game.freeCell[x][y], 'tileP');
        else if (element === 'tileE') {
            game.enemies[i] = new Players(x, game.freeCell[x][y], 'tileE' + i);
            game.field[x][game.freeCell[x][y]] += i;
        }
        game.freeCell[x].splice(y, 1);
    }
}

// отрисовка поля
function printField() {
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (game.field[i][j] === 'tileP') {
                fieldClass.insertAdjacentHTML("beforeend", "<div class='tile tileP' ><div class=health style=\"width:".concat(game.player.health * 100 / max_health, "%\"></div></div>"));
            } else if (game.field[i][j].slice(0, -1) === 'tileE') {
                fieldClass.insertAdjacentHTML("beforeend", "<div class='tile tileE' id=".concat(game.field[i][j].slice(-1), "><div class=health style=\"width:").concat(game.enemies[game.field[i][j].slice(-1)].health * 100 / max_health, "%\"></div></div>"));
            } else fieldClass.insertAdjacentHTML("beforeend", "<div class=\"tile ".concat(game.field[i][j], "\"></div>"));
        }
    }
}

// удаление поля
function deleteField() {
    fieldClass.innerHTML = '';
}

// передвижение противников
function moveEnemies(key) {
    var end_game = '';
    for (var i = 0; i < game.enemies.length && !end_game; i++) {
        if (game.enemies[i].health > 0) {
            if (playerNearEnemy(game.enemies[i])) {
                if (key != ' ') game.player.health -= game.enemies[i].power;
                if (checkHealt(game.player)) end_game = 'lost';
            }
            else {
                var count = 0, line = randomInteger(0, 1), num = randomInteger(0, 1);
                while (!movePlayers(game.enemies[i], line ? 'x' : 'y', num ? 1 : -1) && ++count < 5)
                    (count % 2 === 0) ? line = (++line) === 2 ? 0 : 1 : num = (++num) === 2 ? 0 : 1;
            }
        }
    }
    return end_game;
}

// передвижение игроков
function movePlayers(player, line, num) {
    var res = 1;
    if ((line === 'x' && (player.x > 0 || (player.x === 0 && num === 1)) && (player.x < height - 1 || (player.x === height - 1) && num === -1))) {
        if (game.field[player.x + num][player.y] === 'tile')
            moveOnFreeCell(player, line, num);
        else if (game.field[player.x + num][player.y].slice(0, -1) != 'tileE' && game.field[player.x + num][player.y] != 'tileW') {
            addProp(player, game.field[player.x + num][player.y]);
            moveOnFreeCell(player, line, num);
        } else res = 0;
    } else if (line === 'y' && (player.y > 0 || (player.y === 0 && num === 1)) && (player.y < width - 1 || (player.y === width - 1 && num === -1))) {
        if (game.field[player.x][player.y + num] === 'tile') {
            moveOnFreeCell(player, line, num);
        } else if (game.field[player.x][player.y + num].slice(0, -1) != 'tileE' && game.field[player.x][player.y + num] != 'tileW') {
            addProp(player, game.field[player.x][player.y + num]);
            moveOnFreeCell(player, line, num);
        } else res = 0;
    }
    return res;
}

// перестановка игроков на свободные клетки
function moveOnFreeCell(player, line, num) {
    game.field[player.x][player.y] = 'tile';
    player[line] += num;
    game.field[player.x][player.y] = player.role;
}

// получение здоровья или силы
function addProp(player, cell) {
    if (cell === 'tileHP') {
        if (player.health < max_health) player.health++;
    } else
        player.power++;
}

// атака противников
function attack() {
    for (var i = 0; i < game.enemies.length; i++) {
        if (game.enemies[i].health > 0 && playerNearEnemy(game.enemies[i])) {
            game.enemies[i].health -= game.player.power;
            if (checkHealt(game.enemies[i]) && game.qtyEnemies === 0)
                return 'won';
        }
    }
    return '';
}

// проверка наличия противника рядом с игроком
function playerNearEnemy(enemy) {
    var x = Math.abs(enemy.x - game.player.x),
        y = Math.abs(enemy.y - game.player.y);
    return ((x === 0 && y === 1) || (x === 1 && y === 0));
}

// проверка остатка здоровья
function checkHealt(player) {
    if (player.health <= 0) {
        game.field[player.x][player.y] = 'tile';
        player.x = -1;
        player.y = -1;
        game.qtyEnemies--;
        return 1;
    }
    return 0;
}

// функция для педотвращения создания недостижимых зон
function nearFreeCell(top, bottom, left, right) {
    var res = 0;
    for (var i = top; i < bottom && !res; i++)
        if ((left != 0 && game.field[i][left - 1] === 'tile') || (right != width && game.field[i][right] === 'tile')) res = 1;
    for (var i = left; i < right && !res; i++)
        if ((top != 0 && game.field[top - 1][i] === 'tile') || (bottom != height && game.field[bottom][i] === 'tile')) res = 1;
    return res;
}

// добавление уникального элемента в отсортированный массив
function addUniqElToArr(arr, num) {
    var index = binarySearch(arr, num);
    if (index != -1) arr.splice(index, 0, num);
}

function binarySearch(arr, num) {
    let start = 0, end = arr.length - 1;
    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        if (arr[mid] === num) {
            return -1;
        } else if (num < arr[mid]) {
            end = mid - 1;
        } else {
            start = mid + 1;
        }
    }
    return start;
}

// получение рандомного числа от min до max
function randomInteger(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}
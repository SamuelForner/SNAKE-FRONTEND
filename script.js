//1) Liaison avec le script.js dans le fichier html

//Nous différencions les différents acteurs du code, et nous allons créer des constructeur pour chacun d'entre eux
//Les acteurs : 3 variables globales (à utiliser partout)
var snake; //Le serpent
var apple; // la Pomme
var snakeGame; // Le jeu en lui même

window.onload = function () //Point de départ du jeu function JS window.onload est une fonction qui se lance quand la page se charge
{
    snakeGame = new SnakeGame(900, 600, 30, 100); // cf le constructeur SnakeGame ci dessous, canvaswidth, height, blocksize, delay
    snake = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right"); //cf le constructeur Snake ci dessous //La tête est le premier élement, ici 6,4 // right correspond au parametre direction voir function snake
    apple = new Apple([10, 10]); // Cf constructeur Apple ci dessous //selon le prototype de la pomme, nous n'avons qu'un argument , un bloc pour la pomme
    snakeGame.init(snake, apple); // On initialise le jeu avec les arguments construit ci dessus
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

document.onkeydown = function handleKeyDown(e)//onkeydown = quand l'utilisateur clique sur une touche du clavier///faire en sorte que la direction du serpent change enfonction de ce qu'à cliqué l'utilisateur (fleche)
{
    var key = e.keyCode; // pour avoir le code de la fleche qui a été touché
    var newDirection;
    switch (key) {
        //Les numéros sont des normes du clavier//32 correspond a la touche espace 
        case 37:
            newDirection = "left";
            break;
        case 38:
            newDirection = "up";
            break;
        case 39:
            newDirection = "right";
            break;
        case 40:
            newDirection = "down";
            break;
        case 32:
            //Lors de l'appuie sur espace, on recréera donc le snake et la pomme et on réinitialisera le jeu avec ce serpent et cette pomme
            snake = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
            apple = new Apple([10, 10]);
            snakeGame.init(snake, apple);
            return;
        default:
            return; // si le code retourné n'est ni 37,38,.. alors par défaut on return simplement
    }
    snakeGame.snake.setDirection(newDirection);

};

///////////////////////////3 fonctions constructeurs//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////Fonction constructrice du jeu avec les paramètre pour se construire // représente le jeu dans sa totalité avec des propriétés et méthode////////////
function SnakeGame(canvasWidth, canvasHeight, blockSize, delay) 
{
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.border = "30px solid gray";
    this.canvas.style.margin = "50px auto"; // marge de 50px en haut et en bas
    this.canvas.style.display = "block";
    this.canvas.style.backgroundColor = "#ddd";
    document.body.appendChild(this.canvas);//Pour attacher le canvas à la page HMTL
    this.ctx = this.canvas.getContext('2d') // nous allons dissiner en 2d;
    this.blockSize = blockSize;
    this.delay = delay; // délai d'1000 milliseconde
    this.snake;
    this.apple;
    this.widthInBlocks = canvasWidth / blockSize; // largeur en terme de bloc soit ici 30 (900/30)
    this.heightInBlocks = canvasHeight / blockSize; //hauteur en terme de bloc 20 (600/30)
    this.score; //intialiser dans canvas et dans la fonction restart (quand on relance le jeu on relance à 0) et incrémentation dans refreshcanvas quand on a mangé la pomme
    var instance = this; //quand j'utiliserai instance, je parlerais du jeu en lui même (this)
    var timeout;

    //Méthodes du jeu

    this.init = function (snake, apple) // la fonction recoit un serpent et initialise le serpent et la pomme du jeu
    {
        this.snake = snake; // Elle prend la propriété snake et donne ce qu'elle recoit comme argument
        this.apple = apple;
        this.score = 0;
        clearTimeout(timeout);
        refreshCanvas(); // pour appeler la fonction refresh canvas
    };

    var refreshCanvas = function () 
    {
        //Pour raffraichir le canvas (qui bougera a chaque intervalle
        //Pour dessiner dans le canvas nous utilisons le contexte
        // xCoord += 5; //(revient à écrire xCoord = xCoord+2)
        // yCoord +=5; 
        instance.snake.advance();//Appel de la fonction avance pour faire avancer
        if (instance.checkCollision()) // d'abord je le fais avancer, ensuite je vérifie si ca a donné une collision
        {
            //GAME OVER
            instance.gameOver();
        } else //si il n'y a pas eu de collision, tu pourras continuer de dessiner apple & snake et mettre à jour le canvas
        {
            if (instance.snake.isEatingApple(instance.apple)) //nous vérifions si le serpent à manger ou non la pomme
            {
                // Le serpent à manger la pomme
                instance.score++;
                instance.snake.ateApple = true;
                do {
                    //Nouvelle position de la pomme
                    instance.apple.setNewPosition(instance.widthInBlocks, instance.heightInBlocks);
                }
                while (instance.apple.isOnSnake(instance.snake)) //vérifie mtn si la nouvelle position donnée à la pomme est sur le serpent snakee//si elle est sur le snake, cela renvoie une nouvelle position
            }
            instance.ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height); // a chaque fois que nous lancons la function , on veut effacer l'ancienne position (le serpent bouge toute les 1 sec)
            //appel de la fonction Dessin du serpent, de la pomme et du score(l'odre est important pour le style = le serpent et la pomme sont dessiné sur le score)
            instance.drawScore();
            instance.snake.draw(instance.ctx, instance.blockSize);
            instance.apple.draw(instance.ctx, instance.blockSize);//A chaque fois que l'on va refresh le canvas, on veut que la pomme reste dessinée
            timeout = setTimeout(refreshCanvas, delay);//Exécute moi la fonction refresh canvas à chaque délais cent milliseconde 
        }
    };

    this.checkCollision = function ()
    //deux raisons de perdre, sortir du canvas ou se manger soit même
    {
        var wallCollision = false; //premiere vérification, collision avec le mur, initialisé à false
        var snakeCollision = false; //Deuxieme, est ce que le serpent est passé sur son propre corps 
        var head = this.snake.body[0]; // c'est la tête du serpent avec laquelle on vérifie la collision car elle est en premier // c'est le premier element du body du serpent [0]
        var rest = this.snake.body.slice(1); // correspond à tout le corps du serpent sans la tête// ici le serpent en entier = ([[6, 4], [5, 4], [4, 4]]; on enleverait donc juste la tête il resterait que le corps soit ([5, 4], [4, 4]]
        var snakeX = head[0];//determination du x et y de la tête/coordonée de sa tête// dans notre cas ([[6, 4], [5, 4], [4, 4]] la tête est egal a [x=6, y=4]
        var snakeY = head[1];//determination du x et y de la tête/coordonée de sa tête// dans notre cas ([[6, 4], [5, 4], [4, 4]] la tête est egal a [x=6, y=4]
        var minX = 0;
        var minY = 0;
        //Rappel, le canvas est un rectangle (ou carré) avec un axe des abscisse et ordonnée maximum
        var maxX = this.widthInBlocks - 1; // correspond à l'abcisse max du canvas exemple si 30 block, 30-1
        var maxY = this.heightInBlocks - 1; // correspond à l'ordonnée max du canvas exemple si 19 block, 19 - 1
        var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;//Est ce que la tête est comprise dans l'axe horizontal du canvas (abscisse) sans depassé par la gauche ou la droite?   
        var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;//idem, avec l'axe des ordonnées
        if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
        //si je ne suis pas dans le canvas donc je suis sorti du canvas,il y a collision (initialisé à false initialement)
        {
            wallCollision = true;
        }
        //Après vérif avec collision sur mur, verif si pas de collision sur lui même(tête touche le corps)
        //Vérif si la tête du serpent est égal a l'un des élément du reste du corps, enregistré ci dessus var rest
        for (var i = 0; i < rest.length; i++) //rest.length car je veux vérifier chacun des élement restant du corps 
        {
            if (snakeX === rest[i][0] && snakeY === rest[i][1]) //si le x et le y de la tête est égal au x et au y de n'importe quelle partie du corps
            {
                snakeCollision = true; // intialisement initié à false // serpent se mange lui même
            }
        }
        return wallCollision || /*|| =ou bien*/ snakeCollision; // la fonction nous retourne si on a un wallcollision ou le seprent se mange lui même  
        // la fonction checkcollision est à mettre dans refreshcanvas
    };



    this.gameOver = function ()  //Création de la fonction game over
    {
        //On veut qu'à chaque fois qu'on perd, il y ait écrit à l'écran game Over
        this.ctx.save(); //Nous enregistrons les parametres du canvas (couleur, remplissage, etc...)
        this.ctx.font = "bold 70px sans-serif"; //ecriture en gras
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.strokeStyle = "white"; // bordure du texte
        this.ctx.lineWidth = 5;
        var centreX = this.canvas.width / 2;//Determination du centre du canvas
        var centreY = this.canvas.height / 2;//Determination du centre du canvas
        this.ctx.strokeText("Game Over", centreX, centreY - 180);
        this.ctx.fillText("Game Over", centreX, centreY - 180); // nous affichons game over à l'emplace x=millieu de l'absisse, y= millieu - 180 px pour êtrr un peu plus haut
        this.ctx.font = "bold 30px sans-serif";
        this.ctx.strokeText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
        this.ctx.fillText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120); //Voir fonction onkeydown pour le choix de l'action du bouton espace 
        this.ctx.restore(); // et nous le faisons réapparaître
    };

    this.drawScore = function ()  //Création d'une fonction pour afficher le score à l'écran// a mettre dans refreshcanvas 
    {
        //On veut qu'à chaque fois qu'mange une pomme; cela soit écrit à l'écran score +1
        this.ctx.save(); //Nous enregistrons les parametres du canvas (couleur, remplissage, etc...)
        this.ctx.font = "bold 200px sans-serif"; //ecriture en gras
        this.ctx.fillStyle = "gray";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        //Nous voulons mettre le score au millieu du canvas, 
        var centreX = this.canvas.width / 2;//Determination du centre du canvas
        var centreY = this.canvas.height / 2;//Determination du centre du canvas
        this.ctx.fillText(this.score.toString(), centreX, centreY); // nous affichons le score en string car c'est un nombre, x=5 et y à la hauteur total - 5
        this.ctx.restore(); // et nous le faisons réapparaître 
    };


};

////////////////////////Creation du prototype du serpent avec comme parametre le corps du serpent et sa direction que l'on souhaite avec les fleches constitué de propriété et méthode//////
function Snake(body, direction) 
{
    this.body = body; //corps du serpent
    this.direction = direction;
    this.ateApple = false;//Rajout d'une propriété pour savoir si le serpent à manger une pomme//initié à false//a mettre dans le canvas, situation si mangé la pomme
    this.draw = function (ctx, blockSize) //Dessin du serpent
    {
        ctx.save(); // sauvegarder le context du canvas avant la fonction
        ctx.fillStyle = "#ff0000";
        //Chaque bloc du serpent aura un x et un y, et le serpent sera composé de plusieurs bloc , nous créerons donc un tableau d'objet [[5,3],[6,3]]
        for (var i = 0; i < this.body.length; i++) {
            // drawBlock(ctx, this.body[i]);
            var x = this.body[i][0] * blockSize; //la taille d'un bloc est estimé à 30 PIXEL; la position sera par exemple x=4, 4x30; y=3; 3x30
            var y = this.body[i][1] * blockSize; // 1 ere position dans l'array
            ctx.fillRect(x, y, blockSize, blockSize);
        }
        ctx.restore();


    };
    //Pour faire avancer le serpent, création d'une nouvelle fonction
    //L'idée est donc de faire avancer la tête du serpent d'une case, et donc de supprimer sa queue [xx==>xx] [xxx==>x]
    this.advance = function () 
    {
        var nextPosition = this.body[0].slice(); // Récupération de la tête, et copie de la tête (slice)
        // nextPosition[0] +=1 ; //Avancé la tête de un donc du x+1  [[x,y]]
        switch (this.direction) //Direction en fonction de l'utilisation des fleches
        {
            case "left":
                nextPosition[0] -= 1; //Avancé la tête de un à gauche donc du x-1  [[x,y]]
                break;
            case "right":
                nextPosition[0] += 1; //Avancé la tête de un à droite donc du x+1  [[x,y]]
                break;
            case "down":
                nextPosition[1] += 1 //Avancé la tête en bas donc du y+1  [[x,y]]
                break;
            case "up":
                nextPosition[1] -= 1; // Avancé la tête en haut donc du y-1 [[x,y]]
                break;
            default:
                throw ("Invalid direction"); // throw est une fonction qui permet d'afficher un message d'erreur
        }
        this.body.unshift(nextPosition); // grace à unshift,nous allons rajouter nextposition dans l'array soit ([[7,4],[6,4], [5,4], [4,4]])
        if (!this.ateApple) // Si le serpent à manger une pomme est à true, nous ne ferons pas la fonction pop qui supprime le dernier bloc du serpent
            this.body.pop(); // suppression derniere element du array avec fonction pop soit ([[7,4],[6,4], [5,4]]) quand le serpent n'a pas mangé la pomme
        else {
            //nous devons éteindre ateApple dans lequel il était à true pour ne lui rajouter un bloc juste quand il mange le bloc de pomme
            this.ateApple = false;
        }
    };

    this.setDirection = function (newDirection) 
    {
        var allowedDirection;
        switch (this.direction) {
            case "left":
            case "right":
                allowedDirection = ["up", "down"]; // Si mes directions actuelles sont vers la gauche ou vers la droite, je ne peux qu'aller en haut ou en bas
                break;
            case "down":
            case "up":
                allowedDirection = ["left", "right"]; // Si mes directions actuelles sont vers le haut ou le bas, je ne peux qu'aller à droite ou à gauche
                break;
            default:
                throw ("Invalid direction"); // Si mes directions ne sont ni left right up down, par défault j'ai une erreur

        }
        if (allowedDirection.indexOf(newDirection) > -1)
        //AllowDirection est un array soit [up, down] soit [left right] les positions sont donc 0 ou 1 des up down right left ds le tableau
        //Si l'index de allow direction > -1, cela veut dire que l'on a bien selectionné une direction up down right ou left
        //si l'index est à -1, nous n'avons selectionné aucune direction valable 
        {
            this.direction = newDirection
        };

    };
    //création de méthode afin que le serpent ne puisse pas sortir du canvas, et qu'il ne puisse pas se manger lui même (game over)

    //Mise en place d'une fonction pour manger une pomme
    this.isEatingApple = function (appleToEat) 
    {
        var head = this.body[0]; //rappel : this.body[0] = au x et y de la tête// c'est tj la tête qui se prend les collisions et les pommes
        if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) //head[0] = x et head[1] = y
        {
            return true
        } else {
            false //le serpent n'a pas mangé la pomme
        }
    }; // la fonction est à mettre dans refreshCanvas

};

//////////////////////////Creation de la fonction prototype(constructeur) apple pour créer une pomme à manger pour le serpent//////
function Apple(position)
// La pomme a besoin d'une position, d'un block dans le canvas, la fonction aura donc pour seul argument la position
{
    this.position = position; // propriété de la position par l'argument
    this.draw = function (ctx, blockSize) 
    {
        //Context de la pomme
        ctx.save(); // Les anciennes configuration du canvas sont enregistrés, sans cela tout serait en vert ?
        ctx.fillStyle = "#33cc33"; // la pomme sera verte
        ctx.beginPath();
        //Pour créer la pomme en rond nous avons besoin de calculer son rayon
        var radius = blockSize / 2; // Le rayon de la pomme est tout simplement égal à la moitié d'un block du canvas (rappel, imaginer le canvas quadrillé)
        //Je vais avoir besoin de calculer le millieu de la cellule contenant la pomme
        var x = this.position[0] * blockSize + radius; //rappel le x est en index 1 
        var y = this.position[1] * blockSize + radius; // rappel le y est en position 2 
        ctx.arc(x, y, radius, 0, Math.PI * 2, true); // Méthode pour dessiner le cercle à l'écran
        ctx.fill();
        ctx.restore();// Les anciennes configuration du canvas sont enregistrés, sans cela tout serait en vert ?
    };
    
    this.setNewPosition = function (widthInBlocks, heightInBlocks) //Nouvelle position de la pomme si ladernière a été mangée
    {
        //Nous voulons une pomme qui se situe avec un x compris entre 0 et 29, et un y compris entre 0 et 19
        var newX = Math.round(Math.random() * (widthInBlocks - 1)); //Math.round(pour arrondir)((math random = chiffre aléatoire entre 0et 1) * (nombre de block dans la largeur(30block) -1)) 
        var newY = Math.round(Math.random() * (heightInBlocks - 1)); // idem pour le y, situé entre 0 et 19
        this.position = [newX, newY]; // nous réatribuons la nouvelle position de la pomme
    }; // a mettre dans le canvas
    
    this.isOnSnake = function (snakeToCheck)//verif pour savoir si la new pomme apparait sur le serpent//
    {
        var isOnSnake = false; // Initialisé à "la pomme n'est pas sur le serpent"
        //Boucle pour passer sur chacun des blocs constituant le serpent
        for (var i = 0; i < snakeToCheck.body.length; i++) { //PROBLEME QUAND TROP DE POMME MANGE
            if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) // Est ce que le x et le y de la pomme est sur un bloc du serpent ? le i passe sur chacun des bloc du snake 
            {
                isOnSnake = true; //Si le x et le y de la new pomme correspond au x et y d'un des bloc du serpent
            }
        }
        return isOnSnake; // si le x et le y de la new pomme ne correspond pas au x et au y de l'un des bloc du snake
    };//a mettre dans le canvas 
};








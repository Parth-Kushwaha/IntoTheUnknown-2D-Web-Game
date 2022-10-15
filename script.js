

// load event will start when all resources like
// stylesheets and images are downloaded
window.addEventListener('load', function(){
    
    //canvas setup
    const canvas=this.document.getElementById("canvas1");
    const ctx= canvas.getContext('2d');
    canvas.width=1500;
    canvas.height=500;

    // using classes(its just prototype based inheritance)
    // encapsulation- bundling of data with restriction
    // will handle the input ie the arrow keys for movement

    
    class InputHandler{
        constructor(game){

            this.game=game;

            window.addEventListener('keydown', e => {
                // when up arrow is pressed 
                if(  ((e.key==='ArrowUp')  ||
                      (e.key==='ArrowDown'))   
                && this.game.keys.indexOf(e.key) ===-1){
                    this.game.keys.push(e.key);
                } else if(e.key === ' '){
                    this.game.player.shootTop();
                } else if(e.key ==='d'){
                    this.game.debug= !this.game.debug;
                } else if(e.key==='m'){
                    this.game.pause=!this.game.pause;
                } else if(e.key==='x'){
                    location.reload()
                } 
            });

            //when downward key is pressed
            window.addEventListener('keyup', e=>{
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1);
                }
                
            });
        }
    }

    // will handle player lasers/bullets
    class Projectile{
        constructor(game,x,y){
            this.game=game;
            this.x=x;
            this.y=y;
            this.width= 10;
            this.height=3;
            this.speed=3;
            this.markedForDeletion= false;
            this.image = document.getElementById('projectile')

        }
        update(){
            this.x+=this.speed;

            // this will delete the charcters when they move across the game area
            if(this.x > this.game.width * 0.8) this.markedForDeletion= true;
        }

        draw(context){
           context.drawImage(this.image, this.x, this.y);
        }

    }

    // will handle bolts/screws that come from damaged enemies
    class Particle{
        constructor(game,x,y){
            this.game=game;
            this.x=x;
            this.y=y;
            this.image=document.getElementById("gears");
            this.frameX= Math.floor(Math.random()* 3); // point toward a random row element
            this.frameY=Math.floor(Math.random() * 3); // point towards a random coloumn element
            // together, they will point towards a specific image in the sprite sheet
            this.spriteSize=50; // image size
            this.sizeModifier= (Math.random() *0.5 + 0.5).toFixed(1);// random size of the image
            this.size= this.spriteSize * this.sizeModifier; // making sure that the image size is random
            this.speedX= Math.random()  * 6 -3; // random horizontal direction of falling of gear
            this.speedY= Math.random()  * -15; // gear will move upwards 
            this.gravity=0.5;                  // to pull the particle down
            this.markedForDeletion=false;
            this.angle=0;                    // for rotation, we will change angles
            this.va=Math.random() * 0.2-0.1; // va= velocity of angle
                                             // rotation speed will be a random value bw -0.1 and 0.1 radians per animation frames
            
            this.bounced=0; // for bouncing the particle off the floor
            this.bottomBounceBoundary=Math.random() * 80 + 60;
        }

        update(){
            this.angle+=this.va; // will change angles
            this.speedY+=this.gravity;// this will give the particle a nice curve,as the particle will first move upwards due to -15
                                     // as gravity increase, -15 will go close to zero, when 0 it willl stop moving
                                     // when the value of gravity goes +ve, the particle will start falling downwards and will dissapears
            this.x -= this.speedX;   // to move horizontally
            this.y += this.speedY + this.game.speed;   // to move vertically

            // if the particle fells off canvas vertically or if the particle move out horizontally, we set marked for deleteion to true
            if(this.y > this.game.height + this.size || this.x < 0 - this.size){
                this.markedForDeletion=true;
            }

            // for bouncing the particle when it reaches the bottomBounceBoundary
            if(this.y > this.game.height - this.bottomBounceBoundary && this.bounced< 2){
                this.bounced++;
                this.speedY *= -0.7; // so that it bounces in the opposite direction of falling ie upwards
            }
        }

        draw(context){
            context.save();
            context.translate(this.x, this.y); // moves rotation center point from top left to the particle position
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, 
                this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size,this.size);
            context.restore()
        }

    }

    // control main character
    class Player{
        constructor(game){
            this.game= game;
            this.width=120;   // starting width of character
            this.height=190;  // starting height of character
            this.x=20;        //horizontal position of player in start
            this.y=100;       // vertical postion
            this.speedY=0;    // vertical movement
            this.maxSpeed=3;  // speed
            this.projectiles=[]; // projectile array
            this.frameX=0;
            this.frameY=0;
            this.maxFrame=37;
            this.image= document.getElementById("player");
            this.powerUp= false;
            this.powerUpTimer=0;
            this.powerUpLimit=10000;
        }
        // updating for movement and updating it
        update(deltaTime){
            if(this.game.keys.includes('ArrowUp')) this.speedY= -this.maxSpeed;
            else if(this.game.keys.includes('ArrowDown')) this.speedY=this.maxSpeed;
            else this.speedY=0;
            this.y += this.speedY      // move veritcal 

            //vertical boundaries
            if(this.y > this.game.height - this.height * 0.5){ 
                this.y= this.game.height - this.height * 0.5;
            } else if(this.y < -this.height * 0.5){
                this.y= -this.height * 0.5;
            }

            // handle projectile
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            // will filter out all the elements marked true for markedForDeletion
            this.projectiles=this.projectiles.filter(projectile => !projectile.markedForDeletion);

            // sprite animation
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX=0;

            //power up condition
            if(this.powerUp){
                if(this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer=0;
                    this.powerUp=false;
                    this.frameY=0;
                } else{
                    this.powerUpTimer += deltaTime;
                    this.frameY=1;
                    this.game.ammo += 0.1;
                }

            }
        }

        // to draw graphics of player
        draw(context){
            if(this.game.debug)context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            context.drawImage(this.image, this.frameX * this.width,this.frameY * this.height, this.width, this.height,this.x, this.y, this.width, this.height);
        }

        // adding projectile, laser will come out from the mouth of our character
        shootTop(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x+80, this.y+30));
                
                this.game.ammo--;
            }
            if(this.powerUp){this.shootBottom();}
            
        }

        shootBottom(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x+80, this.y+175));
              
                this.game.ammo--;
            }
        }

        //power up method
        enterPowerUp(){
            this.powerUpTimer=0;
            this.powerUp=true;
            if(this.game.ammo < this.game.maxAmmo) this.game.ammo=  this.game.maxAmmo;
        }
    }

    // handles blueprint of many different enemy types
    class Enemy{                  // parent enemy class
        constructor(game){
            this.game=game;
            this.x=this.game.width;
            this.speedX= Math.random() * -1.5 - 0.5;// random speed of enemy in the direction from right to left
            this.markedForDeletion= false;
            
            this.frameX=0;
            this.frameY=0;
            this.maxFrame=37;
        }

        update(){
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0){this.markedForDeletion=true;}
            if(this.frameX < this.maxFrame) {this.frameX ++;}
            else{this.frameX=0;}
        }

        draw(context){
            
            if(this.game.debug) {context.strokeRect(this.x, this.y, this.width, this.height);}
            context.drawImage(this.image,this.frameX * this.width, this.frameY * this.height,this.width,this.height, this.x, this.y, this.width, this.height);
            if(this.game.debug) {
                context.font= '20px Bangers';
                context.fillText(this.lives, this.x, this.y);  
            }
             
        }

    }

    class Angler1 extends Enemy{          // child class 
        constructor(game){
            super(game);                 // super is a special keyword which will inherit the properties of parent class constructor 
            this.width=228;              // it will basically combine both the constructors in child class.
            this.height=169;   
            this.y= Math.random() * (this.game.height* 0.95 - this.height)    
            
            this.image= document.getElementById("angler1");
            this.frameY= Math.floor(Math.random()*3);
            this.lives=3;
            this.score=this.lives;
        }
    }

    class Angler2 extends Enemy{          // child class 
        constructor(game){
            super(game);                 // super is a special keyword which will inherit the properties of parent class constructor 
            this.width=213;              // it will basically combine both the constructors in child class.
            this.height=165;   
            this.y= Math.random() * (this.game.height* 0.95 - this.height)    
            
            this.image= document.getElementById("angler2");
            this.frameY= Math.floor(Math.random()*2);
            this.lives=3;
            this.score=this.lives;
        }
    }

    class LuckyFish extends Enemy{          // child class 
        constructor(game){
            super(game);                 // super is a special keyword which will inherit the properties of parent class constructor 
            this.width=99;              // it will basically combine both the constructors in child class.
            this.height=95;   
            this.y= Math.random() * (this.game.height* 0.95 - this.height)    
            
            this.image= document.getElementById("lucky");
            this.frameY= Math.floor(Math.random()*2);
            this.lives=5;
            this.score=15;
            this.type= "lucky";
        }
    }

    class HiveHhale extends Enemy{          // child class 
        constructor(game){
            super(game);                 // super is a special keyword which will inherit the properties of parent class constructor 
            this.width=400;              // it will basically combine both the constructors in child class.
            this.height=227;   
            this.y= Math.random() * (this.game.height* 0.95 - this.height)    
            
            this.image= document.getElementById("hivewhale");
            this.frameY= 0;// because the sprite sheet has 1 animation row
            this.lives=20;
            this.score=10;
            this.type= "hive";
            this.speedX=Math.random() * -1.2- 0.2;
        }
    }

    class Drone extends Enemy{          // child class 
        constructor(game,x,y){
            super(game);                 // super is a special keyword which will inherit the properties of parent class constructor 
            this.width=115;              // it will basically combine both the constructors in child class.
            this.height=95;
            this.x=x;   
            this.y= y;    
            
            this.image= document.getElementById("drone");
            this.frameY= Math.floor(Math.random() * 2); // because the sprite sheet has 2 animation row
            this.lives=1;
            this.score=1;
            this.type= "drone";
            this.speedX=Math.random() * -4.2- 0.7; // fast movement
        }
    }

    // explosion, parent class
    class Explosion{
        constructor(game,x,y){
            this.game=game;
            this.x=x;
            this.y=y;
            this.frameX=0;
            this.spriteHeight=200;
            this.spriteWidth=200;
            this.spriteWidth=200;
            this.width=this.spriteWidth;
            this.height=this.spriteHeight;
            this.x=x - this.width * 0.5;
            this.y=y - this.height * 0.5
            this.fps=15;
            this.timer=0;
            this.markedForDeletion=false;
            this.interval=1000/this.fps;
            this.maxFrame=8;
        }

        update(deltaTime){
            this.x-=this.game.speed;
            if(this.timer > this.interval){
                this.frameX++;
                this.timer=0;
            } else{this.timer +=deltaTime;}
            
            if(this.frameX> this.maxFrame) this.markedForDeletion=true;
        }

        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteWidth, this.x, this.y, this.width, this.height);
        }

    }

    class SmokeExplosion extends Explosion{
        constructor(game,x,y){
            super(game,x,y);
            this.image=document.getElementById("smokeExplosion");
        }
    }
    class FireExplosion extends Explosion{
        constructor(game,x,y){
            super(game,x,y);
            this.image=document.getElementById("fireExplosion");
        }
    }

    // score/timer/ pother info
    class UI{
        constructor(game){
            this.game=game;
            this.color='white'; 
        }
        
        draw(context){
            context.save();
            context.fillStyle= this.color;
            context.shadowOffSetX=2;
            context.shadowOffSetY=2;
            context.shadowColor='black';
            context.font= "30px Bangers";

            //score bar
            context.fillText('Score: ' + this.game.score, 20,40);

            // timer bar
            context.fillText("Timer: " + (this.game.gameTime * 0.001).toFixed(1), 20, 100);
            
            
            // game over messages
            if(this.game.gameOver){
                context.textAlign='center';
                let message1;
                let message2;
                if(this.game.score > this.game.winningScore){ // comparing the game with the maximum score limit
                    message1="Most Wondrous!";
                    message2="Well done explorer!";
                } else{
                    message1="GG!";
                    message2="Nice try!";
                }
                context.font="70px Bangers";
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40); // aligning the text message 

                context.font="30px Bangers";
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40); // aligning the text message
            }

            //ammo bar
            if(this.game.player.powerUp) context.fillStyle= '#ffffbd';
            for(let i=0; i< this.game.ammo; i++){
                context.fillRect(20+5*i,50,3,20);
            }
            context.restore();
            
        }
    }
  

    // individual background, parallax backgrounds
    class Layer{
        constructor(game, image, speedModifier){
            this.game=game;
            this.image=image;
            this.speedModifier=speedModifier;
            this.width=1768;
            this.height=500;
            this.x=0;
            this.y=0;
        }

        update(){
            if(this.x  <= -this.width) this.x=0;
            this.x -= this.game.speed * this.speedModifier;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y); // endless parallax bg
        
        }
    }

    // combine all the layers to form the entire system
    class Background{
        constructor(game){
            this.game=game;
            this.image1= document.getElementById("layer1");
            this.image2= document.getElementById("layer2");
            this.image3= document.getElementById("layer3");
            this.image4= document.getElementById("layer4");

            this.layer1= new Layer(this.game, this.image1, 0.3);
            this.layer2= new Layer(this.game, this.image2, 0.6);
            this.layer3= new Layer(this.game, this.image3, 1);
            this.layer4= new Layer(this.game, this.image4, 1.5);
            
            this.layers=[this.layer1, this.layer2, this.layer3];
        }

        update(){
            this.layers.forEach(layer => layer.update());
        }

        draw(context){
            this.layers.forEach(layer => layer.draw(context));

        }
    }

    
    // brain of project, everything combines here
    class Game{
        constructor(width,height){
            this.width=width;
            this.height=height;
            this.background = new Background(this);
            this.player= new Player(this);
            this.input= new InputHandler(this);
            this.ui= new UI(this)
            this.keys=[];
            this.particles=[];
            this.explosions=[];

            this.pause=false;

            this.enemies=[];
            this.enemyTimer=0;
            this.enemyInterval= 2000;

            this.ammo=20;
            this.maxAmmo=50;
            this.ammoTimer=0;
            this.ammoInterval=500;

            this.score=0;
            this.winningScore=100;

            this.gameTime=0;
            this.timeLimit=60000;

            this.speed=1;

            this.debug=false;

            this.gameOver=false;
        }

        
        update(deltaTime){
            if(this.pause===false){
                // timer 
                if(!this.gameOver) this.gameTime += deltaTime; 

                if(this.gameTime > this.timeLimit){this.gameOver=true;}

                this.background.update();
                this.background.layer4.update();

                this.player.update(deltaTime);

                // replenishes the ammo every 500 millisec if true
                if(this.ammoTimer > this.ammoInterval){
                    if(this.ammo < this.maxAmmo) {
                        this.ammo++;
                        this.ammoTimer=0;
                    } 
                } else{this.ammoTimer += deltaTime;}

                // updating the particles
                this.particles.forEach(particle => particle.update());
                this.particles= this.particles.filter(particle => !particle.markedForDeletion); // filter out the previous array, and 
                                                                                                // replace with a new one, which has marked for deletion set to false


                this.explosions.forEach(explosion =>explosion.update(deltaTime));
                this.explosions= this.explosions.filter(explosion => !explosion.markedForDeletion);

                // update enemies
                this.enemies.forEach(enemy =>{
                    enemy.update();

                    // checking for collision
                    if(this.checkCollision(this.player, enemy)){
                        enemy.markedForDeletion= true;
                        this.addExplosions(enemy);
                        // when collided with player
                        for(let i=0; i < enemy.score ;i++){
                            // will push a new particle each time for loop runs
                            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)) // we pass the postion of enemy x and y
                        }
                        if(enemy.type==='lucky'){ 
                            this.player.enterPowerUp();
                            
                        } else if(!this.gameOver){this.score--;}
                    }

                    
                    this.player.projectiles.forEach(projectile =>{
                        if(this.checkCollision(projectile,enemy)){
                            enemy.lives--;
                            projectile.markedForDeletion=true;

                            // when collided with projectile we drop particle
                            // will push a new particle each time for loop runs
                            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)) // we pass the postion of enemy x and y

                            // when killed
                            if(enemy.lives <= 0){

                                // when killed by projectile
                                for(let i=0; i < enemy.score ;i++){
                                    // will push a new particle each time for loop runs
                                    this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)) // we pass the postion of enemy x and y
                                }
                                enemy.markedForDeletion=true;
                                this.addExplosions(enemy);

                                if(enemy.type==="hive"){
                                    for(let i=0; i<5;i++){
                                        this.enemies.push(new Drone(this, enemy.x + Math.random()* enemy.width, 
                                        enemy.y+ Math.random()* enemy.height * 0.5));
                                    }
                                }

                                
                                if(!this.gameOver){ this.score+= enemy.score;}
                                if(this.score > this.winningScore){this.gameOver=true;}
                            }

                        }
                    })
                })
                this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
                
                // checking game time, to draw more enemies or not
                if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                    this.addEnemy();
                    this.enemyTimer=0;
                } else{this.enemyTimer += deltaTime;}
            }
            else if(this.pause===true){
                this.pause=true;
            }
        }

        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            
            
            this.particles.forEach(particle => particle.draw(context)); // calling draw method for particles

            //  drawing enemies on the area
            this.enemies.forEach(enemy =>{
                enemy.draw(context);
            })

            this.explosions.forEach(explosion =>{ // explosions
                explosion.draw(context);
            })
            
            this.background.layer4.draw(context);

            this.ui.draw(context);
        }
        // add enemies 
        addEnemy(){
            const randomize= Math.random();
            if (randomize < 0.3) this.enemies.push(new Angler1(this));

            else if(randomize > 0.3 && randomize < 0.6 ){this.enemies.push(new Angler2(this));}

            else if(randomize > 0.6 && randomize < 0.8 ){this.enemies.push(new HiveHhale(this));}

            else{this.enemies.push(new LuckyFish(this));}
            
        }

        // add explosions
        addExplosions(enemy){
            const randomize= Math.random();
            if(randomize < 0.5) this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
            else{this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))}
        }

        // detect collision bw enemy and player
        checkCollision(rect1, rect2){
            return(     rect1.x < rect2.x + rect2.width && // check horizontal pos of rect1 x is less than hori y of rect2 + its width
                        rect1.x + rect1.width > rect2.x &&// check horiz of rect1 + width is more than rect2 horiz
                        rect1.y < rect2.y + rect2.height &&// check vertical of rect1 is less than rect2 + height
                        rect1.height + rect1.y > rect2.y)// vertical of rect1 + height is greater than rect2
            
        }
    }

    // instance of class Game
    // it will pass values of canvas from line-10,11
    const game= new Game(canvas.width, canvas.height);
    let lastTime=0;

    // animation loop
    // runs update and draw method over and over again
    function animate(timeStamp){

        // timers for ammo replenishment 
        const deltaTime= timeStamp - lastTime;
        lastTime= timeStamp;
        ctx.clearRect(0,0,canvas.width,canvas.height); // clears the canvas bw each animation frame
        
        game.draw(ctx);// will take value of ctx from canvas setup and pass it into draw() in game
        game.update(deltaTime);
       
        // tells the browser that we wish to perfrom a animation 
        // browser calls a specific function to update an animation before repaint
        requestAnimationFrame(animate);     // endless animation loop
    }
    animate(0);

})
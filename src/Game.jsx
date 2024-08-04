import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import diceImage from './img/dice.png'
import buttonImage from './img/button.png'

function Game(){
  const phaserGameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: phaserGameRef.current,
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    const game = new Phaser.Game(config);

    function preload() {
        this.load.spritesheet('dice', diceImage, { frameWidth: 32, frameHeight: 32 });
        this.load.image('button', buttonImage);
    }
      
    function create() {
        //Dice Part
        this.dices = this.add.container(200,300);
        this.dices.setData({roll: 3, recordEnable: false});

        for (let i = 0; i < 5; i++) {
          const dice = this.add.sprite(-100 + i * 50, 0, 'dice');
          dice.setInteractive();
          dice.on('pointerdown', () => {dice.selected = !dice.selected;});
          dice.setData({value: -1});
          this.dices.add(dice);
        }

        this.rollBtn = this.add.image(300, 500,'button').setTint(0xff0000).setScale(5, 5);
        this.rollBtn.setInteractive();
        this.rollBtn.on('pointerdown', () => {
            const roll = this.dices.getData('roll');
            if(roll == 0)
                return;

            this.dices.list.forEach(dice => {
                if (!dice.selected) {
                  const dots = Phaser.Math.Between(1, 6);
                  dice.setFrame(dots - 1);
                  dice.setData('value', dots);
                }
            });

            this.dices.setData('roll', roll-1);
            this.dices.setData('recordEnable', true);
        });


        //Score Part
        this.scoreBoard = this.add.container(0, 0);

        const recordScore = (num, Calculate) => {
            if(!this.dices.getData('recordEnable') || this.scoreBoard.list[num].getData('isRecorded'))
                return;

            console.log(num);

            this.dices.setData('roll', 3);
            this.dices.list.forEach(dice => {dice.selected = false;});
            this.dices.setData('recordEnable', false);

            this.scoreBoard.list[num].setData({value: Calculate(), isRecorded: true});
            this.scoreBoard.list[num].list[1].setText(`${Calculate()}`);
        }

        const calNums = (num) => {
            let result = 0;

            this.dices.list.forEach(dice => {
                if(dice.getData('value') == num)
                    result += num;
            })

            return result;
        }

        for(let i = 0; i < 6; i++){
            const score = this.add.container(600,100);
            const scoreImg = this.add.image(0, 0 + i * 60, 'button').setScale(5, 5).setInteractive();
            const scoreText = this.add.text(-50, -10 + i * 60, 'scoreText').setFill(0xFFFFFF);

            score.add([scoreImg, scoreText]);

            score.setData({value: 0, isRecorded: false});

            this.scoreBoard.add(score);
        }

        for( let i = 0; i < 6; i++)
            this.scoreBoard.list[i].list[0].on('pointerdown', () => {recordScore(i, () => calNums(i+1))});
      }
      

    function update() {
        this.dices.list.forEach(dice => {
            dice.setTint(dice.selected ? 0xff0000 : 0xffffff);
        })
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={phaserGameRef}></div>;
}

export default Game;

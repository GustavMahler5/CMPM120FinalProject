class EvaluationScene extends BaseScene {



    constructor() {

        super('evaluationscene');

    }



    init(data) {

        this.score = data.score ?? 0;
        this.level = data.level;

    }



    preload() {

        this.load.pack("main", "../assets/assets.json");

    }



    create() {

        let bestScore;
        let playAgain;

        switch(this.level) {

            case(1):

                bestScore = Math.max(this.score, BaseScene.level1BestScore);
                BaseScene.level1BestScore = bestScore;
                break;
                
            
            case(2):

                bestScore = Math.max(this.score, BaseScene.level2BestScore);
                BaseScene.level2BestScore = bestScore;
                break;

            case(3):
                
                bestScore = Math.max(this.score, BaseScene.level3BestScore);
                BaseScene.level3BestScore = bestScore;
                break;
            
            default:
                return;
        }

        this.evaluationText = this.add.text(
            this.SCREEN_WIDTH * 0.5,
            this.SCREEN_HEIGHT * 0.2,
            "Great Job!")
            .setOrigin(0.5, 0.5);

        this.time.delayedCall (

            2000,
            () => this.add.text (
                this.SCREEN_WIDTH * 0.5, 
                this.SCREEN_HEIGHT * 0.4,
                `Your score was ${this.score.toFixed(0)}`)
                .setOrigin(0.5, 0.5)

        );
        
        this.time.delayedCall (

            4000,
            () => this.add.text (
                this.SCREEN_WIDTH * 0.5, 
                this.SCREEN_HEIGHT * 0.5,
                `Best Score: ${bestScore.toFixed(0)}`)
                .setOrigin(0.5, 0.5)

        );

        this.time.delayedCall (

            6000,
            () => playAgain = this.add.text (
                this.SCREEN_WIDTH * 0.5, 
                this.SCREEN_HEIGHT * 0.7,
                "Return")
                .setOrigin(0.5, 0.5)
                .setInteractive({useHandCursor: true})
                .on('pointerdown', () => {

                    this.changeScene('levelselectprototype');

                }
            )
        );

        this.tweens.add({

            targets: playAgain,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
            
        });

    }



    update() {

    }



}
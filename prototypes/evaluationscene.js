class EvaluationScene extends BaseScene {



    constructor() {

        super('evaluationscene');

    }



    init(data) {

        this.score = data.score ?? 0;

    }



    preload() {

        this.load.pack("main", "../assets/assets.json");

    }



    create() {

        BaseScene.bestScore = Math.max(this.score, BaseScene.bestScore);
        let playAgain;

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
                `Best Score: ${BaseScene.bestScore.toFixed(0)}`)
                .setOrigin(0.5, 0.5)

        );

        this.time.delayedCall (

            6000,
            () => playAgain = this.add.text (
                this.SCREEN_WIDTH * 0.5, 
                this.SCREEN_HEIGHT * 0.7,
                "Play Again")
                .setOrigin(0.5, 0.5)
                .setInteractive({useHandCursor: true})
                .on('pointerdown', () => {

                    this.changeScene('gameplayprototype2');

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
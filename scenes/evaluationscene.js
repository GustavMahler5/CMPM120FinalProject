class EvaluationScene extends BaseScene {



    constructor() {

        super('evaluationscene');

    }



    init(data) {

        this.score = data.score ?? 0;
        this.level = data.level;

    }



    preload() {

        this.load.pack("main", "../assets/level3assets.json");
    }



    create() {

        let bestScore;
        let playAgain;

        switch(this.level) {

            case(1):

                bestScore = Math.max(this.score, BaseScene.level1BestScore);
                BaseScene.level1BestScore = bestScore;
                localStorage.setItem('level1BestScore', bestScore);

                if (this.score > this.CUTOFF_SCORE) {

                    this.add.text(
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

                }

                else {

                    this.add.text(
                        this.SCREEN_WIDTH * 0.5,
                        this.SCREEN_HEIGHT * 0.2,
                        "Meh!")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () => this.add.text (
                            this.SCREEN_WIDTH * 0.5, 
                            this.SCREEN_HEIGHT * 0.4,
                            `Your score was ${this.score.toFixed(0)}`)
                            .setOrigin(0.5, 0.5)

                    );

                }
                
                break;
            
            case(2):

                bestScore = Math.max(this.score, BaseScene.level2BestScore);
                BaseScene.level2BestScore = bestScore;
                localStorage.setItem('level2BestScore', bestScore);
                if (this.score > this.CUTOFF_SCORE) {

                    this.add.text(
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

                }

                else {

                    this.add.text(
                        this.SCREEN_WIDTH * 0.5,
                        this.SCREEN_HEIGHT * 0.2,
                        "Meh!")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () => this.add.text (
                            this.SCREEN_WIDTH * 0.5, 
                            this.SCREEN_HEIGHT * 0.4,
                            `Your score was ${this.score.toFixed(0)}`)
                            .setOrigin(0.5, 0.5)

                    );

                }
                
                break;

            case(3):
                
                bestScore = Math.max(this.score, BaseScene.level3BestScore);
                BaseScene.level3BestScore = bestScore;
                localStorage.setItem('level3BestScore', bestScore);

                if (this.score > this.CUTOFF_SCORE) {

                    this.add.text(
                        this.SCREEN_WIDTH * 0.5,
                        this.SCREEN_HEIGHT * 0.2,
                        "Great Job!")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () =>  { this.add.text (
                            this.SCREEN_WIDTH * 0.5, 
                            this.SCREEN_HEIGHT * 0.4,
                            `Your score was ${this.score.toFixed(0)}`)
                            .setOrigin(0.5, 0.5),

                            this.add.image (
                            this.SCREEN_WIDTH * 0.7,
                            this.SCREEN_HEIGHT * 0.4,
                            "goodEvaluation")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.1)

                    });

                }

                else {

                    this.add.text(
                        this.SCREEN_WIDTH * 0.5,
                        this.SCREEN_HEIGHT * 0.2,
                        "Meh!")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () =>  { this.add.text (
                            this.SCREEN_WIDTH * 0.5, 
                            this.SCREEN_HEIGHT * 0.4,
                            `Your score was ${this.score.toFixed(0)}`)
                            .setOrigin(0.5, 0.5),

                            this.add.image (
                            this.SCREEN_WIDTH * 0.7,
                            this.SCREEN_HEIGHT * 0.4,
                            "badEvaluation")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.1)

                    });

                }
                
                break;
            
            default:

                break;

        }

        this.time.delayedCall (

            3000,
            () => playAgain = this.add.text (
                this.SCREEN_WIDTH * 0.5, 
                this.SCREEN_HEIGHT * 0.7,
                "Return")
                .setOrigin(0.5, 0.5)
                .setInteractive({useHandCursor: true})
                .on('pointerdown', () => {

                    this.changeScene('levelselect');

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
}
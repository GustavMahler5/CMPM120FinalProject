class EvaluationScene extends BaseScene {



    constructor() {

        super('evaluationscene');

    }



    init(data) {

        this.score = data.score ?? 0;
        this.level = data.level;

    }



    preload() {

        super.preload();
        this.load.pack("main", "assets/level3assets.json", "/CMPM120FinalProject/");
        this.load.image("marvelous", "assets/images/level3/marvelous.png");
        this.load.image("oops", "assets/images/level3/oops.png");
        this.load.image('friendly_alien', 'assets/images/level2/friendly_alien.png');
        this.load.image('catMarvelous', "assets/images/level1/ballWin.png");
        this.load.image('catOops', "assets/images/level1/catMiss.png");
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
                        "You caught those treats like a real pro!")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () => { this.add.image (
                            this.SCREEN_WIDTH * 0.5,
                            this.SCREEN_HEIGHT * 0.4,
                            "marvelous")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.15)

                            this.add.image (
                            this.SCREEN_WIDTH * 0.7,
                            this.SCREEN_HEIGHT * 0.4,
                            "catMarvelous")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.5)

                        });

                }

                else {

                    this.add.text(
                        this.SCREEN_WIDTH * 0.5,
                        this.SCREEN_HEIGHT * 0.2,
                        "I guess shipcats do eventually lose their instincts")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () => { this.add.image (
                            this.SCREEN_WIDTH * 0.5,
                            this.SCREEN_HEIGHT * 0.4,
                            "oops")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.15)

                            this.add.image (
                            this.SCREEN_WIDTH * 0.7,
                            this.SCREEN_HEIGHT * 0.4,
                            "catOops")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.5)

                        });

                }
                
                break;
            
            case(2):

                bestScore = Math.max(this.score, BaseScene.level2BestScore);
                BaseScene.level2BestScore = bestScore;
                localStorage.setItem('level2BestScore', bestScore);
                if (this.score > this.CUTOFF_SCORE) {
                    let friend = this.add.image(-100, -100, "friendly_alien")
                        .setOrigin(.5, .5).setScale(4);
                    this.tweens.add({
                        targets: friend,
                        x: this.SCREEN_WIDTH * .3,
                        duration: 1000,
                        ease: 'Sine.In'
                    })
                    this.tweens.add({
                        targets: friend,
                        y: this.SCREEN_HEIGHT * .2,
                        duration: 1000,
                        ease: 'Sine.Out'
                    })
                    this.time.delayedCall(2000, () => {
                        this.add.text(
                        this.SCREEN_WIDTH * 0.5,
                        this.SCREEN_HEIGHT * 0.2,
                        "Good shooting cadet, you've done Glorpulon 5 proud!", 
                        {
                            align: "center",
                            wordWrap: { 
                                width: this.SCREEN_WIDTH * .25
                            }
                        })
                        .setOrigin(0.5, 0.5);

                        this.time.delayedCall(2000, () => {
                            this.add.image (
                            this.SCREEN_WIDTH * 0.5,
                            this.SCREEN_HEIGHT * 0.4,
                            "marvelous")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.15);
                        })
                    })

                }

                else {
                    let friend = this.add.image(-100, -100, "friendly_alien")
                        .setOrigin(.5, .5).setScale(4);
                    this.tweens.add({
                        targets: friend,
                        x: this.SCREEN_WIDTH * .3,
                        duration: 1000,
                        ease: 'Sine.In'
                    })
                    this.tweens.add({
                        targets: friend,
                        y: this.SCREEN_HEIGHT * .2,
                        duration: 1000,
                        ease: 'Sine.Out'
                    })
                    this.time.delayedCall(2000, () => {
                            this.add.text(
                                this.SCREEN_WIDTH * 0.5,
                                this.SCREEN_HEIGHT * 0.2,
                                "I've seen better shooting from a Glorbo, and they don't even have eyes!", 
                                {
                                    align: "center",
                                    wordWrap: { 
                                        width: this.SCREEN_WIDTH * .25
                                    }
                                })
                                .setOrigin(0.5, 0.5);
                            this.time.delayedCall (2000, () => {
                                this.add.image (
                                    this.SCREEN_WIDTH * 0.5,
                                    this.SCREEN_HEIGHT * 0.4,
                                    "oops")
                                    .setOrigin(0.5, 0.5)
                                    .setScale(0.15)
                            }

                    );
                        }
                    )

                    this.time.delayedCall (

                        2000,
                        () => this.add.image (
                            this.SCREEN_WIDTH * 0.5,
                            this.SCREEN_HEIGHT * 0.4,
                            "oops")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.15)

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
                        "You handled those offbeat abduc- I mean collections really well!")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () =>  { this.add.image (
                            this.SCREEN_WIDTH * 0.5,
                            this.SCREEN_HEIGHT * 0.4,
                            "marvelous")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.15)

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
                        "Well, I think we could be partners after you grow your skillset a bit more...")
                        .setOrigin(0.5, 0.5);

                    this.time.delayedCall (

                        2000,
                        () =>  { this.add.image (
                            this.SCREEN_WIDTH * 0.5,
                            this.SCREEN_HEIGHT * 0.4,
                            "oops")
                            .setOrigin(0.5, 0.5)
                            .setScale(0.15)

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

            4000,
            () => playAgain = this.add.text (
                this.SCREEN_WIDTH * 0.5, 
                this.SCREEN_HEIGHT * 0.7,
                "Back to level select")
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
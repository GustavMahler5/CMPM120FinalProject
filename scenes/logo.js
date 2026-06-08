
class LogoScene extends BaseScene {

    constructor() {
        super({ key: "logo" });
    }

    preload() {
        this.load.setBaseURL('./');

        this.load.image('toastPerspective','../assets/images/cinematic/toastPerspective.png');
        this.load.image('J','../assets/images/cinematic/J.png');
        this.load.image('jPan','../assets/images/cinematic/jPan.png');
        this.load.image('egg','../assets/images/cinematic/egg.png');
        this.load.image('crackedEgg','../assets/images/cinematic/crackedEgg.png');
        this.load.image('eggOnToast','../assets/images/cinematic/eggOnToast.png');



    }

    onEnter() {
        const w = this.scale.width;
        const h = this.scale.height;

        let logoText = this.add.text(
            w * 0.25,
            h * 0.45,
            'Jeggs  & Toast',
            {
                fontSize: '63px',
                fontStyle: 'bold',
                color: '#ffffff',
                depth:10,
            }
        ) 
        .setAlpha(0);

        this.cameras.main.setBackgroundColor(0xC7C7C7);

        let toastPerspective = this.add.image(w * 0.68, h * 1.2, 'toastPerspective').setScale(0.3).setVisible(false);
        let jPan = this.add.image(w * 0.38, h * 0.5, 'jPan').setScale(0.5);
        let crackedEgg = this.add.image(w * 0.28, h * 0.35, 'crackedEgg').setScale(0.3).setVisible(false);
        let eggOnToast = this.add.image(w * 0.29, h * 0.65, 'eggOnToast').setScale(0.3).setVisible(false).setAngle(24);

        this.tweens.chain({
            tweens: [


                {
                    delay: 1000,
                    targets: crackedEgg,
                    x: w * 0.28,
                    y: h * 0.33,

                    duration: 300,
                    onStart: () => {
                    crackedEgg.setVisible(true);
                    }
                },

                {
                    targets: eggOnToast,
                    duration: 100,
                    x: w * 0.29,
                    y: h * 0.69,
                    hold: 600,
                    onStart: () => {
                        
                    eggOnToast.setVisible(true);
                    },

                    hold: 400,
                    onComplete: () => {
                    crackedEgg.setVisible(false);

                    }
                    

                },
                {
                    targets: jPan,
                    x: w * 0.38,
                    y: h * 0.69,
                    duration: 100,
                    delay: 800,
                    scaleY: -0.5,
                    yoyo: true,
                    hold: 800,

                    onStart: () => {
                        toastPerspective.setVisible(true);

                        this.tweens.add({
                            targets: eggOnToast,
                            x: w * 0.6,
                            y: h * -5.0,
                            duration: 800
                        });

                        this.tweens.add({
                            targets: toastPerspective,
                            y: h * 0.65,
                            duration: 500
                        });
                    
                    
                    },

                    hold: 350,
                    onComplete: () => {
                    crackedEgg.setVisible(false);

                            this.tweens.add({
                            targets: eggOnToast,
                            x: w * 0.68,
                            y: h * 0.65,
                            duration: 300
                        });

                    }
                    

                },
                {
                    targets: [eggOnToast, toastPerspective],
                    delay:500,
                    duration: 300,
                    x: w * 0.6,
                    y: h * 0.6,

                    onStart: () => {
                    jPan.setTexture('J');
                    },
                },
                {
                    targets: logoText,
                    alpha: 1,
                    duration: 1000,
                    hold: 2000,
                    onComplete: () => {
                        this.changeScene("menu");
                    }
                },
            ]
        });

    }
}

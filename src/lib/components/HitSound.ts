import { Howl } from 'howler';

export class HitSound {
    private howl: Howl;
    constructor(src: string) {
        this.howl = new Howl({
            src: [src]
        });
    }

    async play(): Promise<void> {
        await this.howl.play();
    }
}
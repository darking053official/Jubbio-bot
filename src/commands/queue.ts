export interface QueueTrack {
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
  requestedBy: string;
}

export class GuildQueue {
  tracks: QueueTrack[] = [];
  currentIndex: number = 0;
  playing: boolean = false;
  player: any = null;
  textChannelId: string | null = null;
  textChannelSend: ((payload: any) => Promise<any>) | null = null;

  next(): QueueTrack | null {
    if (this.currentIndex >= this.tracks.length) return null;
    const track = this.tracks[this.currentIndex];
    this.currentIndex++;
    return track;
  }

  current(): QueueTrack | null {
    const idx = this.currentIndex - 1;
    return this.tracks[idx] ?? null;
  }
}

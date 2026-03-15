import { playStream } from "@jubbio/voice"

export default {
  name: "play",
  permissions: ["SendMessages"],

  async execute(ctx) {
    const query = ctx.args.join(" ")
    if(!query) return ctx.reply("❌ Şarkı adı veya link yaz")

    if(!ctx.guildSettings.queue) ctx.guildSettings.queue = []

    ctx.guildSettings.queue.push(query)

    if(!ctx.guildSettings.isPlaying){
      ctx.guildSettings.isPlaying = true
      while(ctx.guildSettings.queue.length > 0){
        const song = ctx.guildSettings.queue.shift()
        try{
          await playStream(ctx, song)
          ctx.reply("🎵 Çalıyor: " + song)
        }catch{
          ctx.reply("❌ Müzik bulunamadı: " + song)
        }
      }
      ctx.guildSettings.isPlaying = false
    }
  }
}

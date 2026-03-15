export default {
  name: "queue",
  permissions: ["SendMessages"],

  async execute(ctx){
    const queue = ctx.guildSettings.queue || []
    if(queue.length === 0) return ctx.reply("📭 Sırada müzik yok")
    ctx.reply("📜 Müzik Sırası:\n" + queue.map((m,i)=>`${i+1}. ${m}`).join("\n"))
  }
}

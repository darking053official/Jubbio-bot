export default {
  name: "skip",
  permissions: ["ManageChannels"],

  async execute(ctx){
    const dj = ctx.guildSettings.djRole
    if(dj && !ctx.member.roles.includes(dj)) return ctx.reply("❌ Sadece DJ skip yapabilir")
    ctx.guildSettings.skip = true
    ctx.reply("⏭ Şarkı atlandı")
  }
}

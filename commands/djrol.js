export default {
  name: "djrol",
  permissions: ["ManageRoles"],

  async execute(ctx){
    const roleName = ctx.args.join(" ")
    if(!roleName) return ctx.reply("DJ")
    ctx.guildSettings.djRole = roleName
    ctx.reply(`✅ DJ rolü ayarlandı: ${roleName}`)
  }
}

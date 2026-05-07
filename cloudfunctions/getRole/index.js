const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const res = await db.collection('admins').where({ openid: OPENID }).limit(1).get()
  return { openid: OPENID, isAdmin: res.data.length > 0 }
}

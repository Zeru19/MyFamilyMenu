const DISHES = 'dishes'
const ORDERS = 'orders'
const MY_ORDER_IDS_KEY = 'my_order_ids'

const seedDishes = [
  { name: '番茄炒蛋', category: '家常热菜', price: 18, description: '酸甜开胃，适合配米饭。', image: '', available: true },
  { name: '青椒肉丝', category: '家常热菜', price: 26, description: '微辣下饭，肉丝现炒。', image: '', available: true },
  { name: '紫菜蛋花汤', category: '汤品', price: 12, description: '清淡热汤，可多人分享。', image: '', available: true },
  { name: '米饭', category: '主食', price: 2, description: '按碗计价。', image: '', available: true }
]

function db() {
  return wx.cloud.database()
}

function listDishes() {
  return db().collection(DISHES).orderBy('updatedAt', 'desc').limit(100).get()
    .then((res) => res.data.map((d) => ({ image: '', ...d })))
}

function listAvailableDishes() {
  return db().collection(DISHES).where({ available: true }).orderBy('updatedAt', 'desc').limit(100).get()
    .then((res) => res.data.map((d) => ({ image: '', ...d })))
}

function saveDish(dish) {
  const now = db().serverDate()
  if (dish._id) {
    const { _id, _openid, createdAt, ...rest } = dish
    return db().collection(DISHES).doc(_id).update({ data: { ...rest, updatedAt: now } })
      .then(() => ({ ...dish, updatedAt: new Date() }))
  }
  const data = { ...dish, createdAt: now, updatedAt: now }
  return db().collection(DISHES).add({ data }).then((res) => ({ ...data, _id: res._id }))
}

function deleteDish(id) {
  return db().collection(DISHES).doc(id).remove()
}

function seedDefaultDishes() {
  const c = db().collection(DISHES)
  const now = db().serverDate()
  return Promise.all(seedDishes.map((d) =>
    c.add({ data: { ...d, createdAt: now, updatedAt: now } })
  ))
}

function listAllOrders() {
  return db().collection(ORDERS).orderBy('createdAt', 'desc').limit(100).get()
    .then((res) => res.data)
}

function listOrdersByIds(ids) {
  if (!ids || !ids.length) return Promise.resolve([])
  return db().collection(ORDERS).where({ _id: db().command.in(ids) })
    .orderBy('createdAt', 'desc').limit(100).get()
    .then((res) => res.data)
}

function createOrder(payload) {
  const data = { ...payload, status: 'pending', createdAt: db().serverDate() }
  return db().collection(ORDERS).add({ data }).then((res) => {
    trackOrderId(res._id)
    return { ...data, _id: res._id }
  })
}

function updateOrderStatus(orderId, status, extra) {
  return db().collection(ORDERS).doc(orderId).update({
    data: { status, updatedAt: db().serverDate(), ...(extra || {}) }
  })
}

function clearAllOrders() {
  return db().collection(ORDERS).limit(100).get().then((res) => {
    return Promise.all(res.data.map((o) => db().collection(ORDERS).doc(o._id).remove()))
  })
}

function getPendingCount() {
  return db().collection(ORDERS).where({ status: 'pending' }).count().then((r) => r.total)
}

function getMyOrderIds() {
  return wx.getStorageSync(MY_ORDER_IDS_KEY) || []
}

function trackOrderId(id) {
  const ids = getMyOrderIds()
  ids.unshift(id)
  wx.setStorageSync(MY_ORDER_IDS_KEY, ids.slice(0, 100))
}

module.exports = {
  listDishes,
  listAvailableDishes,
  saveDish,
  deleteDish,
  seedDefaultDishes,
  listAllOrders,
  listOrdersByIds,
  createOrder,
  updateOrderStatus,
  clearAllOrders,
  getPendingCount,
  getMyOrderIds
}

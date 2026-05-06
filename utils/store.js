const DISHES_KEY = 'family_menu_dishes'
const ORDERS_KEY = 'family_menu_orders'

const defaultDishes = [
  {
    id: 'dish_001',
    name: '番茄炒蛋',
    category: '家常热菜',
    price: 18,
    description: '酸甜开胃，适合配米饭。',
    image: '',
    available: true
  },
  {
    id: 'dish_002',
    name: '青椒肉丝',
    category: '家常热菜',
    price: 26,
    description: '微辣下饭，肉丝现炒。',
    image: '',
    available: true
  },
  {
    id: 'dish_003',
    name: '紫菜蛋花汤',
    category: '汤品',
    price: 12,
    description: '清淡热汤，可多人分享。',
    image: '',
    available: true
  },
  {
    id: 'dish_004',
    name: '米饭',
    category: '主食',
    price: 2,
    description: '按碗计价。',
    image: '',
    available: true
  }
]

function ensureSeedData() {
  if (!wx.getStorageSync(DISHES_KEY)) {
    wx.setStorageSync(DISHES_KEY, defaultDishes)
  }

  if (!wx.getStorageSync(ORDERS_KEY)) {
    wx.setStorageSync(ORDERS_KEY, [])
  }
}

function getDishes() {
  ensureSeedData()
  const dishes = wx.getStorageSync(DISHES_KEY) || []
  return dishes.map((dish) => ({ image: '', ...dish }))
}

function saveDishes(dishes) {
  wx.setStorageSync(DISHES_KEY, dishes)
}

function resetDishes() {
  wx.setStorageSync(DISHES_KEY, defaultDishes)
  return defaultDishes
}

function getOrders() {
  ensureSeedData()
  return wx.getStorageSync(ORDERS_KEY) || []
}

function saveOrders(orders) {
  wx.setStorageSync(ORDERS_KEY, orders)
}

function createOrder(payload) {
  const orders = getOrders()
  const now = new Date()
  const order = {
    id: `order_${now.getTime()}`,
    createdAt: formatTime(now),
    status: 'pending',
    ...payload
  }

  wx.setStorageSync(ORDERS_KEY, [order].concat(orders))
  return order
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders().map((order) => {
    if (order.id !== orderId) {
      return order
    }

    return {
      ...order,
      status
    }
  })

  saveOrders(orders)
  return orders
}

function deleteDish(id) {
  const dishes = getDishes().filter((dish) => dish.id !== id)
  saveDishes(dishes)
  return dishes
}

function clearOrders() {
  wx.setStorageSync(ORDERS_KEY, [])
}

function getPendingCount() {
  return getOrders().filter((o) => o.status === 'pending').length
}

function formatTime(date) {
  const pad = (value) => String(value).padStart(2, '0')
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  return `${month}-${day} ${hour}:${minute}`
}

module.exports = {
  ensureSeedData,
  getDishes,
  saveDishes,
  resetDishes,
  deleteDish,
  getOrders,
  createOrder,
  updateOrderStatus,
  clearOrders,
  getPendingCount
}


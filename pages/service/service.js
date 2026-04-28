const store = require('../../utils/store')

const emptyDishForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  description: '',
  available: true
}

Page({
  data: {
    dishes: [],
    orders: [],
    dishForm: { ...emptyDishForm },
    editingDishId: '',
    statusText: {
      pending: '待接单',
      accepted: '制作中',
      done: '已完成'
    }
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({
      dishes: store.getDishes(),
      orders: this.decorateOrders(store.getOrders())
    })
  },

  onDishInput(event) {
    const field = event.currentTarget.dataset.field
    this.setData({
      dishForm: {
        ...this.data.dishForm,
        [field]: event.detail.value
      }
    })
  },

  saveDish() {
    const form = this.data.dishForm
    const name = form.name.trim()
    const price = Number(form.price)

    if (!name || !price || price < 0) {
      wx.showToast({
        title: '请填写菜名和价格',
        icon: 'none'
      })
      return
    }

    const nextDish = {
      id: form.id || `dish_${Date.now()}`,
      name,
      category: form.category.trim() || '未分类',
      price,
      description: form.description.trim(),
      available: form.available
    }

    const dishes = this.data.editingDishId
      ? this.data.dishes.map((dish) => (dish.id === this.data.editingDishId ? nextDish : dish))
      : [nextDish].concat(this.data.dishes)

    store.saveDishes(dishes)
    this.setData({
      dishes,
      dishForm: { ...emptyDishForm },
      editingDishId: ''
    })

    wx.showToast({
      title: '已保存',
      icon: 'success'
    })
  },

  editDish(event) {
    const id = event.currentTarget.dataset.id
    const dish = this.data.dishes.find((item) => item.id === id)

    if (!dish) {
      return
    }

    this.setData({
      editingDishId: id,
      dishForm: {
        ...dish,
        price: String(dish.price)
      }
    })
  },

  cancelEdit() {
    this.setData({
      dishForm: { ...emptyDishForm },
      editingDishId: ''
    })
  },

  toggleDish(event) {
    const id = event.currentTarget.dataset.id
    const dishes = this.data.dishes.map((dish) => {
      if (dish.id !== id) {
        return dish
      }

      return {
        ...dish,
        available: !dish.available
      }
    })

    store.saveDishes(dishes)
    this.setData({ dishes })
  },

  resetDishes() {
    const dishes = store.resetDishes()
    this.setData({
      dishes,
      dishForm: { ...emptyDishForm },
      editingDishId: ''
    })
  },

  acceptOrder(event) {
    this.updateStatus(event.currentTarget.dataset.id, 'accepted')
  },

  finishOrder(event) {
    this.updateStatus(event.currentTarget.dataset.id, 'done')
  },

  updateStatus(orderId, status) {
    const orders = store.updateOrderStatus(orderId, status)
    this.setData({ orders: this.decorateOrders(orders) })
  },

  decorateOrders(orders) {
    return orders.map((order) => ({
      ...order,
      statusLabel: this.data.statusText[order.status] || order.status
    }))
  },

  clearOrders() {
    store.clearOrders()
    this.setData({ orders: [] })
  }
})

const store = require('../../utils/store')

const emptyDishForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  description: '',
  image: '',
  available: true
}

function decorateDishes(dishes) {
  return dishes.map((dish) => ({
    ...dish,
    firstChar: (dish.name || '?').slice(0, 1)
  }))
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
      dishes: decorateDishes(store.getDishes()),
      orders: this.decorateOrders(store.getOrders())
    })
    this.syncBadge()
  },

  syncBadge() {
    const count = store.getPendingCount()
    if (count > 0) {
      wx.setTabBarBadge({ index: 1, text: String(count) })
    } else {
      wx.removeTabBarBadge({ index: 1 })
    }
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

    if (!name || !price || price <= 0) {
      wx.showToast({
        title: '请填写菜名和有效价格',
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
      image: (form.image || '').trim(),
      available: form.available
    }

    const dishes = this.data.editingDishId
      ? this.data.dishes.map((dish) => (dish.id === this.data.editingDishId ? nextDish : dish))
      : [nextDish].concat(this.data.dishes)

    store.saveDishes(dishes)
    this.setData({
      dishes: decorateDishes(dishes),
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
        ...emptyDishForm,
        ...dish,
        price: String(dish.price)
      }
    })

    wx.pageScrollTo({ scrollTop: 0, duration: 200 })
  },

  cancelEdit() {
    this.setData({
      dishForm: { ...emptyDishForm },
      editingDishId: ''
    })
  },

  deleteDish(event) {
    const id = event.currentTarget.dataset.id
    const dish = this.data.dishes.find((item) => item.id === id)

    if (!dish) {
      return
    }

    wx.showModal({
      title: '删除菜品',
      content: `确定删除「${dish.name}」？`,
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        const dishes = store.deleteDish(id)
        const cancelEdit = this.data.editingDishId === id
        this.setData({
          dishes: decorateDishes(dishes),
          ...(cancelEdit ? { dishForm: { ...emptyDishForm }, editingDishId: '' } : {})
        })
      }
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
    this.setData({ dishes: decorateDishes(dishes) })
  },

  resetDishes() {
    wx.showModal({
      title: '恢复默认菜品',
      content: '将清空所有自定义菜品并恢复初始菜单，确定继续？',
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        const dishes = store.resetDishes()
        this.setData({
          dishes: decorateDishes(dishes),
          dishForm: { ...emptyDishForm },
          editingDishId: ''
        })
      }
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
    this.syncBadge()
  },

  decorateOrders(orders) {
    return orders.map((order) => ({
      ...order,
      statusLabel: this.data.statusText[order.status] || order.status
    }))
  },

  clearOrders() {
    wx.showModal({
      title: '清空订单',
      content: '将删除所有订单记录，确定继续？',
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        store.clearOrders()
        this.setData({ orders: [] })
        this.syncBadge()
      }
    })
  }
})

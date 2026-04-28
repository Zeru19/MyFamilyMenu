const store = require('../../utils/store')

Page({
  data: {
    dishes: [],
    cart: {},
    note: '',
    totalCount: 0,
    totalPrice: 0
  },

  onShow() {
    this.loadDishes()
    this.recalculate()
  },

  loadDishes() {
    const dishes = store.getDishes().filter((dish) => dish.available)
    this.setData({ dishes: this.decorateDishes(dishes, this.data.cart) })
  },

  increase(event) {
    const id = event.currentTarget.dataset.id
    const nextCart = { ...this.data.cart }
    nextCart[id] = (nextCart[id] || 0) + 1
    this.setData({ cart: nextCart })
    this.recalculate()
  },

  decrease(event) {
    const id = event.currentTarget.dataset.id
    const nextCart = { ...this.data.cart }
    const nextValue = (nextCart[id] || 0) - 1

    if (nextValue > 0) {
      nextCart[id] = nextValue
    } else {
      delete nextCart[id]
    }

    this.setData({ cart: nextCart })
    this.recalculate()
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value })
  },

  resetCart() {
    this.setData({
      cart: {},
      note: '',
      totalCount: 0,
      totalPrice: 0
    })
  },

  submitOrder() {
    if (!this.data.totalCount) {
      wx.showToast({
        title: '请先选择菜品',
        icon: 'none'
      })
      return
    }

    const items = this.data.dishes
      .filter((dish) => this.data.cart[dish.id])
      .map((dish) => ({
        id: dish.id,
        name: dish.name,
        price: Number(dish.price),
        count: this.data.cart[dish.id],
        subtotal: Number(dish.price) * this.data.cart[dish.id]
      }))

    store.createOrder({
      items,
      totalCount: this.data.totalCount,
      totalPrice: this.data.totalPrice,
      note: this.data.note.trim()
    })

    this.resetCart()
    wx.showToast({
      title: '已提交',
      icon: 'success'
    })
  },

  recalculate() {
    let totalCount = 0
    let totalPrice = 0

    this.data.dishes.forEach((dish) => {
      const count = this.data.cart[dish.id] || 0
      totalCount += count
      totalPrice += Number(dish.price) * count
    })

    this.setData({
      dishes: this.decorateDishes(this.data.dishes, this.data.cart),
      totalCount,
      totalPrice
    })
  },

  decorateDishes(dishes, cart) {
    return dishes.map((dish) => ({
      ...dish,
      count: cart[dish.id] || 0
    }))
  }
})

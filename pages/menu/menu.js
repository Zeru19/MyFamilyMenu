const store = require('../../utils/store')

Page({
  data: {
    loading: true,
    dishes: [],
    cart: {},
    note: '',
    totalCount: 0,
    totalPrice: 0
  },

  onShow() {
    this.loadDishes()
  },

  onPullDownRefresh() {
    this.loadDishes().then(() => wx.stopPullDownRefresh())
  },

  loadDishes() {
    this.setData({ loading: true })
    return store.listAvailableDishes()
      .then((dishes) => {
        this.setData({
          dishes: this.decorateDishes(dishes, this.data.cart),
          loading: false
        })
        this.recalculate()
      })
      .catch((err) => {
        console.error(err)
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
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
      totalPrice: 0,
      dishes: this.decorateDishes(this.data.dishes, {})
    })
  },

  submitOrder() {
    if (!this.data.totalCount) {
      wx.showToast({ title: '请先选择菜品', icon: 'none' })
      return
    }

    const items = this.data.dishes
      .filter((dish) => this.data.cart[dish._id])
      .map((dish) => ({
        _id: dish._id,
        name: dish.name,
        price: Number(dish.price),
        count: this.data.cart[dish._id],
        subtotal: Number(dish.price) * this.data.cart[dish._id]
      }))

    wx.showLoading({ title: '提交中', mask: true })
    store.createOrder({
      items,
      totalCount: this.data.totalCount,
      totalPrice: this.data.totalPrice,
      note: this.data.note.trim()
    })
      .then(() => {
        wx.hideLoading()
        this.resetCart()
        wx.showToast({ title: '已提交', icon: 'success' })
      })
      .catch((err) => {
        wx.hideLoading()
        console.error(err)
        wx.showToast({ title: '提交失败', icon: 'none' })
      })
  },

  recalculate() {
    let totalCount = 0
    let totalPrice = 0

    this.data.dishes.forEach((dish) => {
      const count = this.data.cart[dish._id] || 0
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
      count: cart[dish._id] || 0,
      firstChar: (dish.name || '?').slice(0, 1)
    }))
  }
})

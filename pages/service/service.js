const store = require('../../utils/store')

const emptyDishForm = {
  _id: '',
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

function decorateOrders(orders, statusText) {
  return orders.map((order) => ({
    ...order,
    statusLabel: statusText[order.status] || order.status,
    createdAtLabel: formatTime(order.createdAt)
  }))
}

function showError(title, err) {
  console.error(title, err)
  const msg = (err && (err.errMsg || err.message)) || JSON.stringify(err || {})
  wx.showModal({
    title,
    content: `${msg}\n\n请检查云开发控制台是否已创建 dishes / orders 集合，并把权限设为自定义规则 {"read": true, "write": true}`,
    showCancel: false,
    confirmText: '知道了'
  })
}

function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ''
  const pad = (v) => String(v).padStart(2, '0')
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Page({
  data: {
    loading: true,
    dishes: [],
    orders: [],
    dishForm: { ...emptyDishForm },
    editingDishId: '',
    statusText: {
      pending: '待接单',
      accepted: '制作中',
      done: '已完成',
      rejected: '已拒绝'
    }
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  loadData() {
    this.setData({ loading: true })
    return Promise.all([store.listDishes(), store.listAllOrders()])
      .then(([dishes, orders]) => {
        this.setData({
          dishes: decorateDishes(dishes),
          orders: decorateOrders(orders, this.data.statusText),
          loading: false
        })
        this.syncBadge()
      })
      .catch((err) => {
        this.setData({ loading: false })
        showError('加载失败', err)
      })
  },

  syncBadge() {
    store.getPendingCount().then((count) => {
      if (count > 0) {
        wx.setTabBarBadge({ index: 2, text: String(count) })
      } else {
        wx.removeTabBarBadge({ index: 2 })
      }
    }).catch(() => {})
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
      wx.showToast({ title: '请填写菜名和有效价格', icon: 'none' })
      return
    }

    const payload = {
      name,
      category: form.category.trim() || '未分类',
      price,
      description: (form.description || '').trim(),
      image: (form.image || '').trim(),
      available: form.available !== false
    }
    if (form._id) payload._id = form._id

    wx.showLoading({ title: '保存中', mask: true })
    store.saveDish(payload)
      .then(() => {
        wx.hideLoading()
        this.setData({ dishForm: { ...emptyDishForm }, editingDishId: '' })
        wx.showToast({ title: '已保存', icon: 'success' })
        return this.loadData()
      })
      .catch((err) => {
        wx.hideLoading()
        showError('保存失败', err)
      })
  },

  editDish(event) {
    const id = event.currentTarget.dataset.id
    const dish = this.data.dishes.find((item) => item._id === id)
    if (!dish) return

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
    this.setData({ dishForm: { ...emptyDishForm }, editingDishId: '' })
  },

  deleteDish(event) {
    const id = event.currentTarget.dataset.id
    const dish = this.data.dishes.find((item) => item._id === id)
    if (!dish) return

    wx.showModal({
      title: '删除菜品',
      content: `确定删除「${dish.name}」？`,
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) return

        wx.showLoading({ title: '删除中', mask: true })
        store.deleteDish(id)
          .then(() => {
            wx.hideLoading()
            const cancelEdit = this.data.editingDishId === id
            if (cancelEdit) {
              this.setData({ dishForm: { ...emptyDishForm }, editingDishId: '' })
            }
            return this.loadData()
          })
          .catch((err) => {
            wx.hideLoading()
            showError('删除失败', err)
          })
      }
    })
  },

  toggleDish(event) {
    const id = event.currentTarget.dataset.id
    const dish = this.data.dishes.find((item) => item._id === id)
    if (!dish) return

    wx.showLoading({ title: dish.available ? '下架中' : '上架中', mask: true })
    store.saveDish({ ...dish, available: !dish.available })
      .then(() => {
        wx.hideLoading()
        return this.loadData()
      })
      .catch((err) => {
        wx.hideLoading()
        showError('操作失败', err)
      })
  },

  seedDishes() {
    wx.showModal({
      title: '添加示例菜品',
      content: '将插入 4 个默认菜品到云数据库，可在之后编辑或删除。',
      success: (res) => {
        if (!res.confirm) return

        wx.showLoading({ title: '添加中', mask: true })
        store.seedDefaultDishes()
          .then(() => {
            wx.hideLoading()
            return this.loadData()
          })
          .catch((err) => {
            wx.hideLoading()
            showError('添加失败', err)
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

  rejectOrder(event) {
    const id = event.currentTarget.dataset.id
    wx.showModal({
      title: '拒绝订单',
      editable: true,
      placeholderText: '请输入拒绝理由（可留空）',
      confirmText: '确定拒绝',
      confirmColor: '#b4463a',
      success: (res) => {
        if (!res.confirm) return
        const reason = (res.content || '').trim()
        this.updateStatus(id, 'rejected', { rejectReason: reason })
      }
    })
  },

  updateStatus(orderId, status, extra) {
    wx.showLoading({ title: '更新中', mask: true })
    store.updateOrderStatus(orderId, status, extra)
      .then(() => {
        wx.hideLoading()
        return this.loadData()
      })
      .catch((err) => {
        wx.hideLoading()
        showError('更新失败', err)
      })
  },

  clearOrders() {
    wx.showModal({
      title: '清空订单',
      content: '将删除所有订单记录，确定继续？',
      confirmColor: '#c0392b',
      success: (res) => {
        if (!res.confirm) return

        wx.showLoading({ title: '清空中', mask: true })
        store.clearAllOrders()
          .then(() => {
            wx.hideLoading()
            return this.loadData()
          })
          .catch((err) => {
            wx.hideLoading()
            showError('清空失败', err)
          })
      }
    })
  }
})

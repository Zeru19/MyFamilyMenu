const store = require('../../utils/store')

const STATUS_TEXT = {
  pending: '待接单',
  accepted: '制作中',
  done: '已完成',
  rejected: '已拒绝'
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
    orders: []
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && typeof tabBar.refresh === 'function') tabBar.refresh()
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => wx.stopPullDownRefresh())
  },

  loadOrders() {
    const ids = store.getMyOrderIds()
    if (!ids.length) {
      this.setData({ loading: false, orders: [] })
      return Promise.resolve()
    }

    this.setData({ loading: true })
    return store.listOrdersByIds(ids)
      .then((orders) => {
        const byId = new Map(orders.map((o) => [o._id, o]))
        const ordered = ids
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((o) => ({
            ...o,
            statusLabel: STATUS_TEXT[o.status] || o.status,
            createdAtLabel: formatTime(o.createdAt),
            acceptedAtLabel: formatTime(o.acceptedAt),
            doneAtLabel: formatTime(o.doneAt),
            rejectedAtLabel: formatTime(o.rejectedAt)
          }))
        this.setData({ orders: ordered, loading: false })
      })
      .catch((err) => {
        console.error(err)
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  }
})

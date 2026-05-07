const store = require('../utils/store')

const COLOR = '#697077'
const SELECTED_COLOR = '#1f7a5b'

const ICON_TEMPLATES = {
  menu:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="__C__" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2"/>' +
    '<path d="M7 11v11"/>' +
    '<path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Z"/>' +
    '<path d="M21 15v7"/>' +
    '</svg>',
  orders:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="__C__" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>' +
    '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>' +
    '<path d="M12 11h4"/>' +
    '<path d="M12 16h4"/>' +
    '<path d="M8 11h.01"/>' +
    '<path d="M8 16h.01"/>' +
    '</svg>',
  service:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="__C__" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z"/>' +
    '<path d="M20 16a8 8 0 1 0-16 0"/>' +
    '<path d="M12 4v4"/>' +
    '<path d="M10 4h4"/>' +
    '</svg>'
}

function iconDataUrl(template, color) {
  const svg = template.replace(/__C__/g, color)
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const ALL_TABS = [
  { pagePath: '/pages/menu/menu', text: '点餐', iconKey: 'menu', adminOnly: false },
  { pagePath: '/pages/orders/orders', text: '我的订单', iconKey: 'orders', adminOnly: false },
  { pagePath: '/pages/service/service', text: '服务', iconKey: 'service', adminOnly: true }
]

function decorate(tab) {
  const tpl = ICON_TEMPLATES[tab.iconKey]
  return {
    ...tab,
    badge: '',
    iconUrl: iconDataUrl(tpl, COLOR),
    iconUrlActive: iconDataUrl(tpl, SELECTED_COLOR)
  }
}

Component({
  data: {
    color: COLOR,
    selectedColor: SELECTED_COLOR,
    selected: 0,
    list: ALL_TABS.filter((t) => !t.adminOnly).map(decorate)
  },

  attached() {
    this.refresh()
  },

  methods: {
    refresh() {
      const app = getApp()
      const isAdmin = !!(app && app.globalData && app.globalData.isAdmin)
      const list = ALL_TABS
        .filter((t) => !t.adminOnly || isAdmin)
        .map(decorate)

      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      const route = current ? '/' + current.route : ''
      const idx = list.findIndex((t) => t.pagePath === route)
      const selected = idx >= 0 ? idx : 0

      this.setData({ list, selected })
      if (isAdmin) this.refreshBadge()
    },

    refreshBadge() {
      store.getPendingCount().then((count) => {
        const list = this.data.list.map((t) =>
          t.pagePath === '/pages/service/service'
            ? { ...t, badge: count > 0 ? String(count) : '' }
            : t
        )
        this.setData({ list })
      }).catch(() => {})
    },

    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})

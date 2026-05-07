const cloudEnv = require('./cloudEnv')

App({
  globalData: {
    openid: '',
    isAdmin: false,
    roleReady: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: cloudEnv.env,
      traceUser: true
    })
    this.refreshRole()
  },

  refreshRole() {
    return wx.cloud.callFunction({ name: 'getRole' })
      .then((res) => {
        const { openid = '', isAdmin = false } = res.result || {}
        this.globalData.openid = openid
        this.globalData.isAdmin = !!isAdmin
        this.globalData.roleReady = true
        this.notifyTabBar()
      })
      .catch((err) => {
        console.error('getRole failed', err)
        this.globalData.roleReady = true
        this.notifyTabBar()
      })
  },

  notifyTabBar() {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1]
    if (current && typeof current.getTabBar === 'function') {
      const tabBar = current.getTabBar()
      if (tabBar && typeof tabBar.refresh === 'function') tabBar.refresh()
    }
  }
})

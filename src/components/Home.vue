<template>
  <div class="home">
      <el-button type="info" @click="logout" style="float:right">Logout</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      const tokenStr = window.sessionStorage.getItem('token')
      if (tokenStr) {
        // 清空 token
        window.sessionStorage.clear()
        // 跳轉到登入頁
        this.$router.push('./login')
      }
    }
  }
}
</script>

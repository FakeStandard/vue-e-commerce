<template>
  <div class="login_container">
    <div class="login_box">
      <!--頭像-->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!--登入表單-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="80px" class="login_form">
        <!--User-->
        <el-form-item label="User" prop="username">
          <el-input v-model="loginForm.username" placeholder="Please enter your account."></el-input>
        </el-form-item>
        <!--Password-->
        <el-form-item label="Password" prop="password">
          <el-input v-model="loginForm.password" placeholder="Please enter your password." type="password"></el-input>
        </el-form-item>
        <!--Button-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">Login</el-button>
          <el-button type="info" @click="resetLoginForm">Cancel</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 綁定登入表單的資料物件
      loginForm: {
        username: '',
        password: ''
      },
      // 登入表單驗證規則
      loginFormRules: {
        username: [
          { required: true, message: '', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '', trigger: 'blur' },
          { min: 8, max: 16, message: '長度需介於 8-16 字元之間', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置登入表單
    resetLoginForm () {
    //   console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return this.$message.error('驗證失敗')
        this.$message.success('驗證成功')
        const { data: res } = await this.$http.post('users', this.loginForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登入失敗')
        this.$message.success('登入成功')
      })
    }
  }
}
</script>

<style Lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 10px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.login_box .avater_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 5px;
  box-shadow: 0 0 20px rgb(121, 170, 143);
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}

.login_box .avater_box img {
  height: 100%;
  width: 100%;
  border-radius: 50%;
  background-color: rgb(121, 170, 143);
}

.btns {
  display: flex;
  justify-content: flex-end;
}

.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>

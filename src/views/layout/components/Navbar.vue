<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>

    <breadcrumb class="breadcrumb-container"></breadcrumb>

    <div class="right-menu">
      <!-- <error-log class="errLog-container right-menu-item"></error-log>

      <el-tooltip effect="dark" :content="$t('navbar.screenfull')" placement="bottom">
        <screenfull class="screenfull right-menu-item"></screenfull>
      </el-tooltip>

      <lang-select class="international right-menu-item"></lang-select> -->

      <el-tooltip effect="dark" :content="$t('navbar.theme')" placement="bottom">
        <theme-picker class="theme-switch right-menu-item"></theme-picker>
      </el-tooltip>

      <el-dropdown class="avatar-container right-menu-item" trigger="click">
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="avatar+'?imageView2/1/w/80/h/80'">
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/">
            <el-dropdown-item>
              {{$t('navbar.dashboard')}}
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span @click="updatePasswd" style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span @click="logout" style="display:block;">{{$t('navbar.logOut')}}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    <el-dialog :title="'修改密码'" :visible.sync="dialogFormVisible">
      <el-form class="form-container" :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="90px"  style='width: 80%; margin-left:50px;'>
        <el-form-item :label="'原密码'" prop="oldPasswd" >
          <el-input v-model="temp.oldPasswd" :type="passwordType"></el-input>
          <span class="show-pwd" @click="showPwd">
            <svg-icon icon-class="eye" />
          </span>
        </el-form-item>
        <el-form-item :label="'新密码'" prop="password" >
            <el-input v-model="temp.password" :type="passwordType"></el-input>
        </el-form-item>
         <el-form-item :label="'重复密码'" prop="password2" >
            <el-input v-model="temp.password2" :type="passwordType"></el-input>
        </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="handleUpdatePasswd">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
    </div>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import LangSelect from '@/components/LangSelect'
import ThemePicker from '@/components/ThemePicker'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    LangSelect,
    ThemePicker
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value=='') {
        callback(new Error('密码不能为空'))
      }else if (value.length < 6) {
        callback(new Error('密码长度至少为6位'))
      } else {
        callback()
      }
    }
    const validatePassword2 = (rule, value, callback) => {
      if (value=='') {
        callback(new Error('重复密码不能为空'))
      }else if (value.length < 6) {
        callback(new Error('重复密码长度至少为6位'))
      } else if (value !== this.temp.password) {
          callback(new Error('两次输入密码不一致!'));
      } else {
        callback()
      }
    }
    return {
      dialogFormVisible:false,
      passwordType: 'password',
      temp: {
        username: '',
        oldPasswd:'',
        password: '',
        password2:''
      },
      rules: {
        oldPasswd: [{ required: true, message: '原密码不能为空', trigger: 'blur' }],
        password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
        password2: [{ required: true, trigger: 'blur', validator: validatePassword2 }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar'
    ])
  },
  created() {
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    resetTemp() {
      this.temp = {
        username: this.name,
        oldPasswd:'',
        password: '',
        password2:''
      }
    },
    updatePasswd() {
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdatePasswd() {
      this.$store.dispatch('UpdatePasswd',this.temp).then(() => {
        this.dialogFormVisible = false
        this.$message({
              title: '成功',
              message: '密码修改成功，请重新登录',
              type: 'success',
              duration: 2000,
              onClose:function(){
                //this.dialogFormVisible = false
                location.reload()// In order to re-instantiate the vue-router object to avoid bugs
              }
        })  
        })
    }    
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .breadcrumb-container{
    float: left;
  }
  .form-container{
    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      cursor: pointer;
      user-select: none;
    }
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    &:focus{
     outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international{
      vertical-align: top;
    }
    .theme-switch {
      vertical-align: 15px;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        cursor: pointer;
        margin-top: 5px;
        position: relative;
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

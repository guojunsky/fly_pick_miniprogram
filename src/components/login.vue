<template>
  <div class="login">
    <img class="login-ic" src="../static/index/empty.png"/>
    <p class="login-tt">您还未登录，请先登录哦~</p>
    <div class="login-btn" @click="toLogin">登录账户</div>
  </div>
</template>

<script>
export default {
  name: 'login',
  methods: {
    toLogin() {

      uni.navigateTo({url:'/subpackages/login/index'})

    }
  },
}
</script>

<style scoped lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &-ic {
    width: rem(130);
    height: rem(112);
  }

  &-tt {
    margin-top: rem(35);
    margin-bottom: rem(45);
    font-size: rem(28);
    font-weight: 400;
    color: #797B85;
  }

  &-btn {
    display: flex;
    justify-content: center;
    align-items: center;

    width: rem(239);
    height: rem(80);
    background: linear-gradient(90deg, #119CFF 0%, #0060DC 100%);
    box-shadow: 0 rem(2) rem(4) 0 #0265DF;
    border-radius: rem(40);


    font-size: rem(28);
    font-weight: 400;
    color: #FFFFFF;
  }
}
</style>

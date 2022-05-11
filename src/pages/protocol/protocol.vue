<template>
    <view class="rict">
        <rich-text :nodes="content"></rich-text>
    </view>
</template>

<script>
    import {
        protocolApi
    } from '@/api/protocol'
    export default {
        data() {
            return {
                content: ''
            }
        },
        methods: {
            setTitle(title) {
                const titleMap = {
                    'register': '注册协议',
                    'privacy': '隐私协议',
                    'order': '下单协议',
                    'aboutUs': '关于我们',
                }
                const t = titleMap[title]
                uni.setNavigationBarTitle({
                    title: t
                })
            }
        },
        mounted() {
            const next = async () => {
                // console.log(this.$scope.options.filed)
                const type = this.$scope.options.filed || 'register'
                this.setTitle(type)
                const result = await protocolApi.get(type)
                // console.log(result)
                this.content = result.content
            }
            next()

        }
    }
</script>

<style lang="scss">
    .rict {
        padding: 30rpx 32rpx;
    }
</style>

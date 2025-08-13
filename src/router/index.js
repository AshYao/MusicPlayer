import { createRouter, createWebHashHistory } from "vue-router"
import LoginPage from '@/components/LoginPage'
import MusicPlayer from '@/components/MusicPlayer'
import authService from '@/services/auth.js'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage,
        meta: {
            title: "ログイン",
            content: {
                name: "referrer", content: "no-referrer"
            }
        }
    },
    {
        path: '/player',
        name: 'MusicPlayer',
        component: MusicPlayer,
        meta: {
            title: "Music Player",
            requiresAuth: false, // Spotify連携は任意
            content: {
                name: "referrer", content: "no-referrer"
            }
        }
    },
    {
        path: '/callback',
        name: 'SpotifyCallback',
        component: LoginPage, // コールバック処理もLoginPageで行う
        meta: {
            title: "認証処理中",
            content: {
                name: "referrer", content: "no-referrer"
            }
        }
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
    // 認証が必要なルートをチェック
    if (to.meta.requiresAuth && !authService.isLoggedIn()) {
        next('/')
    } else {
        next()
    }
})
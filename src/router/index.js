import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

// importing multiple modules from the file system: https://cn.vitejs.dev/guide/features.html#glob-import
const modules = import.meta.glob('/src/views/**/**.vue')
const _import = (file) => modules[`/src/views/${file}.vue`]
// console.debug('modules', modules)

export const constRouters = [
    { path: '/404', component: _import('error/404'), name: 'NotFound', meta: { hidden: true } },
    { path: '/401', component: _import('error/401'), name: 'NotAuth', meta: { hidden: true } },
    { path: '/', redirect: '/dashboard', meta: { hidden: true } },
    {
        path: '/dashboard',
        component: Layout,
        name: 'Dashboard',
        meta: { icon: 'house', auth: true, },
        children: [{
            path: '',
            // dont't use repeat name
            // who use repeat name first, it will render the first one, and doesn't render the other component
            name: 'DashboardX',
            component: _import('dashboard')
        }],
    },
    {
        path: '/login',
        name: 'Login',
        component: _import('member/login'),
        meta: { hidden: true },
        props: route => ({ redirect: route.query.redirect })
    },
    {
        path: '/register',
        name: 'Register',
        component: _import('member/register'),
        meta: { hidden: true },
        props: route => ({ redirect: route.query.redirect })
    },
    {
        path: '/room',
        component: Layout,
        name: 'Quản lý Phòng',
        meta: { icon: 'Management', dropDown: true, },
        children: [
            {
                path: 'list',
                name: 'Danh Sách Phòng',
                component: _import('room/list'),
                meta: { icon: 'List', auth: true }
            },
        ]
    },
    {
        path: '/villa',
        component: Layout,
        name: 'Quản lý Villa',
        meta: { icon: 'Management', dropDown: true, },
        children: [
            {
                path: 'list',
                name: 'Danh Sách Villa',
                component: _import('villa/list'),
                meta: { icon: 'List', auth: true }
            }
        ]
    },
    {
        path: '/booking',
        component: Layout,
        name: 'Đặt Phòng',
        meta: { icon: 'Service', dropDown: true, },
        children: [
            {
                path: 'list',
                name: 'Danh Sách Đơn Đặt Phòng',
                component: _import('booking/list'),
                meta: { icon: 'List', auth: true }
            },
            {
                path: 'HistoryBooking',
                name: 'Lịch Sử Đặt Phòng',
                component: _import('booking/HistoryBooking'),
                meta: { icon: 'Calendar', auth: true }
            },
            {
                path: 'ConfirmBooking',
                name: 'Xác Nhận Đặt Phòng',
                component: _import('booking/ConfirmBooking'),
                meta: { icon: 'Checked', auth: true }
            },
        ]
    },
    {
        path: '/customer',
        component: Layout,
        name: 'Khách Hàng',
        meta: { icon: 'user', dropDown: true, },
        children: [
            {
                path: 'list',
                name: 'Danh Sách Khách Hàng',
                component: _import('customer/list'),
                meta: { icon: 'List', auth: true }
            }, {
                path: 'InfoContact',
                name: 'Thông tin Liên Hệ',
                component: _import('customer/InfoContact'),
                meta: { icon: 'Iphone', auth: true }
            }, {
                path: 'transactionHistory',
                name: 'Lịch Sử Giao Dịch',
                component: _import('customer/transactionHistory'),
                meta: { icon: 'Calendar', auth: true }
            },
        ]
    },
]

export const asyncRouters = [
    {
        path: '/member',
        component: Layout,
        name: 'Member',
        meta: { icon: 'user', dropDown: true, },
        children: [{
            path: 'profile',
            name: 'Member Profile',
            component: _import('member/profile'),
            meta: { hidden: true, auth: true, permission: ['member:list'] }
        }, {
            path: 'list',
            name: 'Member Manage',
            component: _import('member/list'),
            meta: { icon: 'user', auth: true, permission: ['member:list'] }
        },]
    },
    {
        path: '/role',
        component: Layout,
        name: 'Role',
        meta: { icon: 'user-filled', dropDown: true, },
        children: [{
            path: 'list',
            name: 'Role Manage',
            component: _import('role/list'),
            meta: { icon: 'user-filled', auth: true, permission: ['role:list'] }
        }]
    },
    // {
    //     path: '/imageUpload',
    //     component: Layout,
    //     name: 'Image Upload',
    //     meta: { icon: 'upload', auth: true },
    //     children: [{
    //         path: 'add',
    //         name: 'Image UploadX',
    //         component: _import('imageUpload/add'),
    //     }]
    // },
    {
        path: '/pair',
        component: Layout,
        name: 'Pair',
        meta: { icon: 'setting', auth: true, permission: ['pair:list'] },
        children: [{
            path: 'list',
            name: 'PairX',
            component: _import('pair/list'),
        }]
    },
    {
        path: '/log',
        component: Layout,
        name: 'Log',
        meta: { icon: 'document', auth: true, permission: ['log:list'] },
        children: [{
            path: 'list',
            name: 'LogX',
            component: _import('log/list'),
        }]
    },
]

const defaultRouter = () => createRouter({
    /**
     * History modes: https://router.vuejs.org/zh/guide/essentials/history-mode.html
     * Hash Mode: createWebHashHistory
     * HTML5 Mode: createWebHistory
     */
    history: createWebHistory(),
    routes: constRouters,
    /**
     * Scroll behavior: https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html
     * 
     * @param {*} to 
     * @param {*} from 
     * @param {*} savedPosition 
     * @returns 
     */
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            // always scroll to top
            return {
                top: 0,
                behavior: 'smooth',
            }
        }
    },
})

const router = defaultRouter()

export default router
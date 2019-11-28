import {shallowMount, config, createLocalVue} from '@vue/test-utils'
import VueRouter from 'vue-router'
import iView from 'view-design'
import Vuex from 'vuex'
import VeeValidate from 'vee-validate'
import NamespaceEditDialog from '@/views/namespace/namespace-function/namespace-list/namespace-edit-dialog/NamespaceEditDialog.vue'
import {accountMutations, accountState} from '@/store/account'
import {appMutations, appState} from '@/store/app'
import {veeValidateConfig} from "@/core/validation"
import VueRx from "vue-rx"
import {formDataConfig, NETWORK_CONSTANTS} from "@/config"
import flushPromises from 'flush-promises'
import {
    TransactionType,
    NamespaceName,
    NamespaceId
} from "nem2-sdk"
import {
    mosaicsLoading,
    multisigAccountInfo,
    mosaics,
    CosignWallet
    // @ts-ignore
} from "@@/mock/conf/conf.spec"
import {AppWallet, AppNamespace} from "@/core/model"
// @ts-ignore
const localVue = createLocalVue()
const router = new VueRouter()
localVue.use(VueRouter)
localVue.use(iView)
localVue.use(Vuex)
localVue.use(VeeValidate, veeValidateConfig)
localVue.use(VueRx)
localVue.directive('focus', {
    inserted: function (el, binding) {
        el.focus()
    }
})
// close warning
config.logModifiedComponents = false

let namespace = AppNamespace.fromNamespaceName(
    new NamespaceName(
        new NamespaceId([4082974126, 2563399553]),
        'testnamespace',
    )
)

//@ts-ignore
namespace.expirationInfo = function () {
    return {
        remainingBeforeExpiration: {
            time: ''
        }
    }
},

describe('NamespaceEditDialog', () => {
    let store
    let wrapper
    let state
    beforeEach(() => {
        store = store = new Vuex.Store({
            modules: {
                account: {
                    state: Object.assign(accountState.state, {
                        wallet: CosignWallet,
                        mosaics,
                        multisigAccountInfo
                    }),
                    mutations: accountMutations.mutations
                },
                app: {
                    state: Object.assign(appState.state, {mosaicsLoading}),
                    mutations: appMutations.mutations
                }
            }
        }
        )
        wrapper = shallowMount(NamespaceEditDialog, {
            sync: false,
            mocks: {
                $t: (msg) => msg,
            },
            localVue,
            store,
            router,

            propsData: {
                showNamespaceEditDialog: true,
                currentNamespace: namespace,
            },

        })
    })

    it('Should render', () => {
        expect(wrapper).not.toBeNull()
    })


    it('should create a register namespace transaction with the default values', async () => {
        wrapper.setData({
            formItems: formDataConfig.namespaceEditForm,
        })
        const signTransactionMock = jest.fn(x => x)
        wrapper.vm.signTransaction = signTransactionMock
        wrapper.vm.submit()
        await flushPromises()
        const [{transaction},] = signTransactionMock.mock.calls[0]

        expect(signTransactionMock).toHaveBeenCalledTimes(1)
        expect(transaction.type).toBe(TransactionType.REGISTER_NAMESPACE)
    })


    it('should not create a register namespace transaction with a wrong duration', async () => {
        wrapper.setData({
            formItems: {
                ...formDataConfig.namespaceEditForm,
                duration: NETWORK_CONSTANTS.MAX_NAMESPACE_DURATION + 1,
            },
        })
        const signTransactionMock = jest.fn(x => x)
        wrapper.vm.signTransaction = signTransactionMock
        wrapper.vm.submit()
        await flushPromises()

        expect(signTransactionMock).toHaveBeenCalledTimes(0)
    })
})

/**
 * Copyright 2020 NEM Foundation (https://nem.io)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Account, Password, EncryptedPrivateKey, NetworkType} from 'nem2-sdk'
import {Component, Vue} from 'vue-property-decorator'
import {mapGetters} from 'vuex'

// internal dependencies
import {AccountsModel} from '@/core/database/models/AppAccount'
import {WalletsModel} from '@/core/database/models/AppWallet'
import {ServiceFactory} from '@/services/ServiceFactory'

@Component({
  computed: {...mapGetters({
    networkType: 'network/networkType',
    currentAccount: 'account/currentAccount',
    currentWallett: 'wallet/currentWallet',
  })}
})
export class FormAccountUnlockTs extends Vue {
  /**
   * Current network type
   * @var {NetworkType}
   */
  public networkType: NetworkType

  /**
   * Currently active account
   * @var {AccountsModel}
   */
  public currentAccount: AccountsModel

  /**
   * Currently active wallet
   * @var {WalletsModel}
   */
  public currentWallet: WalletsModel

  /**
   * Form items
   * @var {any}
   */
  public formItems = {
    password: ''
  }

  /**
   * Hook called when the component is mounted
   * @return {void}
   */
  public mounted() {
    
  }

/// region computed properties getter/setter
/// end-region computed properties getter/setter

  /**
   * Attempt decryption of private key to unlock
   * account.
   * @return {void}
   */
  public processVerification() {
    // - get database storage adapter
    const db = ServiceFactory.create('database', this.$store)
    const adapter = db.getAdapter<AccountsModel>()

    // - create encrypted payload for active wallet
    const encrypted = new EncryptedPrivateKey(
      this.currentWallet.values.get('encPrivate'),
      this.currentWallet.values.get('encIv')
    )

    try {
      // - attempt decryption
      const privateKey: string = encrypted.decrypt(new Password(
        this.formItems.password
      ))

      if (privateKey.length === 64) {
        const unlockedAccount = Account.createFromPrivateKey(privateKey, this.networkType)
        return this.$emit('success', unlockedAccount)
      }

      return this.$emit('error', this.$t('invalid_password'))
    }
    catch(e) {
      this.$emit('error', e)
    }
  }
}
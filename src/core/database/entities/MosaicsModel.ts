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
import {MosaicInfo, MosaicFlags, NetworkType, PublicAccount} from 'nem2-sdk'

// internal dependencies
import {DatabaseModel} from '@/core/database/DatabaseModel'
import {DatabaseRelation, DatabaseRelationType} from '@/core/database/DatabaseRelation'

export class MosaicsModel extends DatabaseModel {
  /**
   * Entity identifier *field names*. The identifier
   * is a combination of the values separated by '-'
   * @var {string[]}
   */
  public primaryKeys: string[] = [
    'wallet',
    'hexId',
  ]

  /**
   * Entity relationships
   * @var {Map<string, DatabaseRelation>}
   */
  public relations: Map<string, DatabaseRelation> =  new Map<string, DatabaseRelation>([
    ['wallet', new DatabaseRelation(DatabaseRelationType.ONE_TO_ONE)]
  ])

  /**
   * Instantiate MosaicInfo object
   * @return {MosaicInfo}
   */
  public info(): MosaicInfo {
    const argv: any = Object.assign({}, this.values.get('info'))
    return new MosaicInfo(
      argv.id,
      argv.supply || 0,
      argv.height || 0,
      PublicAccount.createFromPublicKey(argv.owner || '', NetworkType.MIJIN_TEST), // networkType ignored
      argv.revision || 1,
      new MosaicFlags(argv.flags || 0),
      argv.divisibility || 0,
      argv.duration || 0,
    )
  }
}
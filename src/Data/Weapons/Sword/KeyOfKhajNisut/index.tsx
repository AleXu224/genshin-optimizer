import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "KeyOfKhajNisut"
const data_gen = data_gen_json as WeaponData

const emSrc = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024];
const temSrc = [0.002, 0.0025, 0.003, 0.0035, 0.004];
const stacks = [1, 2, 3];
const [condStacksPath, condStacks] = cond(key, "stacks");
const eleMasbuff = prod(input.total.hp, lookup(
  condStacks,
  objectKeyMap(stacks, (stack) =>
    prod(subscript(input.weapon.refineIndex, emSrc), stack)
  ),
  naught
));
const teamEleMasbuff = equal("3", condStacks, prod(
  input.total.hp,
  lookup(
    condStacks,
    objectKeyMap(stacks, (stack) => subscript(input.weapon.refineIndex, temSrc)),
    naught
  )
));

const hpBonus = [0.2, 0.25, 0.3, 0.35, 0.4];
const hp_ = subscript(input.weapon.refineIndex, hpBonus);


const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas: eleMasbuff,
    hp_,
  },
  teamBuff: {
    premod: {
      eleMas: teamEleMasbuff
    }
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [
    {
      header: headerTemplate(key, icon, iconAwaken, st("base")),
      fields: [{node: hp_}],
    },
    {
      path: condStacksPath,
      value: condStacks,
      teamBuff: true,
      header: headerTemplate(key, icon, iconAwaken),
      name: st("hitOp.skill"),
      states: objectKeyMap(stacks, i => ({
        name: st("hits", { count: i}),
        fields: [{node: eleMasbuff }, {node: teamEleMasbuff}]
      }))
    },
  ],
};
export default new WeaponSheet(key, sheet, data_gen, data)

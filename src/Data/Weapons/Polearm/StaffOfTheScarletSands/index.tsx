import type { WeaponData } from "pipeline";
import { input } from "../../../../Formula";
import {
  equal,
  infoMut,
  lookup,
  naught,
  prod,
  subscript,
  sum,
} from "../../../../Formula/utils";
import { WeaponKey } from "../../../../Types/consts";
import { objectKeyMap, range } from "../../../../Util/Util";
import { cond, st } from "../../../SheetUtil";
import { dataObjForWeaponSheet } from "../../util";
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet";
import iconAwaken from "./AwakenIcon.png";
import data_gen_json from "./data_gen.json";
import icon from "./Icon.png";

const key: WeaponKey = "StaffOfTheScarletSands";
const data_gen = data_gen_json as WeaponData;

const emToAtk = [0.52, 0.65, 0.78, 0.91, 1.04];
const bonusEmToAtk = [0.28, 0.35, 0.42, 0.49, 0.56];
const atkBonus1 = prod(
  input.total.eleMas,
  subscript(input.weapon.refineIndex, emToAtk, { key: "_" })
);
const stacks = range(1, 3);
const [hitsCondPath, hitsCond] = cond(key, "hits");
const atkBonus2 = prod(
  input.total.eleMas,
  lookup(
    hitsCond,
    objectKeyMap(stacks, (i) =>
      prod(i, subscript(input.weapon.refineIndex, bonusEmToAtk, { key: "_" }))
    ),
    naught
  )
);

export const data = dataObjForWeaponSheet(key, data_gen, {
  total: {
    atk: sum(atkBonus1, atkBonus2),
  },
});
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [
    {
      header: headerTemplate(key, icon, iconAwaken, st("base")),
      fields: [{ node: infoMut(atkBonus1, { key: "atk" }) }],
    },
    {
      value: hitsCond,
      path: hitsCondPath,
      teamBuff: true,
      header: headerTemplate(key, icon, iconAwaken, st("stacks")),
      name: st("hitOp.none"),
      states: Object.fromEntries(
        range(1, 3).map((i) => [
          i,
          {
            name: st("hits", { count: i }),
            fields: [{ node: infoMut(atkBonus2, { key: "atk" }) }],
          },
        ])
      ),
    },
  ],
};
export default new WeaponSheet(key, sheet, data_gen, data);

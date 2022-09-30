import type { WeaponData } from "pipeline";
import { input, tally } from "../../../../Formula";
import {
  equal,
  lookup,
  prod,
  subscript,
  sum,
  unequal,
} from "../../../../Formula/utils";
import { allElements, WeaponKey } from "../../../../Types/consts";
import { st } from "../../../SheetUtil";
import { dataObjForWeaponSheet } from "../../util";
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet";
import iconAwaken from "./AwakenIcon.png";
import data_gen_json from "./data_gen.json";
import icon from "./Icon.png";

const key: WeaponKey = "AThousandFloatingDreams";
const data_gen = data_gen_json as WeaponData;

const sameEleBuff = [32, 40, 48, 56, 64];
const differentElemeBuff = [0.1, 0.14, 0.18, 0.22, 0.26];
const sameElementCount = lookup(input.charEle, tally, 0);
const differentElementCount = sum(
  sum(...allElements.map((ele) => tally[ele])),
  prod(sameElementCount, -1)
);

const eleMas = prod(
  subscript(input.weapon.refineIndex, sameEleBuff),
  sum(sameElementCount, -1)
);


const dmgBonus = prod(
  subscript(input.weapon.refineIndex, differentElemeBuff),
  differentElementCount
  );

const eleDmg = Object.fromEntries(allElements.map(ele => [
  `${ele}_dmg_`,
  equal(input.charEle, ele, dmgBonus),
  {key: `${ele}_dmg_`}
]));

const teamEmBuff = [40, 42, 44, 46, 48];
const teamEmBuffValue = unequal(input.charKey, input.activeCharKey, subscript(input.weapon.refineIndex, teamEmBuff));

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
    ...eleDmg,
  },
  teamBuff: {
    premod: {
      eleMas: teamEmBuffValue
    }
  }
});
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [
    {
      header: headerTemplate(key, icon, iconAwaken, st("base")),
      fields: [
        {
          node: eleMas,
        },
        ...allElements.map(ele => ({
          node: eleDmg[`${ele}_dmg_`],
        }))
      ],
    },
    {
      teamBuff: true,
      header: headerTemplate(key, icon, iconAwaken, st("teamBuff")),
      canShow: unequal(input.charKey, input.activeCharKey, 1),
      fields: [
        {
          node: teamEmBuffValue
        }
      ]
    }
  ],
};
export default new WeaponSheet(key, sheet, data_gen, data);

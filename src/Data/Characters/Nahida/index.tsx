import { CharacterData } from "pipeline";
import { input, tally } from "../../../Formula";
import {
  compareEq,
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  percent,
  prod,
  subscript,
  sum,
} from "../../../Formula/utils";
import { CharacterKey, ElementKey, Region } from "../../../Types/consts";
import { cond, sgt, st, trans } from "../../SheetUtil";
import CharacterSheet, {
  charTemplates,
  ICharacterSheet,
} from "../CharacterSheet";
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from "../dataUtil";
import assets from "./assets";
import data_gen_src from "./data_gen.json";
import skillParam_gen from "./skillParam_gen.json";

const data_gen = data_gen_src as CharacterData;
const key: CharacterKey = "Nahida";
const elementKey: ElementKey = "dendro";
const regionKey: Region = "sumeru";
const [tr, trm] = trans("char", key);
const ct = charTemplates(key, data_gen.weaponTypeKey, assets);

let a = 0,
  s = 0,
  b = 0;
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    triKarmaDmgAtk: skillParam_gen.skill[s++],
    triKarmaDmgEm: skillParam_gen.skill[s++],
    triKarmaInterval: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    pyro1: skillParam_gen.burst[b++],
    pyro2: skillParam_gen.burst[b++],
    electro1: skillParam_gen.burst[b++],
    electro2: skillParam_gen.burst[b++],
    hydro1: skillParam_gen.burst[b++],
    hydro2: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {},
  constellation1: {},
  constellation2: {},
  constellation4: {},
  constellation6: {},
} as const;

const [burstActivePath, burstActive] = cond(key, "burstActive");

const pyroDmgBonus = equal(
  burstActive,
  "burstActive",
  greaterEq(
    tally.pyro,
    1,
    compareEq(
      tally.pyro,
      1,
      subscript(input.total.burstIndex, datamine.burst.pyro1),
      subscript(input.total.burstIndex, datamine.burst.pyro2)
    )
  ),
  { key: `char_${key}:burstPyro_` }
);

const electroCdDecrease = equal(
  burstActive,
  "burstActive",
  greaterEq(
    tally.electro,
    1,
    compareEq(
      tally.electro,
      1,
      subscript(input.total.burstIndex, datamine.burst.electro1),
      subscript(input.total.burstIndex, datamine.burst.electro2)
    )
  ),
  { key: `char_${key}:burstElectro` }
);

const hydroDuration = equal(
  burstActive,
  "burstActive",
  greaterEq(
    tally.hydro,
    1,
    compareEq(
      tally.hydro,
      1,
      subscript(input.total.burstIndex, datamine.burst.hydro1),
      subscript(input.total.burstIndex, datamine.burst.hydro2)
    )
  ),
  { key: `char_${key}:burstHydro` }
);

const triKarmaDmg = customDmgNode(
  sum(
    prod(
      subscript(input.total.skillIndex, datamine.skill.triKarmaDmgAtk),
      input.total.atk
    ),
    prod(
      subscript(input.total.skillIndex, datamine.skill.triKarmaDmgEm),
      input.total.eleMas
    )
  ),
  "skill",
  {
    premod: {
      all_dmg_: pyroDmgBonus,
    },
  }
);

const dmgFormulas = {
  normal: Object.fromEntries(
    datamine.normal.hitArr.map((arr, i) => [i, dmgNode("atk", arr, "normal")])
  ),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(
    Object.entries(datamine.plunging).map(([key, value]) => [
      key,
      dmgNode("atk", value, "plunging"),
    ])
  ),
  skill: {
    pressDmg: dmgNode("atk", datamine.skill.pressDmg, "skill"),
    holdDmg: dmgNode("atk", datamine.skill.holdDmg, "skill"),
    triKarmaDmg,
  },
  burst: {},
};
const nodeC3 = greaterEq(input.constellation, 3, 3);
const nodeC5 = greaterEq(input.constellation, 5, 3);

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  regionKey,
  data_gen,
  dmgFormulas,
  {
    bonus: {
      skill: nodeC3,
      burst: nodeC5,
    },
    premod: {},
  }
);

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [
      {
        text: tr("auto.fields.normal"),
      },
      {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], {
            key: `char_${key}_gen:auto.skillParams.${i}`,
          }),
        })),
      },
      {
        text: tr("auto.fields.charged"),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.dmg, {
              key: `char_${key}_gen:auto.skillParams.4`,
            }),
          },
          {
            text: tr("auto.skillParams.5"),
            value: datamine.charged.stamina,
          },
        ],
      },
      {
        text: tr("auto.fields.plunging"),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.plunging.dmg, {
              key: "sheet_gen:plunging.dmg",
            }),
          },
          {
            node: infoMut(dmgFormulas.plunging.low, {
              key: "sheet_gen:plunging.low",
            }),
          },
          {
            node: infoMut(dmgFormulas.plunging.high, {
              key: "sheet_gen:plunging.high",
            }),
          },
        ],
      },
    ]),

    skill: ct.talentTemplate("skill", [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.pressDmg, {
              key: `char_${key}_gen:skill.skillParams.0`,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.holdDmg, {
              key: `char_${key}_gen:skill.skillParams.1`,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.triKarmaDmg, {
              key: `char_${key}_gen:skill.skillParams.2`,
            }),
          },
          {
            text: tr("skill.skillParams.3"),
            value: `${datamine.skill.triKarmaInterval}s`,
          },
          {
            text: sgt("duration"),
            value: `${datamine.skill.duration}s`,
          },
          {
            text: sgt("press.cd"),
            value: `${datamine.skill.cd}s`,
          },
          {
            text: sgt("hold.cd"),
            value: `${datamine.skill.cdHold}s`,
          },
        ],
      },
    ]),

    burst: ct.talentTemplate("burst", [
      {
        fields: [],
      },
      ct.conditionalTemplate("burst", {
        path: burstActivePath,
        value: burstActive,
        name: st("afterUse.burst"),
        states: {
          burstActive: {
            fields: [
              {
                node: pyroDmgBonus,
              },
              {
                node: electroCdDecrease,
              },
              {
                node: hydroDuration,
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTemplate("constellation6"),
  },
};

export default new CharacterSheet(sheet, data, assets);

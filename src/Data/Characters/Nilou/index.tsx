import { CharacterData } from "pipeline";
import { input, tally, target } from "../../../Formula";
import { Data } from "../../../Formula/type";
import {
  constant,
  equal,
  frac,
  greaterEq,
  infoMut,
  lookup,
  max,
  min,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
} from "../../../Formula/utils";
import { transformativeReactionLevelMultipliers } from "../../../KeyMap/StatConstants";
import { CharacterKey, ElementKey } from "../../../Types/consts";
import { clamp, range } from "../../../Util/Util";
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

const key: CharacterKey = "Nilou";
const elementKey: ElementKey = "hydro";
const [tr, trm] = trans("char", key);
const ct = charTemplates(key, data_gen.weaponTypeKey, assets);

let a = 0,
  s = 0,
  b = 0;
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    whirlingStep1: skillParam_gen.skill[s++],
    whirlingStep2: skillParam_gen.skill[s++],
    wateryMoon: skillParam_gen.skill[s++],
    waterWheel: skillParam_gen.skill[s++],
    swordDance1: skillParam_gen.skill[s++],
    swordDance2: skillParam_gen.skill[s++],
    tranquilityDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    lunarPrayerDuration: skillParam_gen.skill[s++][0],
    pirouetteDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lingeringDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    em: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    hp: skillParam_gen.passive2[0][0],
    multiplier: skillParam_gen.passive2[1][0],
    maxBuff: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    dmgIncrease: skillParam_gen.constellation1[0][0],
    durationIncrease: skillParam_gen.constellation1[1][0],
  },
  constellation2: {
    resShred: skillParam_gen.constellation2[0][0],
    duration: skillParam_gen.constellation2[1][0],
  },
  constellation4: {
    dmgBuff: skillParam_gen.constellation4[0][0],
    duration: skillParam_gen.constellation4[1][0],
  },
  constellation6: {
    critRate: skillParam_gen.constellation6[0][0],
    critDmg: skillParam_gen.constellation6[1][0],
    maxCritRate: skillParam_gen.constellation6[2][0],
    maxCritDmg: skillParam_gen.constellation6[3][0],
  },
} as const;

const [condA1Path, condA1] = cond(key, "a1");
const a1TeamCond = equal(
  sum(
    greaterEq(tally.dendro, 1, 1),
    greaterEq(tally.dendro, 1, 1),
    equal(tally.ele, 2, 1)
  ),
  3,
  1
);
const a1EmBuff = equal(
  condA1,
  "a1",
  equal(a1TeamCond, 1, constant(datamine.passive1.em))
);

const a2Buff = greaterEq(
  input.asc,
  4,
  min(
    prod(
      max(
        prod(
          percent(0.001),
          sum(input.total.hp, prod(datamine.passive2.hp, -1))
        ),
        percent(0)
      ),
      percent(datamine.passive2.multiplier)
    ),
    percent(datamine.passive2.maxBuff)
  )
);

const bountifulCore = prod(
  subscript(input.lvl, transformativeReactionLevelMultipliers, {
    key: "transformative_level_multi",
  }),
  2,
  sum(one, prod(16, frac(input.total.eleMas, 2000)), a2Buff),
  input.enemy[`dendro_resMulti`]
);

const c1Buff = greaterEq(
  input.constellation,
  1,
  datamine.constellation1.dmgIncrease,
  { key: `char_${key}:constellation1.c1Buff` }
);

const [c2HydroDmgDealtPath, c2HydroDmgDealt] = cond(key, "c2HydroDmgDealt");
const c2HydroShred = greaterEq(
  input.constellation,
  2,
  greaterEq(
    input.asc,
    1,
    equal(c2HydroDmgDealt, "c2HydroDmgDealt", -datamine.constellation2.resShred)
  )
);

const [c2BloomDmgDealtPath, c2BloomDmgDealt] = cond(key, "c2BloomDmgDealt");
const c2DendroShred = greaterEq(
  input.constellation,
  2,
  greaterEq(
    input.asc,
    1,
    equal(c2BloomDmgDealt, "c2BloomDmgDealt", -datamine.constellation2.resShred)
  )
);

const [c4CondPath, c4Cond] = cond(key, "c4Cond");
const c4Buff = greaterEq(
  input.constellation,
  4,
  equal(c4Cond, "c4Cond", datamine.constellation4.dmgBuff)
);

const c6CR = greaterEq(
  input.constellation,
  6,
  max(
    naught,
    min(
      percent(datamine.constellation6.maxCritRate),
      prod(input.total.hp, percent(0.001), datamine.constellation6.critRate)
    )
  )
);

const c6CD = greaterEq(
  input.constellation,
  6,
  max(
    naught,
    min(
      percent(datamine.constellation6.maxCritDmg),
      prod(input.total.hp, percent(0.001), datamine.constellation6.critDmg)
    )
  )
);

const dmgFormulas = {
  normal: Object.fromEntries(
    datamine.normal.hitArr.map((arr, i) => [i, dmgNode("atk", arr, "normal")])
  ),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(
    Object.entries(datamine.plunging).map(([key, value]) => [
      key,
      dmgNode("atk", value, "plunging"),
    ])
  ),
  skill: {
    skillDmg: dmgNode("hp", datamine.skill.skillDmg, "skill"),
    whirlingSteps1: dmgNode("hp", datamine.skill.whirlingStep1, "skill"),
    whirlingSteps2: dmgNode("hp", datamine.skill.whirlingStep2, "skill"),
    wateryMoon: dmgNode("hp", datamine.skill.wateryMoon, "skill", {
      hit: {
        dmgBonus: c1Buff,
      },
    }),
    waterWheel: dmgNode("hp", datamine.skill.waterWheel, "skill"),
    swordDance1: dmgNode("hp", datamine.skill.swordDance1, "skill"),
    swordDance2: dmgNode("hp", datamine.skill.swordDance2, "skill"),
  },
  burst: {
    dmg: dmgNode("hp", datamine.burst.dmg, "burst"),
    lingeringDmg: dmgNode("hp", datamine.burst.lingeringDmg, "burst"),
  },
  passive1: {
    bountifulCore: bountifulCore,
  },
  passive2: {
    a2Buff: a2Buff,
  },
};
const burstC3 = greaterEq(input.constellation, 3, 3);
const skillC5 = greaterEq(input.constellation, 5, 3);
export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  "inazuma",
  data_gen,
  dmgFormulas,
  {
    bonus: {
      skill: skillC5,
      burst: burstC3,
    },
    teamBuff: {
      premod: {
        eleMas: a1EmBuff,
        bloom_dmg_: a2Buff,
        hydro_enemyRes_: c2HydroShred,
        dendro_enemyRes_: c2DendroShred,
      },
    },
    premod: {
      burst_dmg_: c4Buff,
      critRate_: c6CR,
      critDMG_: c6CD,
    },
  }
);

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [
      {
        text: tr("auto.fields.normal"),
      },
      {
        fields: Object.keys(dmgFormulas.normal).map((_, i) => ({
          node: infoMut(dmgFormulas.normal[_], {
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
            node: infoMut(dmgFormulas.charged.dmg1, {
              key: `char_${key}_gen:auto.skillParams.3`,
            }),
          },
          {
            node: infoMut(dmgFormulas.charged.dmg2, {
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
          ...Object.keys(dmgFormulas.skill).map((_, i) => ({
            node: infoMut(dmgFormulas.skill[_], {
              key: `char_${key}_gen:skill.skillParams.${i}`,
            }),
          })),
          {
            text: tr("skill.skillParams.10"),
            value: `${datamine.skill.pirouetteDuration}s`,
          },
          {
            text: tr("skill.skillParams.9"),
            value: `${datamine.skill.lunarPrayerDuration}s`,
          },
          {
            text: tr("skill.skillParams.7"),
            value: `${datamine.skill.tranquilityDuration}s`,
          },
          {
            text: tr("skill.skillParams.8"),
            value: `${datamine.skill.cd}s`,
          },
        ],
      },
      ct.headerTemplate("constellation1", {
        fields: [
          {
            value: `${datamine.constellation1.dmgIncrease * 100}%`,
            text: trm("constellation1.c1Buff"),
          },
          {
            value: `${datamine.constellation1.durationIncrease}s`,
            text: trm("constellation1.c1Duration"),
          },
        ],
      }),
    ]),

    burst: ct.talentTemplate("burst", [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.dmg, {
              key: `char_${key}_gen:burst.skillParams.0`,
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.lingeringDmg, {
              key: `char_${key}_gen:burst.skillParams.1`,
            }),
          },
          {
            text: sgt("cd"),
            value: datamine.burst.cd,
            unit: "s",
          },
          {
            text: sgt("energyCost"),
            value: datamine.burst.enerCost,
          },
        ],
      },
      ct.conditionalTemplate("constellation4", {
        path: c4CondPath,
        value: c4Cond,
        name: trm("constellation4.c4Buff"),
        canShow: greaterEq(input.constellation, 4, 1),
        states: {
          c4Cond: {
            fields: [
              {
                node: c4Buff,
              },
              {
                text: sgt("duration"),
                value: `${datamine.constellation4.duration}s`,
              },
            ],
          },
        },
      }),
    ]),

    passive1: ct.talentTemplate("passive1", [
      ct.conditionalTemplate("passive1", {
        path: condA1Path,
        value: condA1,
        name: trm("passive1.hitByDendro"),
        canShow: equal(a1TeamCond, 1, 1),
        teamBuff: true,
        states: {
          a1: {
            fields: [
              {
                node: a1EmBuff,
              },
              {
                text: sgt("duration"),
                value: `${datamine.passive1.duration}s`,
              },
            ],
          },
        },
      }),
      ct.headerTemplate("passive2", {
        name: tr("passive2.name"),
        teamBuff: true,
        fields: [
          {
            node: infoMut(dmgFormulas.passive2.a2Buff, {
              key: `char_${key}:passive2.a2Buff`,
            }),
          },
        ],
      }),
      {
        fields: [
          {
            node: infoMut(dmgFormulas.passive1.bountifulCore, {
              key: `char_${key}:passive1.bountifulCore`,
            }),
          },
        ],
      },
    ]),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [
      ct.conditionalTemplate("constellation2", {
        path: c2HydroDmgDealtPath,
        value: c2HydroDmgDealt,
        name: trm("constellation2.hydroDmgDealt"),
        teamBuff: true,
        canShow: greaterEq(input.asc, 1, 1),
        states: {
          c2HydroDmgDealt: {
            fields: [
              {
                node: c2HydroShred,
              },
              {
                text: sgt("duration"),
                value: `${datamine.constellation2.duration}s`,
              },
            ],
          },
        },
      }),
      ct.conditionalTemplate("constellation2", {
        path: c2BloomDmgDealtPath,
        value: c2BloomDmgDealt,
        name: trm("constellation2.bloomDmgDealt"),
        teamBuff: true,
        canShow: greaterEq(input.asc, 1, 1),
        states: {
          c2BloomDmgDealt: {
            fields: [
              {
                node: c2DendroShred,
              },
              {
                text: sgt("duration"),
                value: `${datamine.constellation2.duration}s`,
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTemplate("constellation3", [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTemplate("constellation6", [
      ct.headerTemplate("constellation6", {
        name: tr("constellation6.name"),
        fields: [
          {
            node: c6CR,
          },
          {
            node: c6CD,
          },
        ],
      }),
    ]),
  },
};
export default new CharacterSheet(sheet, data, assets);

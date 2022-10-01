import { CharacterData } from "pipeline";
import { input } from "../../../Formula";
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
  subscript,
  sum,
} from "../../../Formula/utils";
import { CharacterKey, ElementKey, Region } from "../../../Types/consts";
import { objectKeyMap, range } from "../../../Util/Util";
import { cond, sgt, st, trans } from "../../SheetUtil";
import CharacterSheet, {
  charTemplates,
  ICharacterSheet,
} from "../CharacterSheet";
import {
  dataObjForCharacterSheet,
  dmgNode,
  healNode,
  shieldElement,
  shieldNode,
} from "../dataUtil";
import assets from "./assets";
import data_gen_src from "./data_gen.json";
import skillParam_gen from "./skillParam_gen.json";

const data_gen = data_gen_src as CharacterData;

const key: CharacterKey = "Layla";
const elementKey: ElementKey = "cryo";
const region: Region = "sumeru";
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
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    starDmg: skillParam_gen.skill[s++],
    shield: skillParam_gen.skill[s++],
    shieldBonus: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    slugDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shieldStr: 0.06,
    maxStacks: 4,
  },
  passive2: {
    dmgInc: 0.015,
  },
  constellation1: {
    shieldStr: 0.2,
    coopShield: 0.35,
  },
  constellation4: {
    dmgInc: 0.05,
    duration: 3,
  },
  constellation6: {
    starDmgInc_: 0.4,
    slugDmgInc_: 0.4,
  },
} as const;

const c1Bonus = greaterEq(
  input.constellation,
  1,
  constant(datamine.constellation1.shieldStr),
  { key: "shield_" }
);

const [c4CondPath, c4Cond] = cond(key, "c4Cond");
const c4BonusNormal = greaterEq(
  input.constellation,
  4,
  equal(
    c4Cond,
    "on",
    prod(percent(datamine.constellation4.dmgInc), input.total.hp)
  )
);
const c4BonusCharged = greaterEq(
  input.constellation,
  4,
  equal(
    c4Cond,
    "on",
    prod(percent(datamine.constellation4.dmgInc), input.total.hp)
  )
);

const a1Stacks = range(1, datamine.passive1.maxStacks);
const [a1CondPath, a1Cond] = cond(key, "a1Cond");
const a1ShieldStr_ = greaterEq(
  input.asc,
  1,
  lookup(
    a1Cond,
    objectKeyMap(a1Stacks, (stacks) =>
      constant(datamine.passive1.shieldStr * stacks)
    ),
    naught,
    { key: "shield_" }
  )
);

const a4Bonus = greaterEq(
  input.asc,
  4,
  prod(input.total.hp, percent(datamine.passive2.dmgInc)),
  { key: `char_${key}:a4Cond` }
);

const skillShield = shieldNode(
  "hp",
  subscript(input.total.skillIndex, datamine.skill.shield),
  subscript(input.total.skillIndex, datamine.skill.shieldBonus),
  {
    premod: {
      shield_: sum(a1ShieldStr_, c1Bonus),
    },
  }
);

const c1Shield = shieldNode(
  "hp",
  prod(
    subscript(input.total.skillIndex, datamine.skill.shield),
    percent(datamine.constellation1.coopShield)
  ),
  subscript(input.total.skillIndex, datamine.skill.shieldBonus)
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
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    starDmg: dmgNode("atk", datamine.skill.starDmg, "skill", {
      hit: {
        dmgInc: a4Bonus,
        dmgBonus: greaterEq(
          input.constellation,
          6,
          datamine.constellation6.starDmgInc_
        ),
      },
    }),
    skillShield,
    skillShieldCryo: shieldElement("cryo", skillShield),
  },
  burst: {
    slugDmg: dmgNode("hp", datamine.burst.slugDmg, "burst", {
      hit: {
        dmgBonus: greaterEq(
          input.constellation,
          6,
          datamine.constellation6.slugDmgInc_
        ),
      },
    }),
  },
  constellation1: {
    c1Shield,
    c1ShieldCryo: shieldElement("cryo", c1Shield),
  },
};

const nodeC3 = greaterEq(input.constellation, 3, 3);
const nodeC5 = greaterEq(input.constellation, 5, 3);

export const data = dataObjForCharacterSheet(
  key,
  elementKey,
  region,
  data_gen,
  dmgFormulas,
  {
    bonus: {
      skill: nodeC3,
      burst: nodeC5,
    },
    premod: {
      normal_dmgInc: c4BonusNormal,
      charged_dmgInc: c4BonusCharged,
    },
  }
);

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
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
            node: infoMut(dmgFormulas.charged.dmg1, {
              key: `char_${key}_gen:auto.skillParams.3`,
            }),
          },
          {
            text: tr("auto.skillParams.4"),
            value: datamine.charged.stamina,
          },
        ],
      },
      {
        text: tr(`auto.fields.plunging`),
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
            node: infoMut(dmgFormulas.skill.dmg, {
              key: `char_${key}_gen:skill.skillParams.0`,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.starDmg, {
              key: `char_${key}_gen:skill.skillParams.1`,
            }),
          },
          {
            node: infoMut(skillShield, {
              key: `char_${key}_gen:skill.skillParams.2`,
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.skillShieldCryo, {
              key: `char_${key}_gen:skill.skillParams.2`,
            }),
          },
          {
            text: sgt("duration"),
            value: datamine.skill.duration,
            unit: "s",
          },
          {
            text: sgt("cd"),
            value: datamine.skill.cd,
            unit: "s",
          },
        ],
      },
    ]),

    burst: ct.talentTemplate("burst", [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.burst.slugDmg, {
              key: `char_${key}_gen:burst.skillParams.0`,
            }),
          },
          {
            text: sgt("duration"),
            value: datamine.burst.duration,
            unit: "s",
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
    ]),

    passive1: ct.talentTemplate("passive1", [
      ct.conditionalTemplate("passive1", {
        path: a1CondPath,
        value: a1Cond,
        name: st("stacks"),
        states: Object.fromEntries(
          a1Stacks.map((i) => [
            i,
            {
              name: st("stack", { count: i }),
              fields: [
                {
                  node: a1ShieldStr_,
                },
              ],
            },
          ])
        ),
      }),
    ]),
    passive2: ct.talentTemplate("passive2", [
      {
        fields: [
          {
            node: a4Bonus,
          },
        ],
      },
    ]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [
      {
        fields: [
          {
            node: c1Bonus,
          },
          {
            node: infoMut(c1Shield, { key: `char_${key}:c1Shield` }),
          },
          {
            node: infoMut(dmgFormulas.constellation1.c1ShieldCryo, {
              key: `char_${key}:c1ShieldCryo`,
            }),
          },
        ],
      },
    ]),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTemplate("constellation4", [
      ct.conditionalTemplate("constellation4", {
        path: c4CondPath,
        value: c4Cond,
        name: trm("c4Cond"),
        states: {
          on: {
            fields: [
              {
                node: c4BonusNormal,
              },
              {
                node: c4BonusCharged,
              },
              {
                text: sgt("duration"),
                value: datamine.constellation4.duration,
                unit: "s",
              }
            ],
          },
        },
      }),
    ]),
    constellation5: ct.talentTemplate("constellation5", [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTemplate("constellation6", [
      {
        fields: [
          {
            text: trm("c6StarDmgInc_"),
            value: datamine.constellation6.starDmgInc_ * 100,
            unit: "%",
          },
          {
            text: trm("c6SlugDmgInc_"),
            value: datamine.constellation6.slugDmgInc_ * 100,
            unit: "%",
          }
        ],
      },
    ]),
  },
};

export default new CharacterSheet(sheet, data, assets);

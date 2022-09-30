import { CharacterData } from "pipeline";
import { input, tally } from "../../../Formula";
import {
  compareEq,
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  min,
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
  b = 0,
  p = 0,
  p2 = 0,
  c1 = 0,
  c2 = 0,
  c4 = 0,
  c6 = 0;
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
  passive1: {
    emShare: skillParam_gen.passive1[p++][0],
    maxEm: skillParam_gen.passive1[p++][0],
  },
  passive2: {
    minEm: skillParam_gen.passive2[p2++][0],
    bonusDmg: skillParam_gen.passive2[p2++][0],
    bonusCR: skillParam_gen.passive2[p2++][0],
    maxBonusDmg: skillParam_gen.passive2[p2++][0],
    maxBonusCR: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    countBonus: skillParam_gen.constellation1[c1++][0],
  },
  constellation2: {
    critRate_: skillParam_gen.constellation2[c2++][0],
    critDmg_: skillParam_gen.constellation2[c2++][0],
    defShred: skillParam_gen.constellation2[c2++][0],
  },
  constellation4: {
    emBuff: skillParam_gen.constellation4[c4++],
  },
  constellation6: {
    dmgAtk: skillParam_gen.constellation6[c6++][0],
    dmgEm: skillParam_gen.constellation6[c6++][0],
    cd: skillParam_gen.constellation6[c6++][0],
    duration: skillParam_gen.constellation6[c6++][0],
  },
} as const;

const c1Cond = greaterEq(
  input.constellation,
  1,
  datamine.constellation1.countBonus
);

const [c2CondPath, c2Cond] = cond(key, "c2Cond");

const c2critRate_ = equal(
  c2Cond,
  "on",
  greaterEq(input.constellation, 2, constant(datamine.constellation2.critRate_))
);

const c2critDMG_ = equal(
  c2Cond,
  "on",
  greaterEq(input.constellation, 2, constant(datamine.constellation2.critDmg_))
);

const [c2DefPath, c2Def] = cond(key, "c2Def");

const c2DefCond = equal(
  c2Cond,
  "on",
  greaterEq(
    input.constellation,
    2,
    equal(c2Def, "on", constant(datamine.constellation2.defShred))
  )
);

const c4BuffRange = range(1, datamine.constellation4.emBuff.length);
const [c4CondPath, c4Cond] = cond(key, "c4Cond");

const c4Buff = greaterEq(
  input.constellation,
  4,
  lookup(
    c4Cond,
    objectKeyMap(c4BuffRange, (i) =>
      constant(datamine.constellation4.emBuff[i - 1])
    ),
    constant(0)
  )
);

const [c6CondPath, c6Cond] = cond(key, "c6Cond");
const c6Atk = greaterEq(
  input.constellation,
  6,
  equal(
    c6Cond,
    "on",
    customDmgNode(
      sum(
        prod(constant(datamine.constellation6.dmgAtk), input.total.atk),
        prod(constant(datamine.constellation6.dmgEm), input.total.eleMas)
      ),
      "skill"
    )
  ),
  { key: `char_${key}:c6Atk` }
);

const [burstActivePath, burstActive] = cond(key, "burstActive");

const pyroDmgBonus = equal(
  burstActive,
  "burstActive",
  greaterEq(
    sum(c1Cond, tally.pyro),
    1,
    compareEq(
      sum(c1Cond, tally.pyro),
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
    sum(c1Cond, tally.electro),
    1,
    compareEq(
      sum(c1Cond, tally.electro),
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
    sum(c1Cond, tally.hydro),
    1,
    compareEq(
      sum(c1Cond, tally.hydro),
      1,
      subscript(input.total.burstIndex, datamine.burst.hydro1),
      subscript(input.total.burstIndex, datamine.burst.hydro2)
    )
  ),
  { key: `char_${key}:burstHydro` }
);

const a4Stacks = greaterEq(
  input.asc,
  4,
  greaterEq(
    input.total.eleMas,
    datamine.passive2.minEm,
    sum(input.total.eleMas, prod(datamine.passive2.minEm, -1))
  )
);

const a4BonusDmg = min(
  prod(a4Stacks, percent(datamine.passive2.bonusDmg)),
  percent(datamine.passive2.maxBonusDmg)
);

const a4BonusCR = min(
  prod(a4Stacks, percent(datamine.passive2.bonusCR)),
  percent(datamine.passive2.maxBonusCR)
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
      all_dmg_: sum(pyroDmgBonus, a4BonusDmg),
      critRate_: a4BonusCR,
    },
  }
);

const a1EmRange = range(1, datamine.passive1.maxEm / 5).map((i) => i * 5);
const [a1EmPath, a1Em] = cond(key, "a1Em");
const a1EmShare = greaterEq(
  input.asc,
  1,
  lookup(
    a1Em,
    objectKeyMap(a1EmRange, (i) => constant(i)),
    0
  )
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
  constellation6: {
    c6Atk,
  },
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
    premod: {
      eleMas: c4Buff,
    },
    teamBuff: {
      premod: {
        eleMas: a1EmShare,
        burning_critRate_: c2critRate_,
        burning_critDMG_: c2critDMG_,
        bloom_critRate_: c2critRate_,
        bloom_critDMG_: c2critDMG_,
        hyperbloom_critRate_: c2critRate_,
        hyperbloom_critDMG_: c2critDMG_,
        burgeon_critRate_: c2critRate_,
        burgeon_critDMG_: c2critDMG_,
      },
      enemy: {
        defIgn: c2DefCond,
      },
    },
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
    passive1: ct.talentTemplate("passive1", [
      ct.conditionalTemplate("passive1", {
        path: a1EmPath,
        value: a1Em,
        name: st("stacks"),
        teamBuff: true,
        states: Object.fromEntries(
          a1EmRange.map((em) => [
            em,
            {
              name: st("stack", { count: em }),
              fields: [
                {
                  node: a1EmShare,
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
            node: infoMut(a4BonusDmg, { key: `char_${key}:a4Dmg_` }),
          },
          {
            node: infoMut(a4BonusCR, { key: `char_${key}:a4CritRate_` }),
          },
        ],
      },
    ]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [
      ct.conditionalTemplate("constellation2", {
        path: c2CondPath,
        value: c2Cond,
        name: trm("c2CondSeed"),
        teamBuff: true,
        states: {
          on: {
            fields: [],
          },
        },
      }),
      ct.conditionalTemplate("constellation2", {
        path: c2DefPath,
        value: c2Def,
        canShow: equal(c2Cond, "on", 1),
        teamBuff: true,
        name: trm("c2Def"),
        states: {
          on: {
            fields: [
              {
                node: c2DefCond,
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTemplate("constellation3", [
      { fields: [{ node: nodeC3 }] },
    ]),
    constellation4: ct.talentTemplate("constellation4", [
      ct.conditionalTemplate("constellation4", {
        path: c4CondPath,
        value: c4Cond,
        name: trm("c4Cond"),
        states: Object.fromEntries(
          c4BuffRange.map((buff) => [
            buff,
            {
              name: st("stack", { count: buff }),
              fields: [
                {
                  node: c4Buff,
                },
              ],
            },
          ])
        ),
      }),
    ]),
    constellation5: ct.talentTemplate("constellation5", [
      { fields: [{ node: nodeC5 }] },
    ]),
    constellation6: ct.talentTemplate("constellation6", [
      ct.conditionalTemplate("constellation6", {
        path: c6CondPath,
        value: c6Cond,
        name: st("hitOp.none"),
        states: {
          on: {
            fields: [
              {
                node: c6Atk,
              },
            ],
          },
        },
      }),
    ]),
  },
};

export default new CharacterSheet(sheet, data, assets);

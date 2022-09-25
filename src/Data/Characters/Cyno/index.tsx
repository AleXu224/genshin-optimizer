import { CharacterData } from "pipeline";
import { input } from "../../../Formula";
import {
  constant,
  equal,
  greaterEq,
  infoMut,
  lookup,
  percent,
  prod,
  subscript,
} from "../../../Formula/utils";
import { CharacterKey } from "../../../Types/consts";
import { range } from "../../../Util/Util";
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

const key: CharacterKey = "Cyno";
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    mortuaryRiteDmg: skillParam_gen.skill[s++],
    pathclearerDurationBonus: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++],
    mortuaryRiteCd: skillParam_gen.skill[s++],
  },
  burst: {
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    hit3: skillParam_gen.burst[b++],
    hit41: skillParam_gen.burst[b++],
    hit42: skillParam_gen.burst[b++],
    hit5: skillParam_gen.burst[b++],
    charged: skillParam_gen.burst[b++],
    stam: skillParam_gen.burst[b++],
    plunge: skillParam_gen.burst[b++],
    plungeLow: skillParam_gen.burst[b++],
    plungeHigh: skillParam_gen.burst[b++],
    emBonus: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++],
    enerCost: skillParam_gen.burst[b++],
  },
  passive1: {
    duststalkerBoltDmg: skillParam_gen.passive1[0][0],
    skillBonus: skillParam_gen.passive1[1][0],
  },
  passive2: {
    naMul: skillParam_gen.passive2[0][0],
    boltMult: skillParam_gen.passive2[1][0],
  },
  constellation2: {
    maxStacks: skillParam_gen.constellation2[0][0],
    elBonus: skillParam_gen.constellation2[1][0],
  },
};

// Passive 1
const [condJudicationPath, condJudication] = cond(key, "judication");
const chasmicSaulfarerBonus = equal(
  condJudication,
  "judication",
  constant(datamine.passive1.skillBonus)
);

function duststalkerBolt() {
  return customDmgNode(
    prod(datamine.passive1.duststalkerBoltDmg, input.total.atk),
    "skill",
    {
      hit: {
        ele: constant("electro"),
        dmgInc: prod(input.total.eleMas, percent(datamine.passive2.boltMult)),
      },
    }
  );
}

// Burst
const [burstActivePath, burstActive] = cond(key, "burstActive");
const elementalMasteryBonus = equal(
  burstActive,
  "burstActive",
  constant(datamine.burst.emBonus[0])
);

function nineBowsBuff(multiPliers: number[]) {
  return customDmgNode(
    prod(subscript(input.total.burstIndex, multiPliers), input.total.atk),
    "normal",
    {
      hit: {
        ele: constant("electro"),
        dmgInc: prod(input.total.eleMas, percent(datamine.passive2.naMul)),
      },
    }
  );
}
function burstAtks(multipliers: number[]) {
  return customDmgNode(
    prod(subscript(input.total.burstIndex, multipliers), input.total.atk),
    "normal",
    {
      hit: {
        ele: constant("electro"),
      },
    }
  );
}

// Constellation 2
const c2Stacks = range(1, datamine.constellation2.maxStacks);
const [c2Path, c2] = cond(key, "c2");
const c2ElBonus = greaterEq(
  input.constellation,
  2,
  prod(
    lookup(
      c2,
      Object.fromEntries(c2Stacks.map((i) => [i, constant(i)])),
      constant(0)
    ),
    datamine.constellation2.elBonus
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
    dmg: dmgNode("atk", datamine.skill.skillDmg, "skill"),
    mortuaryRiteDmg: dmgNode("atk", datamine.skill.mortuaryRiteDmg, "skill"),
  },
  burst: {
    hit1: nineBowsBuff(datamine.burst.hit1),
    hit2: nineBowsBuff(datamine.burst.hit2),
    hit3: nineBowsBuff(datamine.burst.hit3),
    hit41: nineBowsBuff(datamine.burst.hit41),
    hit42: nineBowsBuff(datamine.burst.hit42),
    hit5: nineBowsBuff(datamine.burst.hit5),
    charged: burstAtks(datamine.burst.charged),
    plunge: burstAtks(datamine.burst.plunge),
    plungeLow: burstAtks(datamine.burst.plungeLow),
    plungeHigh: burstAtks(datamine.burst.plungeHigh),
  },
  passive1: {
    duststalkerBolt: duststalkerBolt(),
  },
};
const nodeC3 = greaterEq(input.constellation, 3, 3);
const nodeC5 = greaterEq(input.constellation, 5, 3);

export const data = dataObjForCharacterSheet(
  key,
  "electro",
  "sumeru",
  data_gen,
  dmgFormulas,
  {
    bonus: {
      skill: nodeC5,
      burst: nodeC3,
    },
    // TODO: add premod for normal attacks from passive1
    premod: {
      skill_dmg_: chasmicSaulfarerBonus,
      eleMas: elementalMasteryBonus,
      electro_dmg_: c2ElBonus,
    },
  }
);

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: "electro",
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
            key: `${1 + i + (i < 3 ? 0 : -1)}-Hit DMG `,
          }),
          textSuffix: i === 2 ? "(1)" : i === 3 ? "(2)" : "",
        })),
      },
      {
        text: tr("auto.fields.charged"),
      },
      {
        fields: [
          {
            node: infoMut(dmgFormulas.charged.dmg, {
              key: `char_${key}_gen:auto.skillParams.5`,
            }),
          },
          {
            text: tr("auto.skillParams.6"),
            value: datamine.charged.stamina[0],
          },
        ],
      },
      { text: tr("auto.fields.plunging") },
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
            node: infoMut(dmgFormulas.skill.mortuaryRiteDmg, {
              key: `char_${key}_gen:skill.skillParams.1`,
            }),
          },
          {
            text: tr("skill.skillParams.2"),
            value: `${datamine.skill.pathclearerDurationBonus[0]}s`,
          },
          {
            text: tr("skill.skillParams.3"),
            value: `${datamine.skill.cd[0]}s`,
          },
          {
            text: tr("skill.skillParams.4"),
            value: `${datamine.skill.mortuaryRiteCd[0]}s`,
          },
        ],
      },
    ]),
    burst: ct.talentTemplate("burst", [
      {
        fields: [
          ...Object.keys(dmgFormulas.burst).map((_, i) => ({
            node: infoMut(dmgFormulas.burst[_], {
              key: `char_${key}_gen:burst.skillParams.${i}`,
            }),
          })),
          {
            text: tr("burst.skillParams.10"),
            value: `${datamine.burst.duration[0]}s`,
          },
          {
            text: tr("burst.skillParams.11"),
            value: `${datamine.burst.cd[0]}s`,
          },
          {
            text: tr("burst.skillParams.12"),
            value: `${datamine.burst.enerCost[0]}`,
          },
        ],
      },
      ct.conditionalTemplate("burst", {
        value: burstActive,
        path: burstActivePath,
        name: trm("burst.burstActive"),
        states: {
          burstActive: {
            fields: [
              {
                node: elementalMasteryBonus,
              },
            ],
          },
        },
      }),
    ]),
    passive1: ct.talentTemplate("passive1", [
      ct.conditionalTemplate("passive1", {
        value: condJudication,
        path: condJudicationPath,
        name: trm("a1.judication"),
        states: {
          judication: {
            fields: [
              {
                node: infoMut(dmgFormulas.passive1.duststalkerBolt, {
                  key: `char_${key}_gen:passive1.skillParams.0`,
                }),
              },
              {
                node: chasmicSaulfarerBonus,
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTemplate("passive2", [
      {
        fields: [
          {
            node: infoMut(
              prod(input.total.eleMas, percent(datamine.passive2.naMul)),
              {
                key: `char_${key}_gen:passive2.skillParams.0`,
              }
            ),
          },
          {
            node: infoMut(
              prod(input.total.eleMas, percent(datamine.passive2.boltMult)),
              {
                key: `char_${key}_gen:passive2.skillParams.1`,
              }
            ),
          },
        ],
      },
    ]),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [
      ct.conditionalTemplate("constellation2", {
        value: c2,
        path: c2Path,
        name: st("hits"),
        states: Object.fromEntries(
          c2Stacks.map((c) => [
            c,
            {
              name: st(`${c === 1 ? "hits_one" : "hits_other"}`, {
                count: c,
              }),
              fields: [
                {
                  node: c2ElBonus,
                },
              ],
            },
          ])
        ),
      }),
    ]),
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

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
import { cond, trans } from "../../SheetUtil";
import CharacterSheet, {
  charTemplates,
  ICharacterSheet,
} from "../CharacterSheet";
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from "../dataUtil";
import { banner, card, talentAssets, thumb, thumbSide } from "./assets";
import data_gen_src from "./data_gen.json";

const data_gen = data_gen_src as CharacterData;

const key: CharacterKey = "Cyno";
const [tr, trm] = trans("char", key);
const ct = charTemplates(key, data_gen.weaponTypeKey, talentAssets);

const datamine = {
  normal: {
    hitArr: [
      [
        0.492574, 0.532667, 0.57276, 0.630036, 0.670129, 0.71595, 0.778954,
        0.841957, 0.904961, 0.973692, 1.042423, 1.111154, 1.179886, 1.248617,
        1.317348,
      ], // 1
      [
        0.479209, 0.518215, 0.55722, 0.612942, 0.651947, 0.696525, 0.757819,
        0.819113, 0.880408, 0.947274, 1.01414, 1.081007, 1.147873, 1.21474,
        1.281606,
      ], // 2
      [
        0.293062, 0.316916, 0.34077, 0.374847, 0.398701, 0.425963, 0.463447,
        0.500932, 0.538417, 0.579309, 0.620201, 0.661094, 0.701986, 0.742879,
        0.783771,
      ], // 3.1
      [
        0.293062, 0.316916, 0.34077, 0.374847, 0.398701, 0.425963, 0.463447,
        0.500932, 0.538417, 0.579309, 0.620201, 0.661094, 0.701986, 0.742879,
        0.783771,
      ], // 3.2
      [
        0.758907, 0.820679, 0.88245, 0.970695, 1.032466, 1.103063, 1.200132,
        1.297202, 1.394271, 1.500165, 1.606059, 1.711953, 1.817847, 1.923741,
        2.029635,
      ], // 4
    ],
  },
  charged: {
    dmg: [
      1.161, 1.2555, 1.35, 1.485, 1.5795, 1.6875, 1.836, 1.9845, 2.133, 2.295,
      2.457, 2.619, 2.781, 2.943, 3.105,
    ],
    stamina: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
  },
  plunging: {
    dmg: [
      0.639324, 0.691362, 0.7434, 0.81774, 0.869778, 0.92925, 1.011024,
      1.092798, 1.174572, 1.26378, 1.352988, 1.442196, 1.531404, 1.620612,
      1.70982,
    ],
    low: [
      1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162,
      2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537,
      3.418915,
    ],
    high: [
      1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112,
      2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606,
      4.27041,
    ],
  },
  skill: {
    skillDmg: [
      1.304, 1.4018, 1.4996, 1.63, 1.7278, 1.8256, 1.956, 2.0864, 2.2168,
      2.3472, 2.4776, 2.608, 2.771, 2.934, 3.097,
    ],
    mortuaryRiteDmg: [
      1.568, 1.6856, 1.8032, 1.96, 2.0776, 2.1952, 2.352, 2.5088, 2.6656,
      2.8224, 2.9792, 3.136, 3.332, 3.528, 3.724,
    ],
    pathclearerDurationBonus: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    cd: [
      7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5,
    ],
    mortuaryRiteCd: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  },
  burst: {
    hit1: [
      0.782832, 0.846551, 0.91027, 1.001297, 1.065016, 1.137838, 1.237967,
      1.338097, 1.438227, 1.547459, 1.656691, 1.765924, 1.875156, 1.984389,
      2.093621,
    ],
    hit2: [
      0.824688, 0.891814, 0.95894, 1.054834, 1.12196, 1.198675, 1.304158,
      1.409642, 1.515125, 1.630198, 1.745271, 1.860344, 1.975416, 2.090489,
      2.205562,
    ],
    hit3: [
      1.046336, 1.131503, 1.21667, 1.338337, 1.423504, 1.520837, 1.654671,
      1.788505, 1.922339, 2.068339, 2.214339, 2.36034, 2.50634, 2.652341,
      2.798341,
    ],
    hit41: [
      0.516942, 0.559018, 0.601095, 0.661205, 0.703281, 0.751369, 0.817489,
      0.88361, 0.94973, 1.021861, 1.093993, 1.166124, 1.238256, 1.310387,
      1.382518,
    ],
    hit42: [
      0.516942, 0.559018, 0.601095, 0.661205, 0.703281, 0.751369, 0.817489,
      0.88361, 0.94973, 1.021861, 1.093993, 1.166124, 1.238256, 1.310387,
      1.382518,
    ],
    hit5: [
      1.308447, 1.414948, 1.52145, 1.673595, 1.780096, 1.901812, 2.069172,
      2.236531, 2.403891, 2.586465, 2.769039, 2.951613, 3.134187, 3.316761,
      3.499335,
    ],
    charged: [
      1.0105, 1.09275, 1.175, 1.2925, 1.37475, 1.46875, 1.598, 1.72725, 1.8565,
      1.9975, 2.1385, 2.2795, 2.4205, 2.5615, 2.7025,
    ],
    stam: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
    plunge: [
      0.639324, 0.691362, 0.7434, 0.81774, 0.869778, 0.92925, 1.011024,
      1.092798, 1.174572, 1.26378, 1.352988, 1.442196, 1.531404, 1.620612,
      1.70982,
    ],
    plungeLow: [
      1.278377, 1.382431, 1.486485, 1.635134, 1.739187, 1.858106, 2.02162,
      2.185133, 2.348646, 2.527025, 2.705403, 2.883781, 3.062159, 3.240537,
      3.418915,
    ],
    plungeHigh: [
      1.596762, 1.726731, 1.8567, 2.04237, 2.172339, 2.320875, 2.525112,
      2.729349, 2.933586, 3.15639, 3.379194, 3.601998, 3.824802, 4.047606,
      4.27041,
    ],
    emBonus: [
      100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
    ],
    duration: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    cd: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
    enerCost: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
  },
  passive1: {
    duststalkerBoltDmg: 0.5,
    skillBonus: 0.35,
  },
  passive2: {
    naMul: 1.25,
    boltMult: 2.5,
  },
  constellation2: {
    maxStacks: 5,
    dmgBonus: 0.1,
  }
};

const [condJudicationPath, condJudication] = cond(key, "judication");
const chasmicSaulfarerBonus = equal(
  condJudication,
  "judication",
  constant(datamine.passive1.skillBonus)
);

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

const c2Stacks = range(1, datamine.constellation2.maxStacks);
const [c2Path, c2] = cond(key, "c2");
const c2ElDmgBonus = greaterEq(
  input.constellation,
  2,
  prod(
    lookup(
      c2,
      Object.fromEntries(c2Stacks.map((i) => [i, constant(i)])),
      constant(0)
    ),
    datamine.constellation2.dmgBonus,
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
      electro_dmg_: c2ElDmgBonus,
    },
  }
);

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "electro",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
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
          name: trm("c2.c2Stacks"),
          states: Object.fromEntries(
            c2Stacks.map((c) => [
              c,
              {
                name: `${c}`,
                fields: [
                  {
                    node: c2ElDmgBonus,
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
  },
};
export default new CharacterSheet(sheet, data);

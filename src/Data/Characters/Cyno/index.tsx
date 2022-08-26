import { Skeleton, Typography } from "@mui/material";
import { CharacterData } from "pipeline";
import ColorText from "../../../Components/ColoredText";
import SqBadge from "../../../Components/SqBadge";
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
  sum,
  unequal,
} from "../../../Formula/utils";
import { CharacterKey } from "../../../Types/consts";
import { objectKeyMap } from "../../../Util/Util";
import { cond, st, trans } from "../../SheetUtil";
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
      0.730269, 0.78971, 0.84915, 0.934065, 0.993506, 1.061438, 1.154844,
      1.248251, 1.341657, 1.443555, 1.545453, 1.647351, 1.749249, 1.851147,
      1.953045,
    ],
    hit2: [
      0.769408, 0.832034, 0.89466, 0.984126, 1.046752, 1.118325, 1.216738,
      1.31515, 1.413563, 1.520922, 1.628281, 1.73564, 1.843, 1.950359, 2.057718,
    ],
    hit3: [
      0.976556, 1.056043, 1.13553, 1.249083, 1.32857, 1.419412, 1.544321,
      1.669229, 1.794137, 1.930401, 2.066665, 2.202928, 2.339192, 2.475455,
      2.611719,
    ],
    hit41: [
      0.483028, 0.522344, 0.56166, 0.617826, 0.657142, 0.702075, 0.763858,
      0.82564, 0.887423, 0.954822, 1.022221, 1.08962, 1.15702, 1.224419,
      1.291818,
    ],
    hit42: [
      0.483028, 0.522344, 0.56166, 0.617826, 0.657142, 0.702075, 0.763858,
      0.82564, 0.887423, 0.954822, 1.022221, 1.08962, 1.15702, 1.224419,
      1.291818,
    ],
    hit5: [
      1.220933, 1.320312, 1.41969, 1.561659, 1.661037, 1.774613, 1.930778,
      2.086944, 2.24311, 2.413473, 2.583836, 2.754199, 2.924561, 3.094924,
      3.265287,
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
    naMul: 1,
    boltMult: 2.5,
  },
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

const c2Stacks = [1, 2, 3, 4, 5];
const crIncreaseArr = {
  1: constant(0.03),
  2: constant(0.06),
  3: constant(0.09),
  4: constant(0.12),
  5: constant(0.15),
};
const cdIncreaseArr = {
  1: constant(0.06),
  2: constant(0.12),
  3: constant(0.18),
  4: constant(0.24),
  5: constant(0.3),
};
const [c2Path, c2] = cond(key, "c2");
const crIncrease = greaterEq(
  input.constellation,
  2,
  lookup(c2, crIncreaseArr, constant(0))
);
const cdIncrease = greaterEq(
  input.constellation,
  2,
  lookup(c2, cdIncreaseArr, constant(0))
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
      critRate_: crIncrease,
      critDMG_: cdIncrease,
    },
  }
);

const sheet: ICharacterSheet = {
  name: "Cyno",
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "electro",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: <Typography></Typography>,
  title: <Typography>Cyno</Typography>,
  talent: {
    sheets: {
      auto: {
        name: <text>Invoker's Spear</text>,
        img: talentAssets.auto!,
        sections: [
          {
            text: (
              <Typography>
                <strong>Normal Attack</strong>
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                <text>Performs up to four consecutive spear strikes.</text>
              </Typography>
            ),
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
            text: (
              <Typography>
                <strong>Charged Attack</strong>
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                Consumes a certain amount of Stamina to lunge forward, dealing
                damage to opponents along the way.
              </Typography>
            ),
          },
          {
            fields: [
              {
                node: infoMut(dmgFormulas.charged.dmg, {
                  key: `Charged Attack DMG`,
                }),
              },
              {
                text: <Typography>Charged Attack Stamina Cost</Typography>,
                value: datamine.charged.stamina[0],
              },
            ],
          },
          {
            text: (
              <Typography>
                <strong>Plunging Attack</strong>
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                Plunges from mid-air to strike the ground below, damaging
                opponents along the path and dealing AoE DMG upon impact.
              </Typography>
            ),
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
        ],
      },
      skill: {
        name: <text>Secret Rite: Chasmic Soulfarer</text>,
        img: talentAssets.skill!,
        sections: [
          {
            text: (
              <Typography>
                Performs a swift thrust, dealing{" "}
                <ColorText color="electro">Electro DMG</ColorText> to opponents
                along the path.
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                When Cyno is under the Pactsworn Pathclearer state triggered by
                Sacred Rite: Wolf's Swiftness, he will instead unleash a
                <strong> Mortuary Rite</strong> that deals thunderous{" "}
                <ColorText color="electro">AoE Electro DMG</ColorText> and
                extends the duration of Pactsworn Pathclearer.
              </Typography>
            ),
          },
          {
            fields: [
              {
                node: infoMut(dmgFormulas.skill.dmg, {
                  key: `Skill DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.skill.mortuaryRiteDmg, {
                  key: `Mortuary Rite DMG`,
                }),
              },
              {
                text: (
                  <Typography>Pactsworn Pathclearer Duration Bonus</Typography>
                ),
                value: `${datamine.skill.pathclearerDurationBonus[0]}s`,
              },
              {
                text: <Typography>CD</Typography>,
                value: `${datamine.skill.cd[0]}s`,
              },
              {
                text: <Typography>Mortuary Rite CD</Typography>,
                value: `${datamine.skill.mortuaryRiteCd[0]}s`,
              },
            ],
          },
        ],
      },

      burst: {
        name: <text>Sacred Rite: Wolf's Swiftness</text>,
        img: talentAssets.burst!,
        sections: [
          {
            text: (
              <Typography>
                Calls upon a divine spirit to possess him, morphing into the
                Pactsworn Pathclearer.
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                <strong>Pactsworn Pathclearer</strong>
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                Cyno's Normal, Charged, and Plunging Attacks will be converted
                to <ColorText color="electro">Electro DMG</ColorText> that
                cannot be overriden.
                <ul>
                  <li>
                    Cyno's Elemental Mastery and resistance to interruption will
                    increase, and he gains immunity to Electro-Charged DMG.
                  </li>
                </ul>
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                This effect will be cancelled when Cyno leaves the field and
                lasts a maximum of 18s.
              </Typography>
            ),
          },
          {
            fields: [
              {
                node: infoMut(dmgFormulas.burst.hit1, {
                  key: `1-Hit DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.burst.hit2, {
                  key: `2-Hit DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.burst.hit3, {
                  key: `3-Hit DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.burst.hit41, {
                  key: `4-Hit DMG`,
                }),
                textSuffix: "(1)",
              },
              {
                node: infoMut(dmgFormulas.burst.hit42, {
                  key: `4-Hit DMG`,
                }),
                textSuffix: "(2)",
              },
              {
                node: infoMut(dmgFormulas.burst.hit5, {
                  key: `5-Hit DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.burst.charged, {
                  key: `Charged Attack DMG`,
                }),
              },
              {
                text: <Typography>Charged Attack Stamina Cost</Typography>,
                value: `${datamine.burst.stam[0]}`,
              },
              {
                node: infoMut(dmgFormulas.burst.plunge, {
                  key: `Plunge DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.burst.plungeLow, {
                  key: `Low Plunge DMG`,
                }),
              },
              {
                node: infoMut(dmgFormulas.burst.plungeHigh, {
                  key: `High Plunge DMG`,
                }),
              },
              {
                text: <Typography>Basic Duration</Typography>,
                value: `${datamine.burst.duration[0]}s`,
              },
              {
                text: <Typography>CD</Typography>,
                value: `${datamine.burst.cd[0]}s`,
              },
              {
                text: <Typography>Energy Cost</Typography>,
                value: `${datamine.burst.enerCost[0]}`,
              },
            ],
          },
          ct.conditionalTemplate("burst", {
            value: burstActive,
            path: burstActivePath,
            name: "Burst Active",
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
        ],
      },

      passive1: {
        name: <Typography>Featherfall Judgment</Typography>,
        img: talentAssets.passive1!,
        sections: [
          {
            text: (
              <Typography>
                When Cyno is in the Pactsworn Pathclearer state activated by{" "}
                <strong>Sacred Rite: Wolf's Swiftness</strong>, Cyno will enter
                the Endseer stance at intervals. If he activates{" "}
                <strong>Secret Rite: Chasmic Soulfarer</strong> whle affected by
                this stance, he will activate the Judication effect, increasing
                the DMG of this Secret Rite: Chasmic Soulfarer by 35%, and
                firing off 3 Duststalker Bolts that deal 50% of Cyno's ATK as{" "}
                <ColorText color="electro">Electro DMG</ColorText>.
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                Duststalker Bolt DMG is considered Elemental Skill DMG.
              </Typography>
            ),
          },
          ct.conditionalTemplate("passive1", {
            value: condJudication,
            path: condJudicationPath,
            name: "Judication",
            states: {
              judication: {
                fields: [
                  {
                    node: infoMut(dmgFormulas.passive1.duststalkerBolt, {
                      key: "Duststalker Bolt DMG",
                    }),
                  },
                  {
                    node: chasmicSaulfarerBonus,
                  },
                ],
              },
            },
          }),
        ],
      },
      passive2: {
        name: <Typography>Authority Over the Nine Bows</Typography>,
        img: talentAssets.passive2!,
        sections: [
          {
            text: (
              <Typography>
                Cyno's DMG values will be increased based on his Elemental
                Mastery as follows:
                <ul>
                  <li>
                    Pactsworn Pathclearer's Normal Attack DMG is increased by
                    100% of his Elemental Mastery.
                  </li>
                  <li>
                    Duststalker Bolt DMG from his Ascension Talent Featherfall
                    Judgment is increased by 250% of his Elemental Mastery.
                  </li>
                </ul>
              </Typography>
            ),
          },
          {
            fields: [
              {
                node: infoMut(
                  prod(input.total.eleMas, percent(datamine.passive2.naMul)),
                  {
                    key: "Pactsworn Pathclearer's Normal Attack DMG Increase",
                  }
                ),
              },
              {
                node: infoMut(
                  prod(input.total.eleMas, percent(datamine.passive2.boltMult)),
                  {
                    key: "Duststalker Bolt DMG Increase",
                  }
                ),
              },
            ],
          },
        ],
      },
      passive3: {
        name: <Typography>The Gift of Silence</Typography>,
        img: talentAssets.passive3!,
        sections: [
          {
            text: (
              <Typography>
                Gains 25% more rewards when dispatched on a Sumeru Expedition
                for 20 hours.
              </Typography>
            ),
          },
        ],
      },
      constellation1: {
        name: (
          <Typography>
            <strong>Ordinance: Unceasing Vigil</strong>
          </Typography>
        ),
        img: talentAssets.constellation1!,
        sections: [
          {
            text: (
              <Typography>
                After using <strong>Sacred Rite: Wolf's Swiftness</strong>,
                Cyno's Normal Attack SPD will be increased by 20% for 10s. If
                the Judication effect of the Ascension Talent Featherfall
                Judgment is triggered during{" "}
                <strong>Secret Rite: Chasmic Soulfarer</strong>, the duration of
                this increase will be refreshed. You need to unlock the Passive
                Talent "Featherfall Judgment."
              </Typography>
            ),
          },
        ],
      },
      constellation2: {
        name: (
          <Typography>
            <strong>Ceremony: Homecoming of Spirits</strong>
          </Typography>
        ),
        img: talentAssets.constellation2!,
        sections: [
          {
            text: (
              <Typography>
                When Cyno's Normal Attacks hit opponents, his Normal Attack CRIT
                Rate and CRIT DMG will be increased by 3% and 6% respectively
                for 4s. This effect can be triggered once every 0.1s. Max 5
                stacks. Each stack's duration is counted independently.
              </Typography>
            ),
          },
          ct.conditionalTemplate("constellation2", {
            value: c2,
            path: c2Path,
            name: "Stacks",
            states: Object.fromEntries(
              c2Stacks.map((c) => [
                c,
                {
                  name: `${c}`,
                  fields: [
                    {
                      node: crIncrease,
                    },
                    {
                      node: cdIncrease,
                    },
                  ],
                },
              ])
            ),
          }),
        ],
      },
      constellation3: {
        name: (
          <Typography>
            <strong>Precept: Lawful Enforcer</strong>
          </Typography>
        ),
        img: talentAssets.constellation3!,
        sections: [
          {
            text: (
              <Typography>
                Increases the Level of{" "}
                <strong>Sacred Rite: Wolf's Swiftness</strong> by 3. Maximum
                upgrade level is 15.
              </Typography>
            ),
          },
          { fields: [{ node: nodeC3 }] },
        ],
      },
      constellation4: {
        name: (
          <Typography>
            <strong>Austerity: Forbidding Guard</strong>
          </Typography>
        ),
        img: talentAssets.constellation4!,
        sections: [
          {
            text: (
              <Typography>
                When Cyno is in the Pactsworn Pathclearer state triggered by{" "}
                <strong>Sacred Rite: Wolf's Swiftness</strong>, after he
                triggers Electro-Charged, Overloaded, Quicken, Hyperbloom, an
                Electro Swirl or an Electro Crystallization reaction, he will
                restore 3 Elemental Energy for all nearby party members (except
                himself.)
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                This effect can occur 5 times within one use of{" "}
                <strong>Sacred Rite: Wolf's Swiftness</strong>.
              </Typography>
            ),
          },
        ],
      },
      // constellation5: ct.talentTemplate("constellation5", [
      //   { fields: [{ node: nodeC5 }] },
      // ]),
      constellation5: {
        name: (
          <Typography>
            <strong>Funerary Rite: The Passing of Starlight</strong>
          </Typography>
        ),
        img: talentAssets.constellation5!,
        sections: [
          {
            text: (
              <Typography>
                Increases the Level of{" "}
                <strong>Secret Rite: Chasmic Soulfarer</strong> by 3.
              </Typography>
            ),
          },
          {
            text: <Typography>Maximum upgrade level is 15.</Typography>,
          },
          { fields: [{ node: nodeC5 }] },
        ],
      },
      constellation6: {
        name: (
          <Typography>
            <strong>Raiment: Just Scales</strong>
          </Typography>
        ),
        img: talentAssets.constellation6!,
        sections: [
          {
            text: (
              <Typography>
                After using <strong>Sacred Rite: Wolf's Swiftness</strong> or
                triggering Judication, Cyno will gain 4 stacks of the "Day of
                the Jackal" effect. When he hits opponents with Normal Attacks,
                he will consume 1 stack of "Day of the Jackal" to trigger one
                Duststalker Bolt. Day of the Jackal lasts for 8s. Max 8 stacks.
                1 stack can be consumed every 0.4s. This effect will be canceled
                once Pactsworn Pathclearer ends.
              </Typography>
            ),
          },
          {
            text: (
              <Typography>
                You must unlock the Passive Talent "Featherfall Judgment."
              </Typography>
            ),
          },
        ],
      },
    },
  },
};
export default new CharacterSheet(sheet, data);

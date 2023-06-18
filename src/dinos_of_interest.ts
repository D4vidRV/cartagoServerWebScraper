import { BASESTATSPOSITIONS } from "./interfaces/baseStatsTable";
import { dinoArk } from "./interfaces/dino";

export const dinosOfInterest: dinoArk[] = [
  // *********GIGA R FEMALE ME***********
  {
    name: {
      id: "Gigant_Character_BP_Rockwell_C",
      name: "Gigant_Character_BP_Rockwell_C",
    },
    gender: "Female",
    lvl: {
      min: 50,
      max: 150,
    },
    stat: {
      name: "ME",
      minPoints: 13,
      positionInTable: BASESTATSPOSITIONS.ME,
    },
  },
  // ***********GIGA R MALE HP***************
  {
    name: {
      id: "Gigant_Character_BP_Rockwell_C",
      name: "Gigant_Character_BP_Rockwell_C",
    },
    gender: "Male",
    lvl: {
      min: 20,
      max: 150,
    },
    stat: {
      name: "HP",
      minPoints: 3,
      positionInTable: BASESTATSPOSITIONS.HP,
    },
  },
  // ***********DAEODON FEMALE FO***************
  // {
  //   name: {
  //     id: "Daeodon_Character_BP_C",
  //     name: "Daeodon",
  //   },
  //   gender: "Female",
  //   lvl: {
  //     min: 100,
  //     max: 150,
  //   },
  //   stat: {
  //     name: "FO",
  //     minPoints: 11,
  //     positionInTable: BASESTATSPOSITIONS.FO,
  //   },
  // },
];

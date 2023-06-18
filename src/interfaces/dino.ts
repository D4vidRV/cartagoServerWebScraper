export interface dinoName {
  id: string;
  name: string;
}

export interface dinoStat {
  name: string;
  minPoints: number;
  positionInTable?: number;
}

export interface dinoCords {
  lat: number;
  lng: number;
}

export interface dinoLvl {
  min: number;
  max: number;
}

export interface dinoArk {
  name: dinoName;
  gender: string;
  lvl: dinoLvl;
  stat: dinoStat;
  map?: string;
  cords?: dinoCords;
  indexInTable?: number;
}

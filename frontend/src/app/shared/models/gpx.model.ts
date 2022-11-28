export interface Distance  {
  total: number;
  cumul: number;
}
export interface Elevation {
  max: number;
  min: number;
  pos: number;
  neg: number;
  avg: number;
}

export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number;
  time: Date;
}

export interface GpxWaypoint extends GpxPoint {
  name: string;
  cmt: string;
  desc: string;
}

export interface GpxRoute {
  name: string;
  points: GpxPoint[];
  cmt?: string;
  desc?: string;
  src?: string;
  number?: string;
  link?: string;
  type?: string;
  distance?: Distance;
  elevation?: Elevation;
  slopes: number[];
}

export interface MetaData {
  name: string;
  desc: string;
  link: string;
  author: number;
  time: Date;
}

export interface GpxModel {
  metadata: MetaData;
  waypoints: GpxWaypoint[];
  routes: GpxRoute[];
}

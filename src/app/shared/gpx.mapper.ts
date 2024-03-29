import { GpxMetaData, GpxModel, GpxPoint, GpxPointGroup, GpxWaypoint } from './models/gpx.model';
import { MetaData, Point, Route, Track, Waypoint } from 'gpxparser';

export function mapToGpxPoint(point: Point): GpxPoint {
  return {
    ele: point.ele !== null && isFinite(point.ele) ? point.ele : 0,
    lat: point.lat !== null && isFinite(point.lat) ? point.lat : 0,
    lon: point.lon !== null && isFinite(point.lon) ? point.lon : 0,
    time: point.time,
  };
}

export function mapToGpxWaypoint(point: Waypoint): GpxWaypoint {
  return {
    ...mapToGpxPoint(point),
    name: point.name,
    cmt: point.cmt,
    desc: point.desc,
  };
}

export function mapToGpxTrackOrRoute<T>(trackOrRoute: Track | Route): GpxPointGroup {
  const ret: GpxPointGroup = {
    name: trackOrRoute.name,
    points:
      trackOrRoute.points?.map((p) => mapToGpxPoint(p))?.filter((p) => !(p.lat === 0 && p.lon === 0 && p.ele === 0)) ??
      [],
    desc: trackOrRoute.desc,
    cmt: trackOrRoute.cmt,
    src: trackOrRoute.src,
    number: trackOrRoute.number,
    type: trackOrRoute.type,
  };

  if (trackOrRoute.slopes) {
    ret.slopes = trackOrRoute.slopes.map((s) => (s !== null && isFinite(s) ? s : 0));
  }
  if (trackOrRoute.distance) {
    if (Object.values(trackOrRoute.distance).some((v) => v !== null && isFinite(v))) {
      ret.distance = {
        total:
          trackOrRoute.distance.total !== null && isFinite(trackOrRoute.distance.total)
            ? trackOrRoute.distance.total
            : 0,
        cumul:
          trackOrRoute.distance.cumul !== null && isFinite(trackOrRoute.distance.cumul)
            ? trackOrRoute.distance.cumul
            : 0,
      };
    }
  }
  if (trackOrRoute.elevation) {
    if (Object.values(trackOrRoute.elevation).some((v) => v !== null && isFinite(v))) {
      ret.elevation = {
        min:
          trackOrRoute.elevation.min !== null && isFinite(trackOrRoute.elevation.min) ? trackOrRoute.elevation.min : 0,
        max:
          trackOrRoute.elevation.max !== null && isFinite(trackOrRoute.elevation.max) ? trackOrRoute.elevation.max : 0,
        neg:
          trackOrRoute.elevation.neg !== null && isFinite(trackOrRoute.elevation.neg) ? trackOrRoute.elevation.neg : 0,
        pos:
          trackOrRoute.elevation.pos !== null && isFinite(trackOrRoute.elevation.pos) ? trackOrRoute.elevation.pos : 0,
        avg:
          trackOrRoute.elevation.avg !== null && isFinite(trackOrRoute.elevation.avg) ? trackOrRoute.elevation.avg : 0,
      };
    }
  }
  return ret;
}

export function mapToGpxMetadata(metadata: MetaData): GpxMetaData {
  return {
    name: metadata.name ?? 'Nový nahraný soubor',
    link: metadata.link,
    time: new Date(),
    desc: metadata.desc,
    author: metadata.author,
  };
}

export function mapToGpxPointExport(point: GpxPoint): any {
  const ret = {
    '@': {
      lat: point.lat,
      lon: point.lon,
    },
  } as any;

  if (point.time) {
    ret.time = point.time;
  }
  if (point.ele) {
    ret.ele = point.ele;
  }

  return ret;
}

export function mapToGpxTrack(track: GpxPointGroup): any {
  const ret = {
    name: track.name ?? Math.floor(Math.random() * 1000),
    desc: track.desc ?? '',
    trkseg: {
      trkpt: track.points.map((point) => mapToGpxPointExport(point)),
    },
  } as any;

  if (track.slopes) {
    ret.slopes = track.slopes;
  }

  if (track.distance) {
    ret.distance = {
      total: track.distance.total,
      cumul: track.distance.cumul,
    };
  }
  if (track.elevation) {
    ret.elevation = {
      min: track.elevation.min,
      max: track.elevation.max,
      neg: track.elevation.neg,
      pos: track.elevation.pos,
      avg: track.elevation.avg,
    };
  }

  return ret;
}

export function mapToGpxRoute(route: GpxPointGroup): any {
  const ret = {
    name: route.name ?? Math.floor(Math.random() * 1000),
    desc: route.desc,
    cmt: route.cmt,
    src: route.src,
    number: route.number,
    type: route.type,
    rtept: route.points.map((point) => mapToGpxPointExport(point)),
  } as any;

  if (route.slopes) {
    ret.slopes = route.slopes;
  }

  if (route.distance) {
    ret.distance = {
      total: route.distance.total,
      cumul: route.distance.cumul,
    };
  }
  if (route.elevation) {
    ret.elevation = {
      min: route.elevation.min,
      max: route.elevation.max,
      neg: route.elevation.neg,
      pos: route.elevation.pos,
      avg: route.elevation.avg,
    };
  }

  return ret;
}

export function mapToGpxExport(data: GpxModel): any {
  return {
    '@': {
      version: '1.1',
      creator: 'gpx-web-editor',
    },
    metadata: {
      name: data.metadata.name,
      desc: data.metadata.desc ?? '',
      link: 'https://gpx-web-editor.web.app/',
      author: {
        name: 'gpx-web-editor',
        link: 'https://gpx-web-editor.web.app/',
      },
      time: new Date(),
    },
    wpt: data.waypoints.map((point) => ({
      ...mapToGpxPointExport(point),
      name: point.name ?? '',
      desc: point.desc ?? '',
    })),
    trk: data.tracks.map((track) => mapToGpxTrack(track)),
    rte: data.routes.map((route) => mapToGpxRoute(route)),
  };
}

export function combineGpxFiles(file1: GpxModel, file2: GpxModel): GpxModel {
  return {
    metadata: {
      ...file2.metadata,
      ...file1.metadata,
    },
    routes: [...file1.routes, ...file2.routes],
    tracks: [...file1.tracks, ...file2.tracks],
    waypoints: [...file1.waypoints, ...file2.waypoints],
    permissionData: {},
  };
}
